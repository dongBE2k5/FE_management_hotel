import { urlImage } from '@/constants/BaseURL';
import { useHost } from '@/context/HostContext';
import TypeOfRoomResponse from '@/models/TypeOfRoom/TypeOfRoomResponse';
import { Utility, UtilityItem } from '@/models/Utility/Utility';
import { createUtilityOfHotel, deleteUtilityOfHotel, getUtilityByHotel, getUtilityOfHotelById, updateUtilityIsUsed, updateUtilityOfHotel, updateUtilityOfHotelById } from '@/service/HotelUtilityAPI';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const allRoomTypes = [
    { id: 1, name: "DON" },
    { id: 2, name: "DOI" },
    { id: 3, name: "GIA_DINH" },
];

export default function Service() {
    const router = useRouter();
    const [utilities, setUtilities] = useState<Utility>();
    const [roomTypes, setRoomTypes] = useState<TypeOfRoomResponse>();
    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [servicePrices, setServicePrices] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(false);
    const { hotelId } = useHost();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState<UtilityItem | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'INROOM' | 'MINIBAR' | 'OUTROOM'>('INROOM');
    const [isFresh, setIsFresh] = useState(false);

    const fetchData = async () => {
        try {
            // 🔹 Lấy tất cả tiện ích
            const utilitiesRes = await getUtilityByHotel(hotelId!);
            setUtilities(utilitiesRes);
            const utilityUsed: number[] = [];
            utilitiesRes.data.forEach((item) => {
                if (item.isUsed == "USED") {
                    utilityUsed.push(item.id);
                }
            });
            setSelectedServices(utilityUsed);
            console.log("utilityUsed", utilityUsed);
            
            // 🔹 Lấy danh sách tiện ích đã được gán cho khách sạn
            // const hotelUtilitiesRes = await getUtilityOfHotel(hotelId);
            // console.log("Dịch vụ cũ của khách sạn:", hotelUtilitiesRes.data);

            // const existing = hotelUtilitiesRes?.data || [];
            // console.log("Existing:", existing);
            // // 🔹 Bật sẵn toggle và gán giá
            // const selectedIds = existing.utilities.map((item: any) => item.id);
            // console.log("Selected IDs:", selectedIds);
            // const prices: { [key: number]: string } = {};
            // existing.utilities.forEach((item: any) => {
            //     prices[item.id] = item.price.toString();
            // });

            // setSelectedServices(selectedIds);
            // setServicePrices(prices);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (!hotelId) {
                Alert.alert("⚠ Lỗi", "Vui lòng chọn khách sạn");
                return router.push("/(host)");
            }
            fetchData();
        }, [isFresh, hotelId])
);

const handleReload = () => {
    setIsFresh(prev => !prev);
};

const handlePriceChange = (serviceId: number, value: string) => {
    setServicePrices(prev => ({
        ...prev,
        [serviceId]: value
    }));
};

const toggleServiceSelection = async (service: UtilityItem) => {
    try {
        service.isUsed == "USED" ? await updateUtilityIsUsed(service.id, "UNUSED") : await updateUtilityIsUsed(service.id, "USED");
        setSelectedServices(selectedServices.filter(id => id !== service.id));
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái dịch vụ:", error);
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái dịch vụ. Vui lòng thử lại.");
    }
    handleReload();
};

// 🟢 Hàm gửi dữ liệu về API
const handleSaveServices = async (id: number, formData: FormData, typeOfRoom: { typeOfRoomId: number, utilityId: number }[]) => {
    if (!formData) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
        return;
    }

    try {
        // Gửi đến API của bạn (chỉnh URL theo backend)
        console.log("Data type room "  + JSON.stringify(typeOfRoom));

        const response = await updateUtilityOfHotel(id, formData);
        console.log("ID "  + response.data.id);
        
        const responseTypeOfRoom = await updateUtilityOfHotelById(response.data.id, typeOfRoom);
        console.log("responseTypeOfRoom", responseTypeOfRoom);
        Alert.alert("Thành công", "Cập nhật dịch vụ thành công.");
        handleReload();
    } catch (error) {
        console.error("Lỗi khi gửi:", error);
        Alert.alert("Lỗi", "Không thể gửi dữ liệu. Vui lòng thử lại.");
    }
};

