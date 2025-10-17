import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- DỮ LIỆU MOCKUP ĐẦY ĐỦ ---
const mockAllServices = [
    { id: 'sv_laundry', name: 'Giặt ủi (kg)', price: 50000, category: 'INROOM', applicableRoomTypes: ['1', '2', '3'] },
    { id: 'sv_extra_bed', name: 'Giường phụ', price: 200000, category: 'INROOM', applicableRoomTypes: ['2', '3'] },
    { id: 'sv_coke', name: 'Coca-cola', price: 20000, category: 'MINIBAR', applicableRoomTypes: ['1', '2', '3'] },
    { id: 'sv_snack', name: 'Snack khoai tây', price: 25000, category: 'MINIBAR', applicableRoomTypes: ['1', '2', '3'] },
    { id: 'sv_tour', name: 'Tour thành phố', price: 500000, category: 'OUTROOM', applicableRoomTypes: ['3'] },
];

const mockAllRoomTypes = [
    { id: '1', name: 'Phòng Standard', imageUrls: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2874'] },
    { id: '2', name: 'Phòng Deluxe', imageUrls: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2940'] },
    { id: '3', name: 'Phòng Suite', imageUrls: ['https://images.unsplash.com/photo-1568495248636-6412b158929b?q=80&w=2832'] },
];

const mockAllRooms = [
    {
        id: '101', type: 'Phòng Standard', status: 'occupied', price: 1200000,
        bookingInfo: { guestName: 'Nguyễn Văn A', phone: '0901234567', checkIn: '14:00 15/10/2025', checkOut: '12:00 17/10/2025', numberOfGuests: '2 người lớn' },
        details: [{ id: 'dt1_1', icon: 'bed-outline', label: '1 Giường Queen' }, { id: 'dt1_2', icon: 'people-outline', label: '2 người' }, { id: 'dt1_3', icon: 'wifi', label: 'Wifi miễn phí' }],
        usedServices: { 'sv_coke': 2, 'sv_snack': 1 },
        pastBookings: [
            { bookingId: 'booking_003', guestName: 'Nguyễn Văn A', checkIn: '16:00 01/10/2025', checkOut: '10:00 03/10/2025', timeline: [{ id: 't7', event: 'Check-in', time: '16:00 01/10/2025' }, { id: 't8', event: 'Check-out', time: '10:00 03/10/2025' }] },
            { bookingId: 'booking_001', guestName: 'Trần Thị B', checkIn: '14:00 20/09/2025', checkOut: '12:00 22/09/2025', timeline: [{ id: 't1', event: 'Check-in', time: '14:00 20/09/2025' }, { id: 't2', event: 'Dùng dịch vụ giặt ủi', time: '10:30 21/09/2025' }, { id: 't3', event: 'Check-out', time: '12:00 22/09/2025' }] }
        ]
    },
    {
        id: '201', type: 'Phòng Deluxe', status: 'available', price: 2500000,
        bookingInfo: null,
        details: [{ id: 'dt2_1', icon: 'bed-outline', label: '1 Giường King' }, { id: 'dt2_2', icon: 'people-outline', label: '2 người' }, { id: 'dt2_3', icon: 'wifi', label: 'Wifi miễn phí' }],
        usedServices: {}, pastBookings: []
    },
];

// --- NAVIGATION GIẢ ---
const mockNavigation = {
    goBack: () => Alert.alert("Hành động", "Đã nhấn nút quay lại!"),
};

// --- COMPONENT: Bảng thông tin khách ---
const GuestInfoPanel = ({ bookingInfo }) => {
    if (!bookingInfo) return null;

    const InfoRow = ({ icon, label, value }) => (
        <View style={styles.guestPanelRow}>
            <Ionicons name={icon} size={20} color="#495057" style={styles.guestPanelIcon} />
            <Text style={styles.guestPanelLabel}>{label}:</Text>
            <Text style={styles.guestPanelValue}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.guestPanel}>
            <Text style={styles.panelTitle}>Thông tin lưu trú</Text>
            <InfoRow icon="person-circle-outline" label="Tên khách" value={bookingInfo.guestName} />
            <InfoRow icon="call-outline" label="Số điện thoại" value={bookingInfo.phone} />
            <InfoRow icon="log-in-outline" label="Nhận phòng" value={bookingInfo.checkIn} />
            <InfoRow icon="log-out-outline" label="Trả phòng" value={bookingInfo.checkOut} />
            <InfoRow icon="people-outline" label="Số lượng" value={bookingInfo.numberOfGuests} />
        </View>
    );
};

// --- COMPONENT: Modal Chỉnh Sửa Thông Tin ---
const EditInfoModal = ({ visible, onClose, onSave, currentData }) => {
    const [editableData, setEditableData] = useState(null);
    const roomTypes = ['Phòng Standard', 'Phòng Superior', 'Phòng Deluxe', 'Phòng Suite'];

    useEffect(() => {
        if (visible && currentData) {
            setEditableData(currentData);
        }
    }, [currentData, visible]);

    const handleSave = () => {
        const finalData = { ...editableData, price: parseInt(editableData.price, 10) || 0 };
        onSave(finalData);
    };

    if (!editableData) return null;

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Chỉnh sửa thông tin phòng</Text>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <View style={styles.textInputRow}>
                            <Text style={styles.inputLabel}>Số phòng</Text>
                            <TextInput style={styles.textInput} value={editableData.id} onChangeText={text => setEditableData(prev => ({ ...prev, id: text }))} />
                        </View>
                        <View style={styles.textInputRow}>
                            <Text style={styles.inputLabel}>Giá phòng (/đêm)</Text>
                            <TextInput style={styles.textInput} value={String(editableData.price)} onChangeText={text => setEditableData(prev => ({ ...prev, price: text }))} keyboardType="numeric" />
                        </View>
                        <Text style={styles.inputLabel}>Loại phòng</Text>
                        <View style={styles.roomTypeSelectorContainer}>
                            {roomTypes.map(type => (
                                <TouchableOpacity key={type} style={[styles.roomTypeButton, editableData.type === type && styles.roomTypeButtonSelected]} onPress={() => setEditableData(prev => ({ ...prev, type: type }))}>
                                    <Text style={[styles.roomTypeButtonText, editableData.type === type && styles.roomTypeButtonTextSelected]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={onClose}><Text style={styles.editActionButtonText}>Hủy</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={handleSave}><Text style={styles.editActionButtonText}>Lưu thay đổi</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- COMPONENT: Modal Quản lý Dịch Vụ ---
const ServiceManagementModal = ({ visible, onClose, onSave, roomNumber, initialServices, applicableServices, allServices }) => {
    const [selectedServices, setSelectedServices] = useState({});

    useEffect(() => {
        setSelectedServices(initialServices || {});
    }, [visible, initialServices]);

    const MASTER_SERVICES_LIST = useMemo(() => {
        if (!applicableServices || !allServices) return [];
        return allServices.filter(service => (service.applicableRoomTypes || []).includes(applicableServices));
    }, [applicableServices, allServices]);

    const servicesBySection = useMemo(() => {
        const grouped = MASTER_SERVICES_LIST.reduce((acc, service) => {
            const title = service.category;
            if (!acc[title]) acc[title] = [];
            acc[title].push(service);
            return acc;
        }, {});
        return [
            { title: 'IN-ROOM SERVICE', data: grouped['INROOM'] || [] },
            { title: 'MINIBAR', data: grouped['MINIBAR'] || [] },
            { title: 'OUT-ROOM SERVICE', data: grouped['OUTROOM'] || [] },
        ].filter(section => section.data.length > 0);
    }, [MASTER_SERVICES_LIST]);

    const handleQuantityChange = (serviceId, amount) => {
        const currentQuantity = selectedServices[serviceId] || 0;
        const newQuantity = Math.max(0, currentQuantity + amount);
        if (newQuantity > 0) {
            setSelectedServices(prev => ({ ...prev, [serviceId]: newQuantity }));
        } else {
            const { [serviceId]: _, ...rest } = selectedServices;
            setSelectedServices(rest);
        }
    };

    const totalCost = useMemo(() => {
        return Object.entries(selectedServices).reduce((total, [serviceId, quantity]) => {
            const service = MASTER_SERVICES_LIST.find(s => s.id === serviceId);
            return total + ((service?.price || 0) * quantity);
        }, 0);
    }, [selectedServices, MASTER_SERVICES_LIST]);

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { height: '85%' }]}>
                    <Text style={styles.modalTitle}>Dịch vụ phòng {roomNumber}</Text>
                    <SectionList
                        sections={servicesBySection}
                        keyExtractor={(item) => item.id}
                        renderSectionHeader={({ section: { title } }) => <Text style={styles.modalSectionTitle}>{title}</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.serviceItem}>
                                <View><Text style={styles.serviceName}>{item.name}</Text><Text style={styles.servicePrice}>{item.price.toLocaleString('vi-VN')}đ</Text></View>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)} style={styles.quantityButton}><Ionicons name="remove-circle-outline" size={28} color="#dc3545" /></TouchableOpacity>
                                    <Text style={styles.quantityText}>{selectedServices[item.id] || 0}</Text>
                                    <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)} style={styles.quantityButton}><Ionicons name="add-circle" size={28} color="#28a745" /></TouchableOpacity>
                                </View>
                            </View>
                        )}
                        stickySectionHeadersEnabled={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>Loại phòng này không có dịch vụ áp dụng.</Text>}
                    />
                    <View style={styles.summaryContainer}><Text style={styles.summaryText}>Tổng cộng:</Text><Text style={styles.totalCostText}>{totalCost.toLocaleString('vi-VN')}đ</Text></View>
                    <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={onClose}><Text style={styles.editActionButtonText}>Hủy</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={() => onSave(selectedServices, totalCost)}><Text style={styles.editActionButtonText}>Xác nhận</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- COMPONENT: Modal Lịch sử Đa cấp ---
