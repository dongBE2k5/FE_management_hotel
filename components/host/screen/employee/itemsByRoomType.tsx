import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView,
    TouchableOpacity, Modal, TextInput, Alert, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useHost } from '@/context/HostContext';
import { getAllItemsByHotel, getTypeOffRoomItem } from '@/service/ItemAPI';
import { getAllTypeRooms } from '@/service/TypeOfRoomService';
import {
    createOrUpdateRoomItems,
    RoomItemRequestDTO
} from '@/service/type_off_room_itemAPI';
import { router } from 'expo-router';

// --- 1. ĐỊNH NGHĨA MODEL (Giữ nguyên) ---
interface TypeOfRoom {
    id: number;
    room: string;
}
interface Item {
    id: number;
    name: string;
    price: number | null;
    hotelId: number;
}
interface typeOffRoomItem {
    typeOfRoomId: number;
    typeOfRoomName: string;
    itemId: number;
    itemName: string;
    quantity: number;
}

// --- 2. HÀM HELPER (Giữ nguyên) ---

/**
 * Hàm này "làm đẹp" tên phòng để hiển thị.
 * Ví dụ: "GIA_DINH" -> "Gia Đình", "DON" -> "Đơn"
 */
const formatRoomName = (name: string): string => {
    if (!name) return '';

    // Các trường hợp đặc biệt
    if (name.toUpperCase() === 'GIA_DINH') return 'Gia Đình';
    if (name.toUpperCase() === 'DON') return 'Đơn';
    if (name.toUpperCase() === 'DOI') return 'Đôi';

    // Trường hợp chung: Viết hoa chữ cái đầu và chuyển thành chữ thường
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};


// --- 3. COMPONENT CHÍNH ---