const handleAddUtility = async (formData: FormData, typeOfRoom: { typeOfRoomId: number, utilityId: number }[]) => {
    try {
        console.log("Vào handleAddUtility", formData);

        const response = await createUtilityOfHotel(formData);
       
        const utilityId =  response.data.id;
        console.log("Data type room "  + JSON.stringify(typeOfRoom));
        const payload = typeOfRoom.map(item => ({
            ...item,
            utilityId
          }));
          console.log(payload);
          
        
        const responseTypeOfRoom = await updateUtilityOfHotelById(response.data.id, payload);
        console.log("responseTypeOfRoom", responseTypeOfRoom);
        Alert.alert("Thành công", "Thêm dịch vụ thành công.");
        handleReload();
    } catch (error) {
        Alert.alert("Lỗi", "Không thể thêm dịch vụ. Vui lòng thử lại.");
    }
}

const handleDeleteUtility = async (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa dịch vụ này không?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", onPress: async () => {
            try {
                const response = await deleteUtilityOfHotel(id);
                console.log("response", response);
                Alert.alert("Thành công", "Xóa dịch vụ thành công.");
                handleReload();
            } catch (error) {
                console.error("Lỗi khi xóa dịch vụ:", error);
                Alert.alert("Lỗi", "Không thể xóa dịch vụ. Vui lòng thử lại.");
            }
        }
    }]);
}

return (

    
    <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.mainSectionTitle}>Dịch vụ áp dụng</Text>
            <TouchableOpacity
                style={styles.itemListButton}
                onPress={() => router.push('./itemTest' as any)}
            >
                <Ionicons name="cube-outline" size={20} color="#fff" />
                <Text style={styles.itemListButtonText}>Vật dụng</Text>
            </TouchableOpacity>
        </View>

        {/* --- Tabs --- */}
        <View style={styles.tabContainer}>
            {['INROOM', 'MINIBAR', 'OUTROOM'].map(tab => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                    onPress={() => setActiveTab(tab as 'INROOM' | 'MINIBAR' | 'OUTROOM')}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                        {tab === 'INROOM' ? 'Tiện ích có sẵn' : tab === 'MINIBAR' ? 'Mini Bar' : 'Tiện ích thêm'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* --- Danh sách dịch vụ --- */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {(utilities?.data || [])
                .filter(service => service.type === activeTab)
                .map(service => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                        <View key={service.id} style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}>
                            <View style={styles.serviceRow}>
                                <View style={styles.serviceInfo}>
                                    <MaterialIcons
                                        name="miscellaneous-services"
                                        size={22}
                                        color="#007bff"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                </View>

                                <Switch
                                    value={isSelected}
                                    onValueChange={() => toggleServiceSelection(service as UtilityItem)}
                                    trackColor={{ false: "#ddd", true: "#a8d0ff" }}
                                    thumbColor={isSelected ? "#007bff" : "#f4f3f4"}
                                />

                                <View style={styles.itemActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setSelectedService(service);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Ionicons name="pencil" size={24} color="#007bff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDeleteUtility(service.id)}
                                    >
                                        <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* {isSelected && (
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>Giá dịch vụ:</Text>
                                    <TextInput
                                        style={styles.priceInput}
                                        placeholder="Nhập giá..."
                                        keyboardType="numeric"
                                        value={servicePrices[service.id] || ""}
                                        onChangeText={(text) => handlePriceChange(service.id, text)}
                                    />
                                </View>
                            )} */}
                        </View>
                    );
                })}
        </ScrollView>

        <TouchableOpacity
            style={styles.fab}
            onPress={() => {
                setSelectedService(undefined);
                setModalVisible(true);

            }}
        >
            <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>


        {/* --- Modal chỉnh sửa --- */}
        <ServiceEditorModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleSaveServices}
            service={selectedService}
            onAdd={handleAddUtility}
        />
    </View>
);
}