const HistoryModal = ({ visible, onClose, pastBookings }) => {
    const [view, setView] = useState('guestList');
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const guestsWithBookings = useMemo(() => {
        if (!pastBookings) return [];
        const guestMap = new Map();
        pastBookings.forEach(booking => {
            if (!guestMap.has(booking.guestName)) {
                guestMap.set(booking.guestName, []);
            }
            guestMap.get(booking.guestName).push(booking);
        });
        return Array.from(guestMap.entries()).map(([guestName, bookings]) => ({
            guestName,
            bookings,
            lastStay: bookings.sort((a, b) => {
                // A simple way to compare dates in "HH:mm DD/MM/YYYY" format
                const dateA = new Date(a.checkIn.split(' ')[1].split('/').reverse().join('-'));
                const dateB = new Date(b.checkIn.split(' ')[1].split('/').reverse().join('-'));
                return dateB - dateA;
            })[0].checkOut,
        }));
    }, [pastBookings]);

    useEffect(() => {
        if (!visible) {
            setTimeout(() => { // Add a small delay to avoid flicker
                setView('guestList');
                setSelectedGuest(null);
                setSelectedBooking(null);
            }, 300);
        }
    }, [visible]);

    const handleSelectGuest = (guest) => {
        if (guest.bookings.length === 1) {
            setSelectedGuest(guest);
            setSelectedBooking(guest.bookings[0]);
            setView('timeline');
        } else {
            setSelectedGuest(guest);
            setView('stayList');
        }
    };

    const handleBack = () => {
        if (view === 'timeline') {
            if (selectedGuest && selectedGuest.bookings.length === 1) {
                setView('guestList');
            } else {
                setView('stayList');
            }
        } else if (view === 'stayList') {
            setView('guestList');
        }
    };

    const renderGuestList = () => (
        <>
            <Text style={styles.modalTitle}>Khách hàng đã ở</Text>
            <FlatList
                data={guestsWithBookings}
                keyExtractor={item => item.guestName}
                ListEmptyComponent={<Text style={styles.emptyText}>Chưa có lịch sử khách ở.</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => handleSelectGuest(item)}>
                        <View>
                            <Text style={styles.listItemTitle}>{item.guestName}</Text>
                            <Text style={styles.listItemSubtitle}>Lần ở gần nhất: {item.lastStay}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#ccc" />
                    </TouchableOpacity>
                )}
            />
        </>
    );

    const renderStayList = () => (
        <>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
                    <Ionicons name="arrow-back" size={24} color="#007bff" />
                    <Text style={styles.modalBackButtonText}>Tất cả khách</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{selectedGuest?.guestName}</Text>
            <Text style={styles.modalSubtitle}>Chọn một lần ở để xem chi tiết</Text>
            <FlatList
                data={selectedGuest?.bookings}
                keyExtractor={item => item.bookingId}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.listItem} onPress={() => { setSelectedBooking(item); setView('timeline'); }}>
                        <View>
                            <Text style={styles.listItemTitle}>Từ: {item.checkIn}</Text>
                            <Text style={styles.listItemSubtitle}>Đến: {item.checkOut}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={22} color="#ccc" />
                    </TouchableOpacity>
                )}
            />
        </>
    );

    const renderTimeline = () => (
        <>
            <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
                    <Ionicons name="arrow-back" size={24} color="#007bff" />
                    <Text style={styles.modalBackButtonText}>{selectedGuest?.bookings.length > 1 ? 'Các lần ở' : 'Tất cả khách'}</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Chi tiết lần ở</Text>
            <Text style={styles.modalSubtitle}>{selectedBooking?.checkIn} - {selectedBooking?.checkOut}</Text>
            <FlatList
                data={selectedBooking?.timeline}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.timelineItem}>
                        <Ionicons name="time-outline" size={20} color="#888" />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineEvent}>{item.event}</Text>
                            <Text style={styles.timelineTime}>{item.time}</Text>
                        </View>
                    </View>
                )}
            />
        </>
    );

    const renderContent = () => {
        if (view === 'stayList') return renderStayList();
        if (view === 'timeline') return renderTimeline();
        return renderGuestList();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { height: '85%' }]}>
                    {renderContent()}
                    <TouchableOpacity style={[styles.editActionButton, styles.cancelButton, { marginTop: 15 }]} onPress={onClose}>
                        <Text style={styles.editActionButtonText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --- COMPONENT: Bảng Điều Khiển ---
const ActionPanel = ({ status, onPress }) => {
    const ActionButton = ({ title, icon, color, onPressAction }) => (
        <TouchableOpacity style={[styles.panelButton, { backgroundColor: color }]} onPress={onPressAction}>
            <Ionicons name={icon} size={20} color="#fff" />
            <Text style={styles.panelButtonText}>{title}</Text>
        </TouchableOpacity>
    );

    const renderActions = () => {
        switch (status) {
            case 'available':
                return <ActionButton title="Bảo trì phòng" icon="build-outline" color="#6c757d" onPressAction={() => onPress('Start Maintenance')} />;
            case 'occupied':
                return <ActionButton title="Quản lý Dịch vụ" icon="options-outline" color="#20c997" onPressAction={() => onPress('Manage Services')} />;
            case 'maintenance':
                return <ActionButton title="Hoàn tất bảo trì" icon="checkmark-done-outline" color="#28a745" onPressAction={() => onPress('Finish Maintenance')} />;
            default:
                return null;
        }
    };

    return (
        <View style={styles.panel}>
            <Text style={styles.panelTitle}>Hành động</Text>
            <View style={styles.panelGrid}>
                {renderActions()}
            </View>
        </View>
    );
};

// --- COMPONENT: Huy hiệu Trạng Thái ---
const StatusBadge = ({ status }) => {
    const statusConfig = {
        available: { text: 'Phòng Trống', color: '#28a745' },
        occupied: { text: 'Đang Có Khách', color: '#dc3545' },
        maintenance: { text: 'Bảo trì', color: '#6c757d' },
    };
    const config = statusConfig[status];
    if (!config) return null;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            <Text style={styles.statusBadgeText}>{config.text}</Text>
        </View>
    );
};

