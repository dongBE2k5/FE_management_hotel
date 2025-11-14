import { useHost } from '@/context/HostContext';
import Room from '@/models/Room';
import { getRoomByHotel } from '@/service/RoomAPI';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const sampleRooms = [
    { id: '101', type: 'Phòng Standard', status: 'occupied', bookingInfo: { guestName: 'Nguyễn Văn A' }, price: 1200000 },
    { id: '102', type: 'Phòng Superior', status: 'available', price: 1500000 },
    { id: '201', type: 'Phòng Deluxe', status: 'maintenance', guest: null },
];

const statusConfig = {
    AVAILABLE: { text: 'Trống', color: '#28a745' },
    USED: { text: 'Có khách', color: '#dc3545' },
    MAINTENANCE: { text: 'Bảo trì', color: '#6c757d' },
};

const RoomCard = ({ room, onPress }) => {
    const statusInfo = statusConfig[room.status];
    if (!statusInfo) return null;
    console.log("room", room);
    return (
        <TouchableOpacity style={styles.roomCard} onPress={onPress}>
            <View style={styles.cardContent}>
                <View style={[styles.statusColorBar, { backgroundColor: statusInfo.color }]} />
                <View style={styles.cardInfo}>
                    <Text style={styles.roomNumber}>Phòng {room.roomNumber}</Text>
                    <Text style={styles.roomType}>{room.type}</Text>
                    {room.status === 'USED' && room.bookingInfo ? (
                        <Text style={styles.guestName}>{room.bookingInfo.guestName}</Text>
                    ) : (
                        <Text style={styles.price}>{room.price?.toLocaleString('vi-VN')}đ</Text>
                    )}
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.statusTag, { backgroundColor: `${statusInfo.color}20` }]}>
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={22} color="#c7c7cc" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const initialRooms = [
    {
        id: '101',
        type: 'Phòng Standard',
        status: 'occupied',
        price: 1200000,
        bookingInfo: {
            guestName: 'Nguyễn Văn A',
            phone: '0901234567',
            checkIn: '14:00 15/10/2025',
            checkOut: '12:00 17/10/2025',
            numberOfGuests: '2 người lớn',
        },
        details: [
            { id: 'dt1_1', icon: 'bed-outline', label: '1 Giường Queen' },
            { id: 'dt1_2', icon: 'people-outline', label: '2 người' },
            { id: 'dt1_3', icon: 'wifi', label: 'Wifi miễn phí' },
        ],
        usedServices: {},
        pastBookings: [
            {
                bookingId: 'booking_003',
                guestName: 'Nguyễn Văn A',
                checkIn: '16:00 01/10/2025',
                checkOut: '10:00 03/10/2025',
                timeline: [
                    { id: 't7', event: 'Check-in', time: '16:00 01/10/2025' },
                    { id: 't8', event: 'Check-out', time: '10:00 03/10/2025' },
                ]
            },
        ]
    },
    {
        id: '102',
        type: 'Phòng Standard',
        status: 'available',
        price: 1200000,
        bookingInfo: null,
        details: [
            { id: 'dt2_1', icon: 'bed-outline', label: '1 Giường Queen' },
            { id: 'dt2_2', icon: 'people-outline', label: '2 người' },
            { id: 'dt2_3', icon: 'wifi', label: 'Wifi miễn phí' },
        ],
        usedServices: {},
        pastBookings: []
    },
    {
        id: '201',
        type: 'Phòng Deluxe',
        status: 'maintenance',
        price: 2500000,
        bookingInfo: null,
        details: [
            { id: 'dt3_1', icon: 'bed-outline', label: '1 Giường King' },
            { id: 'dt3_2', icon: 'people-outline', label: '2 người' },
            { id: 'dt3_3', icon: 'wifi', label: 'Wifi miễn phí' },
        ],
        usedServices: {},
        pastBookings: []
    },
];

