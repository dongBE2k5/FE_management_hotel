import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-svg";

const ServiceEditorModal = ({ visible, onClose, onSave, service, allRoomTypes }) => {
    // ... code modal giữ nguyên ...
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(null);
    const [image, setImage] = useState(null);
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

        const toggleRoomTypeSelection = (roomTypeId: number) => {
            if (applicableRoomTypes.includes(roomTypeId)) {
                setApplicableRoomTypes(applicableRoomTypes.filter((id: number) => id !== roomTypeId));
            } else {
                setApplicableRoomTypes([...applicableRoomTypes, roomTypeId]);
            }
        };
        console.log(123, service);
        console.log(visible);


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

                            <TextInput
                                style={styles.textInput}
                                placeholder="Giá tiền"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                            />

                            <Text style={styles.inputLabel}>Ảnh dịch vụ</Text>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.imagePreview} />
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
                                            category === service?.type && styles.typeButtonSelected,
                                        ]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                category === service?.type && styles.typeButtonTextSelected,
                                            ]}
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={onClose}
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
};
const styles = StyleSheet.create({
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
})
export default ServiceEditorModal;