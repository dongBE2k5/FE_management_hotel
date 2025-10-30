import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU MOCKUP ---
// Thêm dữ liệu giả này vào đầu file để sử dụng khi không có route.params
const mockInitialRoomTypes = [
    { id: '1', name: 'Phòng Standard' },
    { id: '2', name: 'Phòng Deluxe' },
    { id: '3', name: 'Phòng Suite' },
    { id: '4', name: 'Bungalow' },
];

const mockInitialServices = [
    { id: 'sv_laundry', name: 'Giặt ủi (theo kg)', price: 50000, category: 'INROOM', applicableRoomTypes: ['1', '2', '3'] },
    { id: 'sv_extra_bed', name: 'Giường phụ', price: 200000, category: 'INROOM', applicableRoomTypes: ['2', '3'] },
    { id: 'sv_coke', name: 'Coca-cola', price: 20000, category: 'MINIBAR', applicableRoomTypes: ['1', '2', '3', '4'] },
    { id: 'sv_tour', name: 'Tour tham quan thành phố', price: 500000, category: 'OUTROOM', applicableRoomTypes: ['3', '4'] },
];

// --- MOCK NAVIGATION ---
// Tạo một đối tượng navigation giả để các hàm như goBack() không bị lỗi
const mockNavigation = {
    goBack: () => Alert.alert("Hành động", "Đã nhấn nút quay lại!"),
};