const ServiceEditorModal = ({ visible, onClose, onSave, service, onAdd }) => {
    // ... code modal giữ nguyên ...
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(null);
    const [image, setImage] = useState(null);
    const [applicableRoomTypes, setApplicableRoomTypes] = useState<number[]>([]);
    const isEditing = !!service;
    const { hotelId } = useHost();
    let typeOfRoomIdList: number[] = [];
    const [typeOfRoomData, setTypeOfRoomData] = useState<{ typeOfRoomId: number, utilityId: number }[]>([]);


    useEffect(() => {
        if (visible && isEditing) {
            console.log("service", service);
            setName(isEditing ? service.name : '');
            setPrice(isEditing ? String(service.price) : '');
            setCategory(isEditing ? service.type : null);
            const fetchUtility = async () => {
                const utility = await getUtilityOfHotelById(service.id);
                console.log("utility", utility.data.utilities);
                typeOfRoomIdList = [];
                if(utility.data.utilities.length > 0) {
                    utility.data.utilities.forEach((item: any) => {
                        typeOfRoomIdList.push(Number(item.typeOfRoomId));
                        console.log(Number(item.typeOfRoomId));
                        
                    });
                }
                setApplicableRoomTypes(typeOfRoomIdList);
            };
            fetchUtility();

            console.log("typeOfRoomIdList", typeOfRoomIdList);
            typeOfRoomIdList = [];
        } else {
            setName('');
            setPrice('');
            setCategory(null);
            setImage(null);
            setApplicableRoomTypes([])
            typeOfRoomIdList = [];

        }

    }, [service, visible]);

    const handleSave = async () => {
        console.log("hotelId", hotelId);
        console.log("is editing", isEditing);
        console.log("typeOfRoom123", typeOfRoomData);


        if (!name.trim() || (!price.trim() && category != "INROOM") || !category) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin Tên, Giá và Phân loại.");
            return;
        }

        const formData = new FormData();

        formData.append("name", name.trim());
        formData.append("price", price.trim());
        formData.append("type", category);
        formData.append("hotelId", hotelId!.toString());
        // formData.append("image", image as any);
        if (image) {
            formData.append("image", {
                uri: image,
                name: "upload.jpg",
                type: "image/jpeg",
            } as any);
        }
        console.log("formData", JSON.stringify(formData.get("image")));
        if (isEditing) {
            onSave(service?.id, formData, typeOfRoomData);

            onClose();
        } else {
            console.log("Vào handleAddUtility", formData);
            onAdd(formData, typeOfRoomData);
            onClose();
        }


    };

    const handleChooseImage = async () => {
        // xin quyền truy cập ảnh
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Quyền bị từ chối", "Cần quyền truy cập thư viện ảnh");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Quyền bị từ chối", "Cần quyền sử dụng camera");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }
    const toggleRoomTypeSelection = (roomTypeId: number) => {
        let applyTypeOfRoom
        const typeOfRoomDataList: { typeOfRoomId: number, utilityId: number }[] = [];
        if (applicableRoomTypes.includes(roomTypeId)) {
            applyTypeOfRoom = (applicableRoomTypes.filter((id: number) => id !== roomTypeId));
            setApplicableRoomTypes(applicableRoomTypes.filter((id: number) => id !== roomTypeId));
        } else {
            applyTypeOfRoom = ([...applicableRoomTypes, roomTypeId]);
            setApplicableRoomTypes([...applicableRoomTypes, roomTypeId]);
        }
       
        applyTypeOfRoom.forEach((id: number) => {
            typeOfRoomDataList.push({
                typeOfRoomId: id,
                utilityId: service?.id,
            });
        });
        setTypeOfRoomData(typeOfRoomDataList);
    };



    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <Text style={styles.modalTitle}>
                            {service ? "Chỉnh sửa Dịch vụ" : "Thêm Dịch vụ mới"}
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="Tên dịch vụ"
                            value={name}
                            onChangeText={setName}
                        />

                        {category != "INROOM" && <TextInput
                            style={styles.textInput}
                            placeholder="Giá tiền"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />}

                        <Text style={styles.inputLabel}>Ảnh dịch vụ</Text>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : service?.imageUrl ? (
                            <Image source={{ uri: `${urlImage}${service?.imageUrl}` }} style={styles.imagePreview} />
                        ) : (
                            <Text style={{ color: "#999", marginBottom: 10 }}>Chưa có ảnh</Text>
                        )}

                        <View style={styles.imageButtons}>
                            <TouchableOpacity style={styles.imageButton} onPress={handleChooseImage}>
                                <Ionicons name="images" size={20} color="#007bff" />
                                <Text style={styles.imageButtonText}>Chọn ảnh</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                                <Ionicons name="camera" size={20} color="#007bff" />
                                <Text style={styles.imageButtonText}>Chụp ảnh</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Phân loại</Text>
                        <View style={styles.categorySelector}>
                            {["INROOM", "MINIBAR", "OUTROOM"].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.typeButton,
                                        category === cat && styles.typeButtonSelected,
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            category === cat && styles.typeButtonTextSelected,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {category != "OUTROOM" && category != "MINIBAR" && 
                        <>
                        <Text style={styles.inputLabel}>Áp dụng cho Loại phòng</Text>
                        <View style={styles.serviceSelectionContainer}>
                            {allRoomTypes.map(type => (
                                <View key={type.id} style={styles.serviceToggleItem}>
                                    <Text style={styles.serviceName}>{type.name == "DON" ? "Phòng Đơn" : type.name == "DOI" ? "Phòng Đôi" : "Phòng Gia Đình"}</Text>
                                    <Switch
                                        value={applicableRoomTypes.includes(type.id)}
                                        onValueChange={() => toggleRoomTypeSelection(type.id)}
                                    />
                                </View>
                            ))}
                        </View>
                        </>
                        }

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => { onClose(); setImage(null); }}
                            >
                                <Text style={styles.modalButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.modalButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fbff",
        padding: 16,
        paddingTop: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    mainSectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1f1f1f",
        flex: 1,
    },
    itemListButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#28a745",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    itemListButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    serviceCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    serviceCardSelected: {
        borderWidth: 1,
        borderColor: "#007bff",
    },
    serviceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    serviceInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    priceContainer: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 10,
    },
    priceLabel: {
        fontSize: 15,
        color: "#555",
        marginRight: 10,
    },
    priceInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 15,
        backgroundColor: "#f9f9f9",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 8,
    },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 15, fontWeight: '500', color: '#333', marginBottom: 8, marginTop: 10 },
    textInput: { backgroundColor: '#f4f7fc', padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
    categorySelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap' },
    typeButton: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginHorizontal: 4, minWidth: '30%' },
    typeButtonSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
    typeButtonText: { color: '#007bff', fontWeight: '500' },
    typeButtonTextSelected: { color: '#fff' },
    serviceSelectionContainer: { backgroundColor: '#f8f9fa', borderRadius: 8, padding: 10, marginTop: 5 },
    serviceToggleItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
    saveButton: { backgroundColor: '#007bff' },
    modalButtonText: { color: '#fff', fontWeight: 'bold' },
    itemActions: { flexDirection: 'row' },
    actionButton: { padding: 5, marginLeft: 10 },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#eef2f7',
        borderRadius: 10,
        paddingVertical: 8,
        marginBottom: 10,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: '#007bff',
    },
    tabText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#fff',
    },
    imageButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    imageButton: { flexDirection: "row", alignItems: "center", padding: 8 },
    imageButtonText: { marginLeft: 6, color: "#007bff", fontWeight: "500" },
    imagePreview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "#007bff",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },

});