// --- MÀN HÌNH CHÍNH ---
export default function RoomDetailScreen({ route, navigation = mockNavigation }) {
    const {
        roomId = '101', // Mặc định hiển thị phòng 101 (có khách)
        allRooms = mockAllRooms,
        allRoomTypes = mockAllRoomTypes,
        allServices = mockAllServices,
    } = route?.params || {};

    const currentRoomData = allRooms.find(r => r.id === roomId);

    if (!currentRoomData) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}><Ionicons name="arrow-back-circle" size={40} color="#333" /></TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, color: '#6c757d' }}>Không tìm thấy phòng {roomId}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const currentRoomType = allRoomTypes.find(rt => rt.name === currentRoomData.type);

    const [roomData, setRoomData] = useState(currentRoomData);
    const [roomStatus, setRoomStatus] = useState(currentRoomData.status);
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [isHistoryModalVisible, setHistoryModalVisible] = useState(false);
    const [isServiceModalVisible, setServiceModalVisible] = useState(false);

    const handleAction = (action) => {
        switch (action) {
            case 'Manage Services': setServiceModalVisible(true); break;
            case 'Start Maintenance':
                Alert.alert("Xác nhận bảo trì", `Bạn có chắc muốn chuyển phòng ${roomId} sang trạng thái bảo trì không?`,
                    [{ text: "Hủy" }, { text: "Xác nhận", style: "destructive", onPress: () => setRoomStatus('maintenance') }]
                );
                break;
            case 'Finish Maintenance': setRoomStatus('available'); break;
            default: Alert.alert("Hành động", `${action} cho phòng ${roomId}`);
        }
    };

    const handleSaveInfo = (updatedData) => {
        setRoomData(prev => ({ ...prev, ...updatedData }));
        setEditModalVisible(false);
        Alert.alert("Thành công", "Đã cập nhật thông tin phòng.");
    };

    const handleSaveServices = (services, totalCost) => {
        setRoomData(prev => ({ ...prev, usedServices: services }));
        setServiceModalVisible(false);
        Alert.alert("Ghi nhận thành công", `Đã cập nhật dịch vụ với tổng chi phí ${totalCost.toLocaleString('vi-VN')}đ.`);
    };

    const roomTypeImage = (currentRoomType?.imageUrls && currentRoomType.imageUrls.length > 0)
        ? currentRoomType.imageUrls[0]
        : 'https://via.placeholder.com/400x250.png?text=No+Image';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: roomTypeImage }} style={styles.image} />
                    <View style={styles.imageOverlay} />
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}>
                        <Ionicons name="arrow-back-circle" size={40} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    <StatusBadge status={roomStatus} />
                </View>

                <View style={styles.content}>
                    <View style={styles.roomInfoContainer}>
                        <View style={styles.roomInfoHeader}>
                            <View>
                                <Text style={styles.roomType}>{roomData.type}</Text>
                                <Text style={styles.roomNumber}>Phòng {roomData.id}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editIcon}>
                                <Ionicons name="pencil" size={24} color="#007bff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.roomPrice}>{roomData.price.toLocaleString('vi-VN')}đ / đêm</Text>
                    </View>

                    {roomStatus === 'occupied' && <GuestInfoPanel bookingInfo={roomData.bookingInfo} />}

                    <View style={styles.detailsGrid}>
                        {(roomData.details || []).map(item => (
                            <View key={item.id} style={styles.detailItem}>
                                <Ionicons name={item.icon} size={24} color="#007bff" />
                                <Text style={styles.detailText}>{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    <ActionPanel status={roomStatus} onPress={handleAction} />

                    <TouchableOpacity onPress={() => setHistoryModalVisible(true)}>
                        <View style={styles.panel}>
                            <View style={styles.panelHeader}>
                                <Text style={styles.panelTitle}>Lịch sử sử dụng</Text>
                                <Ionicons name="open-outline" size={22} color="#007bff" />
                            </View>
                            <Text style={styles.panelSubtitle}>Nhấn để xem chi tiết các lần ở.</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <HistoryModal visible={isHistoryModalVisible} onClose={() => setHistoryModalVisible(false)} pastBookings={roomData.pastBookings || []} />
            <EditInfoModal visible={isEditModalVisible} onClose={() => setEditModalVisible(false)} onSave={handleSaveInfo} currentData={roomData} />
            <ServiceManagementModal visible={isServiceModalVisible} onClose={() => setServiceModalVisible(false)} onSave={handleSaveServices} roomNumber={roomData.id} initialServices={roomData.usedServices || {}} applicableServices={currentRoomType?.id || null} allServices={allServices || []} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f7fc' },
    container: { flex: 1 },
    imageContainer: { height: 250, width: '100%' },
    image: { width: '100%', height: '100%' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
    backButtonAbsolute: { position: 'absolute', top: 50, left: 15, zIndex: 10 },
    statusBadge: { position: 'absolute', bottom: 20, right: 20, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    statusBadgeText: { color: '#fff', fontWeight: 'bold' },
    content: { padding: 20 },
    roomInfoContainer: { marginBottom: 15 },
    roomInfoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    editIcon: { padding: 5 },
    roomType: { fontSize: 16, color: '#6c757d' },
    roomNumber: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    roomPrice: { fontSize: 20, fontWeight: '600', color: '#007bff', marginBottom: 20 },
    guestPanel: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef' },
    guestPanelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    guestPanelIcon: { marginRight: 15 },
    guestPanelLabel: { fontSize: 15, color: '#6c757d', width: 100 },
    guestPanelValue: { fontSize: 15, fontWeight: '500', color: '#343a40', flex: 1 },
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    detailItem: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#e9ecef' },
    detailText: { marginTop: 8, color: '#495057' },
    panel: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef' },
    panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    panelTitle: { fontSize: 18, fontWeight: 'bold', color: '#343a40' },
    panelSubtitle: { fontSize: 14, color: '#6c757d', marginTop: 5 },
    panelGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15 },
    panelButton: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, marginBottom: 10 },
    panelButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: '#f4f7fc', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 10, maxHeight: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', paddingVertical: 10, marginBottom: 15 },
    editActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    editActionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
    saveButton: { backgroundColor: '#007bff' },
    editActionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    textInputRow: { marginBottom: 20 },
    inputLabel: { fontSize: 16, color: '#6c757d', marginBottom: 8 },
    textInput: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
    roomTypeSelectorContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    roomTypeButton: { width: '48%', paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#007bff', alignItems: 'center', marginBottom: 10 },
    roomTypeButtonSelected: { backgroundColor: '#007bff' },
    roomTypeButtonText: { color: '#007bff', fontSize: 14, fontWeight: '600' },
    roomTypeButtonTextSelected: { color: '#fff' },
    modalSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#6c757d', marginTop: 15, marginBottom: 10, textTransform: 'uppercase', paddingHorizontal: 5 },
    serviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    serviceName: { fontSize: 16, fontWeight: '500' },
    servicePrice: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    quantityControl: { flexDirection: 'row', alignItems: 'center' },
    quantityButton: { padding: 5 },
    quantityText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 15, minWidth: 25, textAlign: 'center' },
    summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, marginTop: 10, backgroundColor: '#fff', borderRadius: 10 },
    summaryText: { fontSize: 16, fontWeight: 'bold' },
    totalCostText: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
    emptyText: { textAlign: 'center', padding: 20, color: '#6c757d' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    modalBackButton: { flexDirection: 'row', alignItems: 'center', padding: 5 },
    modalBackButtonText: { color: '#007bff', fontSize: 16, marginLeft: 5 },
    modalSubtitle: { fontSize: 15, color: '#6c757d', textAlign: 'center', marginBottom: 20 },
    listItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
    listItemTitle: { fontSize: 16, fontWeight: '500' },
    listItemSubtitle: { fontSize: 13, color: '#888', marginTop: 4 },
    timelineItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    timelineContent: { marginLeft: 15 },
    timelineEvent: { fontSize: 16, fontWeight: '500' },
    timelineTime: { fontSize: 13, color: '#888', marginTop: 4 },
});