// --- Modal (không thay đổi) ---
const ServiceEditorModal = ({ visible, onClose, onSave, service, allRoomTypes }) => {
    // ... code modal giữ nguyên ...
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(null);
    const [applicableRoomTypes, setApplicableRoomTypes] = useState([]);
    const isEditing = !!service;

    useEffect(() => {
        if (visible) {
            setName(isEditing ? service.name : '');
            setPrice(isEditing ? String(service.price) : '');
            setCategory(isEditing ? service.category : null);
            setApplicableRoomTypes(isEditing ? service.applicableRoomTypes || [] : []);
        }
    }, [service, visible]);

    const handleSave = () => {
        if (!name.trim() || !price.trim() || !category) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin Tên, Giá và Phân loại.");
            return;
        }
        onSave({ id: isEditing ? service.id : `sv_${Date.now()}`, name, price: parseInt(price), category, applicableRoomTypes });
    };

    const toggleRoomTypeSelection = (roomTypeId) => {
        if (applicableRoomTypes.includes(roomTypeId)) {
            setApplicableRoomTypes(applicableRoomTypes.filter(id => id !== roomTypeId));
        } else {
            setApplicableRoomTypes([...applicableRoomTypes, roomTypeId]);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <Text style={styles.modalTitle}>{isEditing ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ mới'}</Text>
                        <TextInput style={styles.textInput} placeholder="Tên dịch vụ" value={name} onChangeText={setName} />
                        <TextInput style={styles.textInput} placeholder="Giá tiền" value={price} onChangeText={setPrice} keyboardType="numeric" />
                        
                        <Text style={styles.inputLabel}>Phân loại</Text>
                        <View style={styles.categorySelector}>
                            {['INROOM', 'MINIBAR', 'OUTROOM'].map(cat => (
                                <TouchableOpacity key={cat} style={[styles.typeButton, category === cat && styles.typeButtonSelected]} onPress={() => setCategory(cat)}>
                                    <Text style={[styles.typeButtonText, category === cat && styles.typeButtonTextSelected]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View> 

                        <Text style={styles.inputLabel}>Áp dụng cho Loại phòng</Text>
                        <View style={styles.serviceSelectionContainer}>
                            {allRoomTypes.map(type => (
                                <View key={type.id} style={styles.serviceToggleItem}>
                                    <Text style={styles.serviceName}>{type.name}</Text>
                                    <Switch
                                        value={applicableRoomTypes.includes(type.id)}
                                        onValueChange={() => toggleRoomTypeSelection(type.id)}
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}><Text style={styles.modalButtonText}>Hủy</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}><Text style={styles.modalButtonText}>Lưu</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};


// --- THAY ĐỔI TRONG COMPONENT CHÍNH ---
// Cung cấp giá trị mặc định cho props để component có thể chạy độc lập
export default function ManageServicesScreen({ route, navigation = mockNavigation }) {
    // Sử dụng useState để tạo state giả lập, cho phép Thêm/Sửa/Xóa hoạt động
    const [mockedServices, setMockedServices] = useState(mockInitialServices);
    
    // Kiểm tra xem route.params có tồn tại không. Nếu có, dùng dữ liệu thật. Nếu không, dùng dữ liệu mock.
    const services = route?.params?.services || mockedServices;
    const setServices = route?.params?.setServices || setMockedServices;
    const roomTypes = route?.params?.roomTypes || mockInitialRoomTypes;

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const handleSaveService = (serviceData) => {
        const index = services.findIndex(s => s.id === serviceData.id);
        if (index > -1) {
            const updated = [...services];
            updated[index] = serviceData;
            setServices(updated);
        } else {
            setServices(prevServices => [...prevServices, serviceData]);
        }
        setModalVisible(false);
        setSelectedService(null);
    };

    const handleDeleteService = (serviceId) => {
        Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa dịch vụ này?",
            [{ text: "Hủy" }, { text: "Xóa", style: "destructive", onPress: () => setServices(services.filter(s => s.id !== serviceId)) }]
        );
    };

    const getRoomTypeNames = (typeIds) => {
        if (!typeIds || typeIds.length === 0) return 'Không áp dụng';
        return typeIds.map(id => roomTypes.find(rt => rt.id === id)?.name).filter(Boolean).join(', ');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Dịch vụ (Mockup)</Text>
                <View style={{width: 28}} />
            </View>
            <FlatList
                data={services}
                keyExtractor={item => item.id}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Chưa có dịch vụ nào.</Text></View>}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <View style={{flex: 1}}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}đ - <Text style={{fontWeight: 'bold'}}>{item.category}</Text></Text>
                            <Text style={styles.itemAppliesTo}>Áp dụng: {getRoomTypeNames(item.applicableRoomTypes)}</Text>
                        </View>
                        <View style={styles.itemActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedService(item); setModalVisible(true); }}>
                                <Ionicons name="pencil" size={24} color="#007bff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteService(item.id)}>
                                <Ionicons name="trash-outline" size={24} color="#dc3545" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            <TouchableOpacity style={styles.fab} onPress={() => { setSelectedService(null); setModalVisible(true); }}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
            <ServiceEditorModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveService} service={selectedService} allRoomTypes={roomTypes} />
        </SafeAreaView>
    );
}

// --- Styles (không thay đổi) ---
const styles = StyleSheet.create({
    // ... styles giữ nguyên ...
    safeArea: { flex: 1, backgroundColor: '#f4f7fc' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    backButton: { padding: 5 },
    itemContainer: { backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginVertical: 8, borderRadius: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center' },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, color: '#6c757d', marginTop: 4 },
    itemAppliesTo: { fontSize: 12, fontStyle: 'italic', color: '#007bff', marginTop: 6 },
    itemActions: { flexDirection: 'row' },
    actionButton: { padding: 5, marginLeft: 10 },
    fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6c757d' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 10 },
    textInput: { backgroundColor: '#f4f7fc', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
    categorySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap' },
    typeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginHorizontal: 4, minWidth: '30%' },
    typeButtonSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
    typeButtonText: { color: '#333', fontWeight: '500' },
    typeButtonTextSelected: { color: '#fff' },
    serviceSelectionContainer: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, marginTop: 5 },
    serviceToggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    serviceName: { fontSize: 16, flex: 1 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
    saveButton: { backgroundColor: '#007bff' },
    modalButtonText: { color: '#fff', fontWeight: 'bold' },
});