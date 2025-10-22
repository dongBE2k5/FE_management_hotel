import RoomRequest from '@/models/Room/RoomRequest';
import TypeOfRoomResponse from '@/models/TypeOfRoom/TypeOfRoomResponse';
import { addRoom } from '@/service/RoomAPI';
import { getTypeOfRoomByHotel } from '@/service/TypeOfRoomService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- DỮ LIỆU MOCKUP ---
const mockRoomTypes = [
    { id: '1', name: 'Phòng Standard' },
    { id: '2', name: 'Phòng Deluxe' },
    { id: '3', name: 'Phòng Suite' },
    { id: '4', name: 'Bungalow Garden View' },
];

// Hàm giả lập để xử lý việc thêm phòng
const mockOnAddRooms = (newRooms: RoomRequest[]) => {
    console.log('Phòng mới được thêm (giả lập):', newRooms);
    // Hiển thị Alert thay vì gọi hàm thật
    Alert.alert(
        "Mockup: Thêm thành công",
        `Đã thêm ${newRooms.length} phòng mới:\n${newRooms.map(r => r.id).join(', ')}`
    );
};

// --- NAVIGATION GIẢ ---
const mockNavigation = {
    goBack: () => Alert.alert("Hành động", "Đã nhấn nút quay lại!"),
};


// --- COMPONENT CHÍNH ĐÃ SỬA ---
// Cung cấp giá trị mặc định cho props để chạy độc lập
export default function AddRoomScreen({ route, navigation = mockNavigation }) {
    // Nếu có route.params thì dùng, không thì dùng dữ liệu giả
    const onAddRooms = route?.params?.onAddRooms || mockOnAddRooms;
    const [roomTypes, setRoomTypes] = useState<TypeOfRoomResponse>();
    const [selectedType, setSelectedType] = useState(null);
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [roomNumbers, setRoomNumbers] = useState('');
    const hotelId = 2;
    useEffect(() => {
        const fetchRoomTypes = async () => {
           
            const typeOfRoom = await getTypeOfRoomByHotel(hotelId);
            console.log(typeOfRoom);
            setRoomTypes(typeOfRoom);
        };
        fetchRoomTypes();
    }, []);

    const handleAddRooms = async () => {
        if (!selectedType || !price || !roomNumbers || !description) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
            return;
        }

        const numbers = roomNumbers.split(',').map(num => num.trim()).filter(Boolean);
        if (numbers.length === 0) {
            Alert.alert("Lỗi", "Số phòng không hợp lệ. Vui lòng nhập các số phòng cách nhau bởi dấu phẩy.");
            return;
        }
        console.log(selectedType);
        const newRooms: RoomRequest[] = numbers.map(number => ({
            roomNumber: number,
            typeRoomId: selectedType.id,
            status: 'AVAILABLE',
            price: parseInt(price),
            description: description,
            hotelId: hotelId,
            // details: [
            //     { id: `dt_${number}_1`, icon: 'bed-outline', label: '1 Giường' },
            //     { id: `dt_${number}_2`, icon: 'people-outline', label: '2 người' },
            //     { id: `dt_${number}_3`, icon: 'wifi', label: 'Wifi miễn phí' },
            // ],
            // usedServices: {},
            // pastBookings: [],
        }));
        console.log(newRooms);

        const response = await addRoom(newRooms);

        // Gọi hàm onAddRooms (có thể là hàm thật hoặc hàm giả)
        onAddRooms(response);
        Alert.alert("Thêm phòng thành công", "Phòng được thêm thành công!");

        // Sau khi gọi hàm giả, chúng ta không cần thêm Alert ở đây nữa
        // vì hàm giả đã làm điều đó.

        // Quay lại màn hình trước đó
        // navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm phòng mới</Text>
                <View style={{ width: 28 }} />
            </View>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>1. Chọn loại phòng</Text>
                <View style={styles.typeSelector}>
                    {roomTypes?.data?.map(type => (
                        <TouchableOpacity
                            key={type.id}
                            style={[styles.typeButton, selectedType?.id === type.id && styles.typeButtonSelected]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[styles.typeButtonText, selectedType?.id === type.id && styles.typeButtonTextSelected]}>{type.room == "DON" ? "Phòng Đơn" : type.room == "DOI" ? "Phòng Đôi" : "Phòng Gia Đình"}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>2. Nhập giá phòng (/đêm)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="vd: 1200000"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.label}>3. Nhập mô tả</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="vd: Phòng 101 là phòng đơn, phòng 102 là phòng đôi, phòng 103 là phòng gia đình"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>3. Nhập số phòng (cách nhau bởi dấu phẩy)</Text>
                <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="vd: 101, 102, 103, 201"
                    multiline
                    value={roomNumbers}
                    onChangeText={setRoomNumbers}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleAddRooms}>
                    <Ionicons name="add-circle" size={22} color="#fff" />
                    <Text style={styles.saveButtonText}>Thêm phòng</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles (Không thay đổi) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: { fontSize: 20, fontWeight: '600' },
    closeButton: { padding: 5 },
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
        marginTop: 15,
    },
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
    textInput: {
        backgroundColor: '#f4f7fc',
        padding: 15,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#28a745',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});