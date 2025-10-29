import { useHost } from '@/context/HostContext';
import TypeOfRoomRequest from '@/models/TypeOfRoom/TypeOfRoomRequest';
import TypeOfRoomResponse from '@/models/TypeOfRoom/TypeOfRoomResponse';
import Utility from '@/models/Utility/Utility';
import { getAllUtilityByType } from '@/service/HotelUtilityAPI';
import { addTypeOfRoom, deleteTypeOfRoom, getTypeOfRoomByHotel, updateTypeOfRoom } from '@/service/TypeOfRoomService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU MOCKUP ---
const mockInitialServices = [
    { id: 'sv_laundry', name: 'Giặt ủi (theo kg)', price: 50000, category: 'INROOM' },
    { id: 'sv_extra_bed', name: 'Giường phụ', price: 200000, category: 'INROOM' },
    { id: 'sv_coke', name: 'Coca-cola', price: 20000, category: 'MINIBAR' },
    { id: 'sv_tour', name: 'Tour tham quan thành phố', price: 500000, category: 'OUTROOM' },
];

const mockInitialRoomTypes = [
    {
        id: '1',
        name: 'Phòng Standard',
        imageUrls: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2874'],
        applicableServices: ['sv_laundry', 'sv_coke']
    },
    {
        id: '2',
        name: 'Phòng Deluxe',
        imageUrls: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2940'],
        applicableServices: ['sv_laundry', 'sv_extra_bed', 'sv_coke']
    },
    {
        id: '3',
        name: 'Phòng Suite',
        imageUrls: ['https://images.unsplash.com/photo-1568495248636-6412b158929b?q=80&w=2832'],
        applicableServices: ['sv_laundry', 'sv_extra_bed', 'sv_coke', 'sv_tour']
    },
];

// --- NAVIGATION GIẢ ---
const mockNavigation = {
    goBack: () => Alert.alert("Hành động", "Đã nhấn nút quay lại!"),
    navigate: (screenName) => Alert.alert("Điều hướng", `Chuyển đến màn hình: ${screenName}`),
};