export default function ItemsByRoomType() {
    // --- LOGIC (Giữ nguyên) ---
    const navigation = useNavigation<any>();
    const { hotelId } = useHost();
    const [loading, setLoading] = useState(true);
    const [roomTypes, setRoomTypes] = useState<TypeOfRoom[]>([]);
    const [itemsByRoomType, setItemsByRoomType] = useState<Map<number, typeOffRoomItem[]>>(new Map());
    const [activeRoomTypeId, setActiveRoomTypeId] = useState<number | null>(null);
    const [masterItems, setMasterItems] = useState<Item[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<typeOffRoomItem | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [itemQuantity, setItemQuantity] = useState('1');
    const [selectedTypeOfRoomId, setSelectedTypeOfRoomId] = useState<number | null>(null);

    const fetchData = async () => {
        if (!hotelId) return;
        setLoading(true);
        try {
            const [roomTypesData, masterItemsData, roomItemsRaw] = await Promise.all([
                getAllTypeRooms(),
                getAllItemsByHotel(hotelId),
                getTypeOffRoomItem(hotelId)
            ]);
            setRoomTypes(roomTypesData);
            setMasterItems(masterItemsData);
            const groupedMap = new Map<number, typeOffRoomItem[]>();
            roomTypesData.forEach(room => {
                const itemsOfRoom: typeOffRoomItem[] = roomItemsRaw
                    .filter(i => i.typeOfRoomId === room.id);
                groupedMap.set(room.id, itemsOfRoom);
            });
            setItemsByRoomType(groupedMap);
            if (roomTypesData.length > 0 && !activeRoomTypeId) { 
                setActiveRoomTypeId(roomTypesData[0].id);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [hotelId]));
    const resetForm = () => { setItemQuantity('1'); };

    const handleAddItem = () => {
        if (!activeRoomTypeId) {
             Alert.alert("Thông báo", "Vui lòng chọn một loại phòng trước.");
             return;
        }
        resetForm();
        setSelectedItem(null);
        setIsEditing(false);
        setSelectedTypeOfRoomId(activeRoomTypeId); 
        const itemsForThisRoom = availableItems; 
        if (itemsForThisRoom.length > 0) {
            setSelectedItemId(itemsForThisRoom[0].id);
        } else {
            setSelectedItemId(null); 
        }
        setModalVisible(true);
    };

    const handleEditItem = (item: typeOffRoomItem) => {
        resetForm(); 
        setSelectedItem(item);
        setIsEditing(true);
        setSelectedItemId(item.itemId);
        setItemQuantity(String(item.quantity));
        setSelectedTypeOfRoomId(item.typeOfRoomId);
        setModalVisible(true);
    };

    const handleDeleteItem = (item: typeOffRoomItem) => {
        Alert.alert("Xác nhận xóa", `Xóa "${item.itemName}"?`, [
            { text: "Hủy" },
            { text: "Xóa", style: "destructive", onPress: async () => {
                try {
                    setLoading(true);
                    // TODO: Gọi API Xóa
                    Alert.alert("THÀNH CÔNG (GIẢ)", "Đã xóa (chưa gọi API thật)");
                    fetchData();
                } catch (error) {
                    console.error("Lỗi khi xóa:", error);
                    Alert.alert("Lỗi", "Không thể xóa vật dụng.");
                    setLoading(false);
                }
            }}
        ]);
    };

    const handleSaveItem = async () => {
        if (!selectedItemId || !selectedTypeOfRoomId) {
            Alert.alert("Lỗi", "Vui lòng chọn loại phòng và vật dụng.");
            return;
        }
        const quantityNum = parseInt(itemQuantity, 10) || 0;
        if (quantityNum <= 0 || quantityNum > 100) {
            Alert.alert("Lỗi", "Số lượng phải là một số từ 1 đến 100.");
            return;
        }
        const payload: RoomItemRequestDTO = {
            typeOfRoomId: Number(selectedTypeOfRoomId),
            itemId: Number(selectedItemId),
            quantity: quantityNum
        };
        try {
            setLoading(true);
            const message = await createOrUpdateRoomItems(payload); 
            Alert.alert("Thành công", message || "Đã lưu thành công");
            setModalVisible(false);
            fetchData(); 
        } catch (error) {
            console.error("Lỗi khi lưu vật dụng:", error);
            const errorMessage = (error.response?.data?.message)
                ? error.response.data.message
                : "Không thể lưu vật dụng. Vật dụng này có thể đã tồn tại?";
            Alert.alert("Lỗi", errorMessage);
            setLoading(false);
        }
    };

    const handleNavigateToMasterList = () => {
        setModalVisible(false);
        try {
            navigation.navigate('ItemListHotel');
        } catch (err) {
            console.error("Lỗi điều hướng:", err);
            Alert.alert("Lỗi", "Không thể mở trang. Bạn đã đăng ký màn hình 'ItemListHotel' chưa?");
        }
    };

    const activeItems = useMemo(() => {
        if (!activeRoomTypeId) return [];
        return itemsByRoomType.get(activeRoomTypeId) || [];
    }, [activeRoomTypeId, itemsByRoomType]);

    const availableItems = useMemo(() => {
        if (isEditing) {
            return masterItems;
        }
        const itemsForSelectedRoom = itemsByRoomType.get(selectedTypeOfRoomId) || [];
        const existingItemIdSet = new Set(
            itemsForSelectedRoom.map(item => item.itemId)
        );
        return masterItems.filter(
            masterItem => !existingItemIdSet.has(masterItem.id)
        );
    }, [isEditing, selectedTypeOfRoomId, itemsByRoomType, masterItems]); 

    // --- BẮT ĐẦU PHẦN GIAO DIỆN (JSX) ---

    if (loading && itemsByRoomType.size === 0) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    const renderItem = ({ item }: { item: typeOffRoomItem }) => {
        const masterItem = masterItems.find(mi => mi.id === item.itemId);
        const price = masterItem ? (masterItem.price || 0) : 0; 
        return (
            <View style={styles.itemContainer}>
                <View style={styles.itemMain}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemDetails}>
                        {price.toLocaleString('vi-VN')} VNĐ x {item.quantity}
                    </Text>
                </View>
                <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEditItem(item)}>
                        <Ionicons name="pencil" size={20} color={colors.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteItem(item)}>
                        <Ionicons name="remove-circle" size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* --- Header (Giữ nguyên) --- */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => router.push('/service')}
                >
                    <Ionicons name="arrow-back" size={26} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vật dụng theo Loại phòng</Text>
                <TouchableOpacity
                    onPress={handleNavigateToMasterList}
                    style={styles.headerButton}
                >
                    <Ionicons name="settings-outline" size={26} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* --- Thanh Tab (Thiết kế lại theo hình mẫu) --- */}
            <View style={styles.tabBarContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBar}
                >
                    {roomTypes.map((room) => (
                        <TouchableOpacity
                            key={room.id}
                            style={[
                                styles.tabButton,
                                activeRoomTypeId === room.id && styles.tabButtonActive
                            ]}
                            onPress={() => setActiveRoomTypeId(room.id)}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                activeRoomTypeId === room.id && styles.tabButtonTextActive
                            ]}>
                                {formatRoomName(room.room)} {/* Áp dụng hàm format */}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* --- Danh sách (FlatList) --- */}
            <FlatList
                data={activeItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.itemId}-${index}`}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có vật dụng nào được gán.</Text>
                    </View>
                )}
                contentContainerStyle={styles.listContentContainer}
            />

            {/* --- Nút Thêm FAB (Giữ nguyên) --- */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddItem}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* --- Modal (Cập nhật Picker) --- */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {isEditing ? "Chỉnh sửa vật dụng" : "Thêm vật dụng mới"}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Ionicons name="close-circle" size={28} color={colors.placeholder} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <Text style={styles.inputLabel}>Loại phòng *</Text>
                            <View style={[styles.pickerContainer, styles.pickerContainerDisabled]}>
                                <Picker
                                    selectedValue={selectedTypeOfRoomId}
                                    enabled={false} 
                                    style={styles.picker}
                                >
                                    {roomTypes.map((type) => (
                                        <Picker.Item 
                                            key={type.id} 
                                            label={formatRoomName(type.room)} /* Áp dụng hàm format */
                                            value={type.id} 
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={styles.inputLabel}>Tên vật dụng *</Text>
                            <View style={[
                                styles.pickerContainer, 
                                !isEditing ? styles.pickerContainerEnabled : styles.pickerContainerDisabled
                            ]}>
                                <Picker
                                    selectedValue={selectedItemId}
                                    onValueChange={(itemValue) => setSelectedItemId(itemValue)}
                                    enabled={!isEditing}
                                    style={styles.picker}
                                >
                                    {availableItems.length > 0 ? (
                                        availableItems.map((item) => (
                                            <Picker.Item key={item.id} label={item.name} value={item.id} />
                                        ))
                                    ) : (
                                        <Picker.Item label="Đã thêm tất cả vật dụng" value={null} enabled={false} />
                                    )}
                                </Picker>
                            </View>

                            <Text style={styles.inputLabel}>Số lượng *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nhập số lượng (1-100)"
                                placeholderTextColor={colors.placeholder}
                                value={itemQuantity}
                                onChangeText={setItemQuantity}
                                keyboardType="numeric"
                                maxLength={3}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonTextCancel}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.modalButton, 
                                        styles.saveButton,
                                        (!isEditing && availableItems.length === 0) && styles.saveButtonDisabled
                                    ]} 
                                    onPress={handleSaveItem}
                                    disabled={!isEditing && availableItems.length === 0}
                                >
                                    <Text style={styles.modalButtonText}>Lưu</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- BẢNG MÀU VÀ STYLESHEET (Cập nhật style cho Tab theo hình mẫu) ---

const colors = {
    primary: '#007AFF', 
    danger: '#FF3B30', 
    warning: '#FF9500', 
    text: '#1C1C1E', 
    textSecondary: '#6E6E73', 
    placeholder: '#AEAEB2', 
    background: '#F2F2F7', 
    card: '#FFFFFF', 
    border: '#D1D1D6', 
    overlay: 'rgba(0,0,0,0.5)', 
    disabled: '#EFEFF4', 
    disabledText: '#9C9C9D', 
};

const styles = StyleSheet.create({
    // --- Layout Chính ---
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background
    },
    listContentContainer: {
        paddingBottom: 100, // Tăng padding cho FAB
    },

    // --- Header ---
    header: { 
        paddingTop: Platform.OS === 'android' ? 40 : 50, 
        paddingBottom: 16, 
        paddingHorizontal: 20, 
        backgroundColor: colors.card, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: colors.text 
    },
    headerButton: { // Nút phải (Settings)
        position: 'absolute',
        right: 16,
        top: Platform.OS === 'android' ? 38 : 48,
        padding: 8,
    },
    headerBackButton: { // Nút trái (Back)
        position: 'absolute',
        left: 16,
        top: Platform.OS === 'android' ? 38 : 48,
        padding: 8,
    },

    // --- Thanh Tab (STYLE MỚI ĐỂ TRÔNG NHƯ HÌNH BẠN CUNG CẤP) ---
    tabBarContainer: {
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 8, // Thêm padding trên dưới cho cả thanh
    },
    tabBar: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'center', // Căn giữa các tab
        alignSelf: 'center', // Quan trọng để ScrollView căn giữa các item nếu nội dung không đủ rộng
        paddingHorizontal: 16, // Padding để các tab không dính sát viền
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20, // Tăng padding ngang để tab rộng hơn
        borderRadius: 8, // Bo tròn các góc
        marginHorizontal: 4, // Khoảng cách giữa các tab
        backgroundColor: colors.disabled, // Màu nền tab không active
    },
    tabButtonActive: {
        backgroundColor: colors.primary, // Màu nền tab active (màu xanh)
    },
    tabButtonText: {
        fontSize: 15,
        fontWeight: '500', 
        color: colors.textSecondary, // Màu chữ tab không active (xám)
    },
    tabButtonTextActive: {
        color: colors.card, // Màu chữ tab active (trắng)
        fontWeight: '600', 
    },
    
    // --- Item Card (Giữ nguyên) ---
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginVertical: 8, 
        padding: 16,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    itemMain: { 
        flex: 1,
        marginRight: 12
    },
    itemName: { 
        fontSize: 17, 
        fontWeight: '600', 
        color: colors.text,
        marginBottom: 4
    },
    itemDetails: { 
        fontSize: 15, 
        color: colors.textSecondary 
    },
    itemActions: { 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: 12 
    },
    actionButton: { 
        padding: 4 
    },

    // --- Empty State (Giữ nguyên) ---
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 100
    },
    emptyText: { 
        fontSize: 16, 
        color: colors.textSecondary
    },
    
    // --- Nút FAB (Giữ nguyên) ---
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        backgroundColor: colors.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },

    // --- Modal (Giữ nguyên) ---
    modalOverlay: { 
        flex: 1, 
        justifyContent: 'flex-end', 
        backgroundColor: colors.overlay
    },
    modalContent: { 
        width: '100%', 
        maxHeight: '90%', 
        backgroundColor: colors.card, 
        borderTopRightRadius: 20, 
        borderTopLeftRadius: 20,
        padding: 20,
        paddingTop: 16,
    },
    modalHeader: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 20,
        paddingVertical: 4
    },
    modalTitle: { 
        flex: 1, 
        textAlign: 'center', 
        fontSize: 18, 
        fontWeight: '600', 
        color: colors.text,
        marginLeft: 28 
    }, 
    closeButton: { 
        position: 'absolute',
        right: 0,
        top: 0,
    },
    inputLabel: { 
        fontSize: 15, 
        fontWeight: '500', 
        color: colors.text, 
        marginBottom: 8, 
        marginTop: 12 
    },
    textInput: { 
        backgroundColor: colors.disabled, 
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10, 
        fontSize: 16, 
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border
    },
    pickerContainer: {
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        overflow: 'hidden', 
    },
    pickerContainerEnabled: {
        backgroundColor: colors.disabled,
        borderColor: colors.border,
    },
    pickerContainerDisabled: {
        backgroundColor: colors.disabledText, // Làm cho nó xám hơn
        borderColor: colors.border,
    },
    picker: {
        height: 50,
        width: '100%',
        color: colors.text,
    },
    modalActions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 24, 
        gap: 12 
    },
    modalButton: { 
        flex: 1, 
        paddingVertical: 14, 
        borderRadius: 10, 
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButton: { 
        backgroundColor: colors.disabled 
    },
    saveButton: { 
        backgroundColor: colors.primary 
    },
    saveButtonDisabled: {
        backgroundColor: colors.placeholder, 
    },
    modalButtonText: { 
        color: colors.card, 
        fontWeight: '600', 
        fontSize: 16 
    },
    modalButtonTextCancel: { 
        color: colors.textSecondary, 
        fontWeight: '600', 
        fontSize: 16 
    },
});