import { urlImage } from '@/constants/BaseURL';
import { useHost } from '@/context/HostContext';
import { addTypeOfRoom, deleteTypeOfRoom, getTypeOfRoomByHotel, updateTypeOfRoom } from '@/service/TypeOfRoomService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
const TypeEditorModal = ({ visible, onClose, type, onAdd, onSave }) => {
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]); // ảnh cũ (từ DB)
    const [newImages, setNewImages] = useState<string[]>([]); // ảnh mới chọn
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
    const [selectedType, setSelectedType] = useState(type);
    const { hotelId } = useHost();

    const isEditing = !!type;

    console.log("existingImages123", existingImages);
    console.log("newImages123", newImages);
    console.log("deletedImageIds123", deletedImageIds);
    // Khi mở modal
    useFocusEffect(
        useCallback(() => {
            if (visible && isEditing) {
                console.log("🟡 Chế độ chỉnh sửa loại phòng:", type.room);
                const dbImages = type.imageRooms || [];
                setExistingImages(dbImages); // lưu lại ảnh có id
                setImageUrls(dbImages.map((i) => urlImage + i.image));
                setNewImages([]);
                setDeletedImageIds([]);
            } else {
                setImageUrls([]);
                setNewImages([]);
                setExistingImages([]);
            }
        }, [visible, type])
    );

    /** 📸 Chọn thêm ảnh mới */
    const handleChooseImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Quyền bị từ chối", "Cần quyền truy cập thư viện ảnh.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 0,
        });

        if (!result.canceled) {
            const selected = result.assets.map((a) => a.uri);
            setNewImages((prev) => [...prev, ...selected]);
        }
    };

    /** ❌ Xóa ảnh cũ hoặc ảnh mới */
    const removeImage = (url: string, isOld = false, imageId?: number) => {
        if (isOld && imageId) {
            setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
            setDeletedImageIds((prev) => [...prev, imageId]);
        } else {
            setNewImages((prev) => prev.filter((u) => u !== url));
        }
    };

    /** 💾 Gửi dữ liệu lên server */
    const handleSave = async () => {
        try {
            if (!selectedType) {
                Alert.alert("Thiếu thông tin", "Chưa chọn loại phòng.");
                return;
            }

            const formData = new FormData();
            formData.append("hotelId", `${hotelId}`);
            formData.append("roomTypeId", `${selectedType?.id}`);
            if(deletedImageIds.length > 0) {
                deletedImageIds.forEach(id => {
                    formData.append("deletedImageIds", id.toString());
                  });            }

            // Thêm ảnh mới
            newImages.forEach((uri) => {
                const fileName = uri.split("/").pop();
                const fileType = fileName?.split(".").pop();
                formData.append("images", {
                    uri,
                    name: fileName || `photo_${Date.now()}.jpg`,
                    type: `image/${fileType || "jpeg"}`,
                } as any);
            });

            console.log("📤 Gửi formData:", formData);

            if (isEditing) {
                await onSave(formData);
            } else {
                await onAdd(formData);
            }

            Alert.alert("✅ Thành công", isEditing ? "Cập nhật loại phòng thành công" : "Thêm loại phòng thành công");
            onClose();
        } catch (error) {
            console.error("❌ Lỗi upload:", error);
            Alert.alert("Lỗi", "Không thể lưu dữ liệu");
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="close" size={28} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditing ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng"}
                    </Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.saveText}>Lưu</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Tên loại phòng</Text>
                        <View style={styles.typeSelector}>
                            {RoomTypeDefault.map(rt => (
                                <TouchableOpacity
                                    key={rt.id}
                                    style={[styles.typeButton, (selectedType?.id ?? type?.id) === rt.id && styles.typeButtonSelected]}
                                    onPress={() => isEditing ? console.log(123)
                                     : setSelectedType(rt)}
                                >
                                    <Text style={[styles.typeButtonText, (selectedType?.id ?? type?.id) === rt.id && styles.typeButtonTextSelected]}>
                                        {rt.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                {/* Nội dung */}
                <ScrollView>
                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Hình ảnh loại phòng</Text>

                        {/* Ảnh cũ */}
                        {existingImages.length > 0 && (
                            <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10, gap: 10 }} >
                                {existingImages.map((img) => (
                                    <View key={img.id} style={{ width: 100, borderRadius: 10 }} >
                                        <Image source={{ uri: urlImage + img.image }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            onPress={() => removeImage(urlImage + img.image, true, img.id)}
                                            style={styles.deleteIcon}
                                        >
                                            <Ionicons name="close" size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Ảnh mới */}
                        {newImages.length > 0 && (
                            <View >
                                {newImages.map((uri, index) => (
                                    <View key={index} >
                                        <Image source={{ uri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            onPress={() => removeImage(uri, false)}
                                            style={styles.deleteIcon}
                                        >
                                            <Ionicons name="close" size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Nút thêm ảnh */}
                        <TouchableOpacity style={styles.imageButton} onPress={handleChooseImage}>
                            <Ionicons name="images" size={20} color="#007bff" />
                            <Text style={styles.imageButtonText}>Chọn ảnh</Text>
                        </TouchableOpacity>
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

    const handleSaveType = async (typeData: FormData) => {
        console.log("hotelId123", hotelId);
        console.log("typeData123", typeData);
        if (!hotelId) return;
        console.log("typeData", typeData);
        const response = await updateTypeOfRoom(hotelId, typeData);
        console.log("response", response);
        setModalVisible(false);
        setSelectedType(null);
        setRefreshing(prev => !prev);
        Alert.alert("Thành công", "Đã cập nhật loại phòng thành công");
    };

    const handleAddType = async (typeData: FormData) => {
        try {
            const response = await addTypeOfRoom(typeData);
            console.log("response123", response);
            if (response) {
                Alert.alert("Thành công", "Đã thêm loại phòng thành công");
                setModalVisible(false);
                setSelectedType(null);
                setRefreshing(prev => !prev);
            } else {
                Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm loại phòng");
            }
        } catch (error) {
            console.error("Lỗi khi thêm loại phòng", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi thêm loại phòng: " + error);
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
        marginVertical: 10,
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
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#007bff',
        borderRadius: 8,
    },
    imageButtonText: {
        color: '#007bff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    imagePreview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
    imageButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 10,
    },
    imageWrapper: {
        position: "relative",
        margin: 5,
    },
    deleteIcon: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 12,
        padding: 3,
    },
});