const RoomTypeDefault = [
    {
        id: 1,
        name: 'Phòng Đơn',
    },
    {
        id: 2,
        name: 'Phòng Đôi',
    },
    {
        id: 3,
        name: 'Phòng Gia Đình',
    },
]
// --- Modal đã sửa lỗi ---
const TypeEditorModal = ({ visible, onClose, onSave, type, allServices, onAdd}) => {
    const [name, setName] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [roomTypes, setRoomTypes] = useState<TypeOfRoomResponse>();
    const [selectedType, setSelectedType] = useState(type);
    const [utilities, setUtilities] = useState<Utility>();
    const [servicePrices, setServicePrices] = useState<{ [key: number]: string }>({});
    const isEditing = !!type;
    const { hotelId } = useHost();

    // SỬA LỖI: Xóa mảng initialServices cứng, modal nên dùng dữ liệu từ prop "allServices"

    useFocusEffect(
        useCallback(() => {


            console.log(isEditing);
            console.log("type", type);
            setSelectedType(type!);
            if (visible && isEditing) {
                setName(type.room === "DON"
                    ? "Phòng Đơn"
                    : type.room === "DOI"
                        ? "Phòng Đôi"
                        : "Phòng Gia Đình");
                console.log("type.imageRooms", type.imageRooms);
                setImageUrls(isEditing && type.imageRooms?.length > 0 ? type.imageRooms.map((i) => i.image) : [] as string[]);
                
                // setSelectedServices(isEditing ? type.applicableServices || [] : []);
            }else {
                setImageUrls([]);
            }
        }, [type,visible])
    )
   

    // const hotelId = 1;

    useFocusEffect(
        useCallback(() => {
            if (!hotelId) return;
            const fetchRoomTypes = async () => {
    
                const typeOfRoom = await getTypeOfRoomByHotel(hotelId);
                console.log(typeOfRoom);
                setRoomTypes(typeOfRoom);
    
            };
    
            const fetchUtilities = async () => {
                const utilities = await getAllUtilityByType("OUTROOM");
                console.log(utilities.data);
                setUtilities(utilities);
            };
            fetchRoomTypes();
            fetchUtilities();
           
    
        }, [])
    );
    const handlePriceChange = (serviceId: number, value: string) => {
        setServicePrices(prev => ({
            ...prev,
            [serviceId]: value
        }));
    };
     const handleUrlChange = (text, index) => {
        const newUrls = [...imageUrls];
        newUrls[index] = text;
        setImageUrls(newUrls);
    };


    const addUrlInput = () => setImageUrls([...imageUrls, '']);
    const removeUrlInput = (index) => {
        if (imageUrls.length <= 1) return;
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);
    };

    const toggleServiceSelection = (serviceId: number) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const handleSave = () => {

        console.log("hotelId", hotelId);
        const finalUrls = imageUrls.filter(url => url && String(url).trim() !== '');
        console.log("finalUrls", finalUrls);
        if (!selectedType || finalUrls.length === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập tên và ít nhất một URL hình ảnh.");
            return;
        }
        console.log("Lưu loại phòng");
        const dataTypeRoom  = {
            hotelId: hotelId!,
            roomTypeId: selectedType.id,
            image: finalUrls,
        }
        console.log("dataTypeRoom", dataTypeRoom);
        onSave(dataTypeRoom);
    };
    const handleAdd = async () => {
        console.log("Thêm loại phòng");
        const finalUrls = imageUrls.filter(url => url && String(url).trim() !== '');
        if (!selectedType || finalUrls.length === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập tên và ít nhất một URL hình ảnh.");
            return;
        }
        const dataTypeRoom : TypeOfRoomRequest = {
            hotelId: hotelId!,
            roomTypeId: selectedType.id, 
            image: finalUrls,
        }
        console.log("dataTypeRoom", dataTypeRoom);
        onAdd(dataTypeRoom);
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}><Ionicons name="close" size={28} /></TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Chỉnh sửa Loại phòng' : 'Thêm Loại phòng'}</Text>
                    <TouchableOpacity onPress={isEditing ? handleSave : handleAdd}><Text style={styles.saveText}>Lưu</Text></TouchableOpacity>
                </View>
                <ScrollView>
                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Tên loại phòng</Text>
                        <View style={styles.typeSelector}>
                            {RoomTypeDefault.map(rt => (
                                <TouchableOpacity
                                    key={rt.id}
                                    style={[styles.typeButton, (selectedType?.id ?? type?.id) === rt.id && styles.typeButtonSelected]}
                                    onPress={() => setSelectedType(rt)}
                                >
                                    <Text style={[styles.typeButtonText, (selectedType?.id ?? type?.id) === rt.id && styles.typeButtonTextSelected]}>
                                        {rt.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.inputLabel}>Danh sách URL hình ảnh</Text>
                        {imageUrls?.map((url, index) => (
                            <View key={index} style={styles.urlInputContainer}>
                                <TextInput style={styles.urlInput} placeholder={`URL hình ảnh ${index + 1}`} value={url} onChangeText={(text) => handleUrlChange(text, index)} />
                                {imageUrls?.length > 1 && (
                                    <TouchableOpacity onPress={() => removeUrlInput(index)} style={styles.removeButton}>
                                        <Ionicons name="trash-outline" size={22} color="#dc3545" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addButton} onPress={addUrlInput}>
                            <Ionicons name="add" size={20} color="#007bff" />
                            <Text style={styles.addButtonText}>Thêm ảnh khác</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.mainSectionTitle}>Dịch vụ áp dụng</Text>
                    <View style={styles.serviceSelectionContainer}>

                        {(utilities?.data || []).map(service => {
                            const isSelected = selectedServices.includes(service.id);
                            return (
                                <View key={service.id} style={styles.serviceToggleItem}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.serviceName}>{service.name}</Text>

                                        {isSelected && (
                                            <TextInput
                                                style={styles.priceInput}
                                                placeholder="Nhập giá dịch vụ..."
                                                keyboardType="numeric"
                                                value={servicePrices[service.id] || ""}
                                                onChangeText={(text) => handlePriceChange(service.id, text)}
                                            />
                                        )}
                                    </View>

                                    <Switch
                                        value={isSelected}
                                        onValueChange={() => toggleServiceSelection(service.id)}
                                        trackColor={{ false: "#ccc", true: "#81b0ff" }}
                                        thumbColor={isSelected ? "#007bff" : "#f4f3f4"}
                                    />
                                </View>
                            );
                        })}

                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

// --- COMPONENT CHÍNH ĐÃ SỬA ---
export default function ManageRoomTypesScreen({ route, navigation = mockNavigation }) {
    // Tạo state nội bộ để quản lý dữ liệu giả
    const [mockedRoomTypes, setMockedRoomTypes] = useState(mockInitialRoomTypes);
    const [mockedServices, setMockedServices] = useState(mockInitialServices);

    // Nếu có route.params thì dùng, không thì dùng state giả
    const roomTypes = route?.params?.roomTypes || mockedRoomTypes;
    const setRoomTypes = route?.params?.setRoomTypes || setMockedRoomTypes;
    const services = route?.params?.services || mockedServices;
    const setServices = route?.params?.setServices || setMockedServices;
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    const { hotelId } = useHost();
    console.log("hotelId", hotelId);

    const handleSaveType = async (typeData: TypeOfRoomRequest) => {
        if (!hotelId) return;
        console.log("typeData", typeData);
        const response = await updateTypeOfRoom(hotelId, typeData);
        console.log("response", response);
        setModalVisible(false);
        setSelectedType(null);
        setRefreshing(prev => !prev);
        Alert.alert("Thành công", "Đã cập nhật loại phòng thành công");
    };

    const handleAddType = async (typeData: TypeOfRoomRequest) => {
        try {
            const response = await addTypeOfRoom(typeData);
            console.log("response", response);
            setModalVisible(false);
            setSelectedType(null);
            setRefreshing(prev => !prev);
            Alert.alert("Thành công", "Đã thêm loại phòng thành công");
        } catch (error) {
            console.error("Lỗi khi thêm loại phòng", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm loại phòng");
        }
    };

        useEffect(() => {
        const fetchRoomTypes = async () => {
            if (!hotelId) return;
            console.log("hotelId", hotelId);
            const typeOfRoom = await getTypeOfRoomByHotel(hotelId);
            console.log(typeOfRoom.data);
            setRoomTypes(typeOfRoom.data);
        };
        fetchRoomTypes();
    }, [selectedType, refreshing])

    const handleDeleteType = async (typeId: number, hotelId: number) => {
        const response = await deleteTypeOfRoom(typeId, hotelId);
        console.log("response", response);
        setRefreshing(prev => !prev);
        Alert.alert("Thành công", "Đã xóa loại phòng thành công");
        // Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa loại phòng này?",
        //     [{ text: "Hủy" }, { text: "Xóa", style: "destructive", onPress: () => { deleteTypeOfRoom(hotelId, typeId); } },]
        // );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screenHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
                <Text style={styles.screenHeaderTitle}>Quản lý Loại phòng</Text>
                <View style={{ width: 28 }} />
            </View>
            <TouchableOpacity style={styles.manageServiceButton} onPress={() => navigation.navigate('ManageServices', { services, setServices, roomTypes })}>
                <Ionicons name="list-circle-outline" size={24} color="#007bff" />
                <Text style={styles.manageServiceButtonText}>Quản lý Dịch vụ</Text>
            </TouchableOpacity>
            <FlatList
                data={roomTypes.sort((a, b) => a.id - b.id)}
                keyExtractor={item => item.id}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Chưa có loại phòng nào.</Text></View>}
                renderItem={({ item }) => (
                    <View style={styles.typeItem}>
                        <Image source={{ uri: item.imageRooms?.[0].image || 'https://via.placeholder.com/100' }} style={styles.typeImage} />
                        <View style={styles.typeNameContainer}>
                            <Text style={styles.typeName}>{item.room == "DON" ? "Phòng đơn" : item.room == "DOI" ? "Phòng đôi" : "Phòng gia đình"}</Text>
                            <Text style={styles.imageCount}>{item.applicableServices?.length || 0} dịch vụ áp dụng</Text>
                        </View>
                        <View style={styles.typeActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={() => { setSelectedType(item); setModalVisible(true); }}>
                                <Ionicons name="pencil" size={24} color="#007bff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteType(item.id, hotelId!)}>
                                <Ionicons name="trash-outline" size={24} color="#dc3545" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            <TouchableOpacity style={styles.fab} onPress={() => { setSelectedType(null); setModalVisible(true); }}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
            <TypeEditorModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={handleSaveType} type={selectedType} allServices={services} onAdd={handleAddType} />
        </SafeAreaView>
    );
}

// --- Styles (Không thay đổi) ---
const styles = StyleSheet.create({
    // ... Dán toàn bộ styles của bạn vào đây ...
    safeArea: { flex: 1, backgroundColor: '#f4f7fc' },
    screenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    screenHeaderTitle: { fontSize: 20, fontWeight: '600' },
    backButton: { padding: 5 },
    manageServiceButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, marginHorizontal: 15, marginTop: 15, borderRadius: 10, backgroundColor: '#e7f3ff', borderWidth: 1, borderColor: '#007bff' },
    manageServiceButtonText: { color: '#007bff', fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
    typeItem: { backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 15, marginHorizontal: 15, marginVertical: 8, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, },
    typeImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
    typeNameContainer: { flex: 1 },
    typeName: { fontSize: 16, fontWeight: '500' },
    imageCount: { fontSize: 13, color: '#6c757d', marginTop: 4 },
    typeActions: { flexDirection: 'row' },
    actionButton: { padding: 8, marginLeft: 8 },
    fab: { position: 'absolute', right: 20, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', elevation: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 16, color: '#6c757d' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    saveText: { color: '#007bff', fontSize: 18, fontWeight: '600' },
    formSection: { padding: 20 },
    inputLabel: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 10 },
    textInput: { backgroundColor: '#f4f7fc', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 5 },
    urlInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    urlInput: { flex: 1, backgroundColor: '#f4f7fc', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
    removeButton: { padding: 8, marginLeft: 8 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderWidth: 1, borderColor: '#007bff', borderStyle: 'dashed', borderRadius: 8, marginTop: 10 },
    addButtonText: { color: '#007bff', fontWeight: 'bold', marginLeft: 8 },
    mainSectionTitle: { fontSize: 20, fontWeight: 'bold', padding: 20, backgroundColor: '#f4f7fc', borderTopWidth: 1, borderTopColor: '#eee' },
    serviceSelectionContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    serviceToggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    serviceName: { fontSize: 16 },
    serviceCategory: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginTop: 2 },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    typeButton: {
        backgroundColor: '#f4f7fc',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 10,
        marginBottom: 10,
    },
    typeButtonSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    typeButtonText: {
        color: '#333',
        fontWeight: '500',
    },
    typeButtonTextSelected: {
        color: '#fff',
    },
    priceInput: {
        marginTop: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 15,
        width: 150,
    },
});