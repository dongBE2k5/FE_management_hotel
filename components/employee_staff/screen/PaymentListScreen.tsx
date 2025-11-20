import { useHost } from '@/context/HostContext';
import PaymentAPI from '@/service/Payment/PaymentAPI'; // Import API
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert, // ✨ Đã thêm lại Alert
} from 'react-native';

// Interface
interface Payment {
    id: number;
    method: string;
    total: number;
    status: string;
    bookingId: number;
    createdAt?: string;
}

// Cấu hình màu sắc
const paymentStatusConfig = {
    SUCCESS: { text: 'Đã thanh toán', color: '#28a745' },
    WAITING: { text: 'Đang chờ', color: '#fd7e14' },
    CANCELLED: { text: 'Thất bại', color: '#dc3545' },
};

// Format tiền
const formatCurrency = (value) => {
    if (typeof value !== 'number') return '—';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

// Format ngày giờ
const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    } catch (error) {
        return isoString;
    }
};

export default function PaymentListScreen() {
    const navigation = useNavigation();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Logic lấy dữ liệu (GIỮ NGUYÊN)
    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            const fetchPayments = async () => {
                setLoading(true);
                try {
                    const role = await AsyncStorage.getItem('role');
                    let hotelId = null;

                    if (role === "ROLE_EMPLOYEE") {
                        const hotelIdStr = await AsyncStorage.getItem('hotelID');
                        hotelId = hotelIdStr ? Number(hotelIdStr) : null;
                    } else {
                        hotelId = useHost().hotelId;
                    }

                    if (!hotelId) {
                        console.error("Hotel ID không hợp lệ.");
                        if (isMounted) setLoading(false);
                        return;
                    }

                    const paymentsData = await PaymentAPI.getAllPayByHotel(Number(hotelId));

                    if (isMounted) {
                        const sortedData = paymentsData.data.sort((a, b) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                        setPayments(sortedData);
                    }
                    console.log("payment nhận data", paymentsData);
                } catch (error) {
                    console.log("Lỗi khi lấy danh sách thanh toán:", error);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };

            fetchPayments();

            return () => {
                isMounted = false;
            };
        }, [])
    );

    // Logic lọc
    const filteredPayments = useMemo(() => {
        if (filterStatus === 'ALL') return payments;
        return payments.filter(p => p.status === filterStatus);
    }, [payments, filterStatus]);

    // ✨ HÀM XỬ LÝ NÚT BẤM (Đã thêm lại)
 // ✨ HÀM XỬ LÝ NÚT BẤM (Đã sửa)
    const handleConfirmPayment = (paymentId: number) => {
        Alert.alert(
            "Xác nhận thanh toán",
            "Bạn xác nhận đã nhận được tiền chuyển khoản?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xác nhận",
                    onPress: async () => {
                        try {
                            // BƯỚC 1: Gọi API để cập nhật xuống Database trước
                            // Chú ý: Dùng paymentId được truyền vào hàm, không phải p.id
                            await PaymentAPI.updateStatusPayById(paymentId, "SUCCESS");

                            // BƯỚC 2: Nếu API không lỗi, tiến hành cập nhật giao diện (State)
                            setPayments(prev => prev.map(p => 
                                p.id === paymentId ? { ...p, status: 'SUCCESS' } : p
                            ));
                            
                            console.log("Confirmed payment:", paymentId);
                            Alert.alert("Thành công", "Đã cập nhật trạng thái.");

                        } catch (error) {
                            // Xử lý lỗi nếu gọi API thất bại
                            console.log("Lỗi update status:", error);
                            Alert.alert("Thất bại", "Có lỗi xảy ra khi cập nhật trạng thái.");
                        }
                    }
                }
            ]
        );
    };
    // Component Card
    const PaymentCard = ({ item }: { item: Payment }) => {
        const statusInfo = paymentStatusConfig[item.status] || { text: item.status, color: '#6c757d' };
        
        // Điều kiện hiển thị
        const showBankActions = item.method === 'BANK' && item.status === 'WAITING';

        return (
            <View style={styles.card}>
                <View style={styles.cardBody}>
                    <View style={styles.cardRow}>
                        <Text style={styles.bookingId}>Booking #{item.bookingId}</Text>
                        
                        {/* Nhãn "Cần xác nhận" */}
                        {showBankActions ? (
                            <View style={styles.confirmationLabelContainer}>
                                <Text style={styles.confirmationLabelText}>Cần xác nhận</Text>
                            </View>
                        ) : (
                            <Text style={styles.method}>{item.method}</Text>
                        )}
                    </View>

                    {/* Ngày tạo */}
                    <Text style={styles.dateText}>{formatDateTime(item.createdAt)}</Text>

                    <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>

                    {/* ✨ NÚT BẤM XÁC NHẬN (Đã thêm lại) */}
                    {showBankActions && (
                        <TouchableOpacity 
                            style={styles.confirmButton}
                            onPress={() => handleConfirmPayment(item.id)}
                        >
                            <Text style={styles.confirmButtonText}>Xác nhận đã nhận tiền</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.statusFooter, { backgroundColor: statusInfo.color }]}>
                    <Text style={styles.statusText}>{statusInfo.text}</Text>
                </View>
            </View>
        );
    };

    // Component Filter
    const FilterBar = () => {
        const filterOptions = [
            { key: 'ALL', text: 'Tất cả' },
            { key: 'SUCCESS', text: 'Đã thanh toán' },
            { key: 'WAITING', text: 'Đang chờ' },
            { key: 'CANCELLED', text: 'Thất bại' },
        ];

        return (
            <View style={styles.filterContainer}>
                {filterOptions.map((opt) => {
                    const isActive = filterStatus === opt.key;
                    return (
                        <TouchableOpacity
                            key={opt.key}
                            style={[styles.filterButton, isActive && styles.filterButtonActive]}
                            onPress={() => setFilterStatus(opt.key)}
                        >
                            <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                                {opt.text}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#007bff" />
                </TouchableOpacity>
                <Text style={styles.title}>Lịch sử Giao dịch</Text>
                <View style={{ width: 44 }} />
            </View>

            <FilterBar />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            ) : (
                <FlatList
                    data={filteredPayments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <PaymentCard item={item} />}
                    contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={80} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {filterStatus === 'ALL' ? 'Không có giao dịch nào.' : 'Không có giao dịch nào phù hợp.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    
    // Filter Styles
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
    },
    filterButtonActive: { backgroundColor: '#007bff' },
    filterButtonText: { fontSize: 13, color: '#495057', fontWeight: '500' },
    filterButtonTextActive: { color: '#fff', fontWeight: 'bold' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 16, color: '#6c757d', marginTop: 15 },
    
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
    cardBody: { padding: 20 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bookingId: { fontSize: 16, fontWeight: '500', color: '#666' },
    method: { fontSize: 14, fontWeight: 'bold', color: '#007bff', textTransform: 'uppercase' },
    
    // Label Styles
    confirmationLabelContainer: {
        backgroundColor: '#fd7e14',
        borderRadius: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    confirmationLabelText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    
    dateText: { fontSize: 14, color: '#6c757d', marginTop: 4, marginBottom: 5 },
    totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#28a745', marginTop: 5 },

    // ✨ Button Styles (Đã thêm lại)
    confirmButton: {
        backgroundColor: '#007bff',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 15,
    },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    statusFooter: {
        padding: 12,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        alignItems: 'center',
    },
    statusText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});