export default function RoomListScreen() {
    const { hotelId } = useHost();
    const navigation = useNavigation();
    // const allRooms = route.params?.rooms || sampleRooms;
    const allRooms = initialRooms || sampleRooms;
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

   

    useFocusEffect(
        useCallback(() => {
            if (!hotelId) return;
            fetchRooms(hotelId);
        }, [hotelId])
    );

    const fetchRooms = async (hotelId: number) => {

        const response = await getRoomByHotel(hotelId);
        console.log("response", response);
        setRooms(response);
    };

    // const filteredRooms = useMemo(() => {
    //     let roomsToFilter = allRooms;
    //     switch (activeFilter) {
    //         case 'maintenance': roomsToFilter = allRooms.filter(r => r.status === 'maintenance'); break;
    //         case 'available': roomsToFilter = allRooms.filter(r => r.status === 'available'); break;
    //         case 'occupied': roomsToFilter = allRooms.filter(r => r.status === 'occupied'); break;
    //     }
    //     if (searchQuery.trim()) {
    //         const lowercasedQuery = searchQuery.toLowerCase();
    //         return roomsToFilter.filter(room => {
    //             const guestName = room.bookingInfo ? room.bookingInfo.guestName.toLowerCase() : '';
    //             const roomId = room.id.toLowerCase();
    //             return roomId.includes(lowercasedQuery) || guestName.includes(lowercasedQuery);
    //         });
    //     }
    //     return roomsToFilter;
    // }, [activeFilter, allRooms, searchQuery]);

    const counts = useMemo(() => ({
        all: allRooms.length,
        maintenance: allRooms.filter(r => r.status === 'maintenance').length,
        available: allRooms.filter(r => r.status === 'available').length,
        occupied: allRooms.filter(r => r.status === 'occupied').length,
    }), [allRooms]);

    const percentage = counts.all > 0 ? Math.round((counts.occupied / counts.all) * 100) : 0;

    const FilterButton = ({ name, filterKey }) => (
        <TouchableOpacity
            style={[styles.filterButton, activeFilter === filterKey && styles.filterButtonActive]}
            onPress={() => setActiveFilter(filterKey)}
        >
            <Text style={[styles.filterText, activeFilter === filterKey && styles.filterTextActive]}>{name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Trạng thái phòng</Text>
                    <Text style={styles.headerDate}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AddRoom')}>
                        <Ionicons name="add-circle-outline" size={28} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ManageRoomTypes')}>
                        <Ionicons name="settings-outline" size={26} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.stickyHeader}>
                <View style={styles.occupancyContainer}>
                    <View style={styles.occupancyHeader}>
                        <Text style={styles.occupancyTitle}>Công suất phòng</Text>
                        <Text style={styles.occupancyText}>{counts.occupied} / {counts.all} ({percentage}%)</Text>
                    </View>
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
                    </View>
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={22} color="#888" />
                    <TextInput style={styles.searchInput} placeholder="Tìm phòng, tên khách..." value={searchQuery} onChangeText={setSearchQuery} />
                </View>
            </View>

            <FlatList
                data={rooms}
                keyExtractor={item => item.id.toString()}
                ListHeaderComponent={
                    <View style={styles.filterBar}>
                        <FilterButton name={`Tất cả (${counts.all})`} filterKey="all" />
                        <FilterButton name={`Có khách (${counts.occupied})`} filterKey="occupied" />
                        <FilterButton name={`Trống (${counts.available})`} filterKey="available" />
                        <FilterButton name={`Bảo trì (${counts.maintenance})`} filterKey="maintenance" />
                    </View>
                }
                renderItem={({ item }) => (
                    <RoomCard
                        room={item}
                        onPress={() => navigation.navigate('RoomDetail', { roomId: item.id })}
                    />
                )}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Không có phòng nào.</Text></View>}
                contentContainerStyle={{ paddingHorizontal: 15 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f7fc' },
    header: { backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    headerDate: { fontSize: 16, color: '#6c757d', marginTop: 4 },
    headerActions: { flexDirection: 'row', alignItems: 'center' },
    iconButton: { marginLeft: 15, padding: 5 },
    stickyHeader: { backgroundColor: '#fff', paddingTop: 10, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    occupancyContainer: { marginBottom: 15 },
    occupancyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    occupancyTitle: { fontSize: 15, color: '#6c757d' },
    occupancyText: { fontSize: 15, fontWeight: '600' },
    progressBarBackground: { height: 8, backgroundColor: '#e9ecef', borderRadius: 4 },
    progressBarFill: { height: 8, backgroundColor: '#007bff', borderRadius: 4 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f2f5', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
    searchInput: { flex: 1, height: 48, fontSize: 16, marginLeft: 10 },
    filterBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#e9ecef', borderRadius: 12, padding: 4, marginVertical: 10, marginHorizontal: 5 },
    filterButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    filterButtonActive: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    filterText: { color: '#6c757d', fontWeight: '500' },
    filterTextActive: { color: '#007bff', fontWeight: 'bold' },
    roomCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eef0f3' },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    statusColorBar: { width: 6, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    cardInfo: { flex: 1, padding: 15 },
    roomNumber: { fontSize: 18, fontWeight: '600' },
    roomType: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    guestName: { fontSize: 14, color: '#333', marginTop: 8, fontWeight: '500' },
    price: { fontSize: 14, color: '#28a745', marginTop: 8, fontWeight: '500' },
    cardRight: { flexDirection: 'row', alignItems: 'center', paddingRight: 15 },
    statusTag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 15, marginRight: 10 },
    statusText: { fontWeight: 'bold', fontSize: 12 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6c757d' },
});