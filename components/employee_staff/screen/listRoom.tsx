
import { getAllBookingsByHotelId } from '@/service/BookingAPI';
import { connectAndSubscribeBooking, disconnect } from '@/service/Realtime/BookingWS';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Cấu hình cho các trạng thái
const statusConfig = {
    CHUA_THANH_TOAN: { text: 'Chưa thanh toán', color: '#fd7e14', icon: 'wallet-outline' },
    DA_COC: { text: 'Đã cọc', color: '#17a2b8', icon: 'archive-outline' },
    DA_THANH_TOAN: { text: 'Đã thanh toán', color: '#007bff', icon: 'shield-checkmark-outline' },
    CHECK_IN: { text: 'Đang ở', color: '#6f42c1', icon: 'bed-outline' },
    CHECK_OUT: { text: 'Đã rời đi', color: '#28a745', icon: 'checkmark-done-outline' },
    DA_HUY: { text: 'Đã hủy', color: '#6c757d', icon: 'close-circle-outline' },
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
};

// 🔽 THÊM HÀM MỚI ĐỂ FORMAT NGÀY GIỜ
const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = `0${d.getDate()}`.slice(-2);
    const month = `0${d.getMonth() + 1}`.slice(-2);
    const year = d.getFullYear();
    const hours = `0${d.getHours()}`.slice(-2);
    const minutes = `0${d.getMinutes()}`.slice(-2);
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function ListRoom() {
    // --- LOGIC GỌI API VÀ XỬ LÝ DỮ LIỆU ---
    const mapBookingData = (booking) => ({
        id_booking: booking.id,
        roomInfo: `P${booking.room?.roomNumber || 'N/A'} – ${booking.room?.typeRoom || 'N/A'}`,
        name: booking.user?.fullName || 'Khách vãng lai',
        cccd: booking.user?.cccd || 'N/A', // Thêm trường CCCD
        dateInfo: `Check-in: ${formatDate(booking.checkInDate)} – Check-out: ${formatDate(booking.checkOutDate)}`,
        price: booking.totalPrice || 0,
        amountPaid: booking.amountPaid || 0,
        status: booking.status || 'CHUA_THANH_TOAN',
        createdAt: booking.createdAt || null, // 👈 Đã có
    });

    const [data, setData] = useState([]);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            const fetchBookings = async () => {
                try {
                    const hotelIdStr = await AsyncStorage.getItem('hotelID');
                    const hotelId = hotelIdStr ? Number(hotelIdStr) : null;
                    if (!hotelId) {
                        console.error("Hotel ID không hợp lệ.");
                        return;
                    }
                    const [bookings] = await Promise.all([
                        getAllBookingsByHotelId(hotelId),
                    ]);
    
                    const sortedData = bookings.sort(
                        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                    );
    
                    const formattedData = sortedData.map(mapBookingData);
    
                    setData(formattedData);
                } catch (error) {
                    console.log("Lỗi", error);
                }
            };
    
            const setupWs = async () => {
                connectAndSubscribeBooking({
                    onConnected: () => console.log('✅ WebSocket connected from ListRoom'),
                    onDisconnected: () => console.log('❌ WebSocket disconnected from ListRoom'),
                    onError: (error) => console.error('⚠️ WebSocket error:', error),
                    onMessageReceived: (newRequest) => {
                        console.log("📩 Nhận request realtime:", newRequest);
                        fetchBookings();
                    },
                });
            };
            fetchBookings();
            setupWs();
            return () => {
                isMounted = false;
                disconnect();
            };
        }, [])
        
    );

    const navigation = useNavigation();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState(''); // State cho thanh tìm kiếm

    // 🔽 SỬA LOGIC LỌC (REQUEST 1)
    const { filteredBookings, counts } = useMemo(() => {
        const calculatedCounts = {
            ALL: data.length,
            PENDING_GROUP: data.filter(b => 
                b.status === 'CHUA_THANH_TOAN' || 
                b.status === 'DA_COC' || 
                b.status === 'DA_THANH_TOAN' // 👈 THÊM VÀO ĐÂY
            ).length,
            CHECK_IN: data.filter(b => b.status === 'CHECK_IN').length,
            COMPLETED_GROUP: data.filter(b => b.status === 'CHECK_OUT' || b.status === 'DA_HUY').length,
        };

        let list = data;
        // Lọc theo tab
        switch (activeFilter) {
            case 'PENDING_GROUP':
                list = data.filter(b => 
                    b.status === 'CHUA_THANH_TOAN' || 
                    b.status === 'DA_COC' || 
                    b.status === 'DA_THANH_TOAN' // 👈 THÊM VÀO ĐÂY
                );
                break;
            case 'CHECK_IN':
                list = data.filter(b => b.status === 'CHECK_IN');
                break;
            case 'COMPLETED_GROUP':
                list = data.filter(b => b.status === 'CHECK_OUT' || b.status === 'DA_HUY');
                break;
        }

        // Lọc tiếp theo từ khóa tìm kiếm
        if (searchQuery.trim()) {
            const keyword = searchQuery.toLowerCase();
            list = list.filter(b =>
                b.name.toLowerCase().includes(keyword) ||
                b.cccd.toLowerCase().includes(keyword) ||
                b.roomInfo.toLowerCase().includes(keyword)
            );
        }

        return { filteredBookings: list, counts: calculatedCounts };
    }, [data, activeFilter, searchQuery]);


    // --- GIAO DIỆN MỚI ---

    const FilterButton = ({ title, filterKey, count }) => (
        <TouchableOpacity
            style={[styles.filterButton, activeFilter === filterKey && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filterKey)}
        >
            <Text style={[styles.filterText, activeFilter === filterKey && styles.filterTextActive]}>
                {title} {count !== undefined && `(${count})`}
            </Text>
        </TouchableOpacity>
    );

    // 🔽 SỬA LOGIC PAYMENTPROGRESS (REQUEST 2)
    const PaymentProgress = ({ item }) => {
        const { amountPaid, price, status } = item;
        
        // Luôn hiển thị 100% nếu đã thanh toán, check-in, check-out
        const percentage = useMemo(() => {
            if (status === 'DA_THANH_TOAN' || status === 'CHECK_IN' || status === 'CHECK_OUT') {
                return 100;
            }
            if (price > 0) {
                return (amountPaid / price) * 100;
            }
            return 0;
        }, [status, amountPaid, price]);

        let barColor = '#6c757d';
        if (status === 'DA_COC') barColor = '#17a2b8';
        if (status === 'DA_THANH_TOAN' || status === 'CHECK_IN' || status === 'CHECK_OUT') barColor = '#28a745';

        // Luôn hiển thị số tiền đã trả = tổng tiền nếu đã thanh toán xong
        const paidText = (status === 'DA_THANH_TOAN' || status === 'CHECK_IN' || status === 'CHECK_OUT')
            ? price.toLocaleString('vi-VN')
            : amountPaid.toLocaleString('vi-VN');

        return (
            <View style={styles.paymentContainer}>
                <View style={styles.paymentLabels}>
                    <Text style={styles.paymentText}>Thanh toán</Text>
                    <Text style={styles.paymentAmount}>{paidText} / {price.toLocaleString('vi-VN')}₫</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                </View>
            </View>
        );
    };

    // 🔽 SỬA BOOKINGCARD ĐỂ THÊM CREATEDAT (REQUEST 3)
    const BookingCard = ({ item }) => {
        const statusInfo = statusConfig[item.status] || statusConfig.DA_HUY;
        return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('bookingDetail', { bookingId: item.id_booking })}>
                <View style={styles.cardBody}>
                    <View style={styles.infoRow}><Ionicons name="home-outline" size={20} color="#666" style={styles.infoIcon} /><Text style={styles.roomInfo}>{item.roomInfo}</Text></View>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={20} color="#666" style={styles.infoIcon} />
                        <View>
                            <Text style={styles.guestName}>{item.name}</Text>
                            <Text style={styles.cccdInfo}>CCCD: {item.cccd}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}><Ionicons name="calendar-outline" size={20} color="#666" style={styles.infoIcon} /><Text style={styles.dateInfo}>{item.dateInfo}</Text></View>
                    
                    {/* 🔽 THÊM DÒNG NGÀY TẠO */}
                    <View style={styles.infoRow}>
                        <Ionicons name="create-outline" size={20} color="#666" style={styles.infoIcon} />
                        <Text style={styles.dateInfo}>Ngày tạo: {formatDateTime(item.createdAt)}</Text>
                    </View>

                    <PaymentProgress item={item} />
                </View>
                <View style={[styles.statusFooter, { backgroundColor: statusInfo.color }]}>
                    <Ionicons name={statusInfo.icon} size={16} color="#fff" />
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.title}>Danh sách Booking</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => { /* Navigate to Add Booking screen */ }}>
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.stickyHeader}>
                {/* Thanh tìm kiếm */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={22} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm tên khách, CCCD, số phòng..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                {/* Thanh bộ lọc */}
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        <FilterButton title="Tất cả" filterKey="ALL" count={counts.ALL} />
                        <FilterButton title="Chờ xử lý" filterKey="PENDING_GROUP" count={counts.PENDING_GROUP} />
                        <FilterButton title="Đang ở" filterKey="CHECK_IN" count={counts.CHECK_IN} />
                        <FilterButton title="Hoàn tất" filterKey="COMPLETED_GROUP" count={counts.COMPLETED_GROUP} />
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id_booking.toString()}
                renderItem={BookingCard}
                contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10 }}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Không có booking nào.</Text></View>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    title: { fontSize: 28, fontWeight: 'bold' },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyHeader: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginHorizontal: 15,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        marginLeft: 10,
    },
    filterContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    filterButton: {
        backgroundColor: '#f0f2f5',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    filterButtonActive: {
        backgroundColor: '#007bff1a',
        borderWidth: 1.5,
        borderColor: '#007bff',
    },
    filterText: {
        color: '#333',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#007bff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eef0f3',
        elevation: 3,
        shadowColor: '#a7b0c0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardBody: {
        padding: 20,
        paddingBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 15,
        width: 20,
        marginTop: 2,
    },
    roomInfo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    guestName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    cccdInfo: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    dateInfo: {
        fontSize: 14,
        color: '#333',
    },
    paymentContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    paymentLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    paymentText: {
        fontSize: 13,
        color: '#6c757d',
    },
    paymentAmount: {
        fontSize: 13,
        fontWeight: '500',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 4,
    },
    progressBarFill: {
        height: 8,
        borderRadius: 4,
    },
    statusFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 16, color: '#6c757d', marginTop: 15 },
});