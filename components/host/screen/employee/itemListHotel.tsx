// ItemListHotel.tsx
import { useHost } from '@/context/HostContext';
import { Item, ItemCreateDTO } from '@/models/Item';
import { createItem, getAllItemsByHotel } from '@/service/ItemAPI';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { 
    ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, 
    Text, TextInput, TouchableOpacity, View, SafeAreaView, Platform 
} from 'react-native';

export default function ItemListHotel() {
    const router = useRouter();
    const { hotelId } = useHost();
    
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false); // Dùng cho cả lưu và tải
    const [isPageLoading, setIsPageLoading] = useState(true); // Dùng riêng cho tải lần đầu
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState(''); 
    
    const fetchData = async () => {
        if (!hotelId) return;
        
        try {
            setIsPageLoading(true); // Bắt đầu loading trang
            const itemsData = await getAllItemsByHotel(hotelId);
            if (itemsData) {
                setItems(itemsData);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            Alert.alert("Lỗi", "Không thể tải danh sách vật dụng.");
        } finally {
            setIsPageLoading(false); // Hoàn thành loading trang
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [hotelId])
    );

    // Mở modal để thêm mới
    const handleAddItem = () => {
        setSelectedItem(null);
        setIsEditing(false);
        setItemName('');
        setItemPrice(''); 
        setModalVisible(true);
    };

    // Mở modal để chỉnh sửa
    const handleEditItem = (item: Item) => {
        setSelectedItem(item);
        setIsEditing(true);
        setItemName(item.name);
        setItemPrice(String(item.price || '')); 
        setModalVisible(true);
    };

    // Xử lý nút xóa
    const handleDeleteItem = (item: Item) => {
        // TODO: Backend chưa hỗ trợ
        Alert.alert("Thông báo", "Backend hiện chưa hỗ trợ API xóa vật dụng.");
    };

    // Xử lý lưu (Thêm mới hoặc Cập nhật)
    const handleSaveItem = async () => {
        if (!itemName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên vật dụng.");
            return;
        }

        if (!hotelId) {
            Alert.alert("Lỗi", "Không tìm thấy ID khách sạn. Vui lòng thử lại.");
            return;
        }
        
        const priceValue = parseFloat(itemPrice);
        if (isNaN(priceValue) || priceValue < 0) {
            Alert.alert("Lỗi", "Giá không hợp lệ. Vui lòng nhập một con số (ví dụ: 50000).");
            return;
        }

        try {
            setLoading(true); // Bắt đầu loading (cho nút)

            if (isEditing && selectedItem) {
                // --- TRƯỜNG HỢP SỬA ---
                // TODO: Backend chưa hỗ trợ
                Alert.alert(
                    "Thông báo",
                    "Backend hiện chưa hỗ trợ API cập nhật vật dụng."
                );
                setLoading(false);
                return;
            }

            // --- TRƯỜNG HỢP THÊM MỚI ---
            const newItemDTO: ItemCreateDTO = {
                name: itemName.trim(),
                price: priceValue,
                hotelId: hotelId, 
            };

            const result = await createItem(newItemDTO);

            if (result) {
                Alert.alert("Thành công", "Thêm vật dụng thành công.");
                setModalVisible(false);
                fetchData(); // Tải lại danh sách
            }
        } catch (error) {
            console.error("Lỗi khi lưu item:", error);
            const errorMessage = (error.response?.data?.message)
                ? error.response.data.message
                : "Thao tác thất bại. Vật dụng có thể đã tồn tại?";
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setLoading(false); // Dừng loading (cho nút)
        }
    };

    // Logic state loading ban đầu
    if (isPageLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    // Giao diện chính
    return (
        <SafeAreaView style={styles.container}>
            {/* --- Header --- */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={26} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vật dụng chung</Text>
                <View style={styles.headerButton} /> {/* Placeholder để căn giữa title */}
            </View>

            {/* --- Danh sách (ScrollView) --- */}
            {/* Hiển thị loading nhỏ khi đang refresh */}
            {loading && !isPageLoading && <ActivityIndicator style={styles.listLoadingIndicator} />}

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {items.length === 0 && !isPageLoading ? (
                    // --- Trạng thái rỗng ---
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={64} color={colors.placeholder} />
                        <Text style={styles.emptyText}>Chưa có vật dụng nào</Text>
                        <Text style={styles.emptySubText}>Nhấn nút + ở góc dưới để thêm</Text>
                    </View>
                ) : (
                    // --- Render danh sách ---
                    items.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            {/* Thông tin Tên & Giá */}
                            <View style={styles.itemMainContent}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>
                                    {(item.price || 0).toLocaleString('vi-VN')} VNĐ
                                </Text>
                            </View>

                            {/* Các nút hành động */}
                            <View style={styles.itemActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleEditItem(item)}
                                >
                                    <Ionicons name="pencil" size={20} color={colors.warning} />
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleDeleteItem(item)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* --- Nút Add (FAB) --- */}
            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddItem}
            >
                <Ionicons name="add" size={30} color={colors.card} />
            </TouchableOpacity>

            {/* --- Modal Thêm/Sửa --- */}
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
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close-circle" size={28} color={colors.placeholder} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView keyboardShouldPersistTaps="handled">
                            <Text style={styles.inputLabel}>Tên vật dụng *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ví dụ: Khăn tắm"
                                placeholderTextColor={colors.placeholder}
                                value={itemName}
                                onChangeText={setItemName}
                            />
                            
                            <Text style={styles.inputLabel}>Giá * </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Ví dụ: 50000"
                                placeholderTextColor={colors.placeholder}
                                value={itemPrice} 
                                onChangeText={setItemPrice}
                                keyboardType="numeric"
                            />
                            
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                    disabled={loading} 
                                >
                                    <Text style={styles.modalButtonTextCancel}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleSaveItem}
                                    disabled={loading} 
                                >
                                {loading ? (
                                    <ActivityIndicator size="small" color={colors.card} />
                                ) : (
                                    <Text style={styles.modalButtonText}>Lưu</Text>
                                )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// --- BẢNG MÀU VÀ STYLESHEET CHUYÊN NGHIỆP ---

const colors = {
    primary: '#007AFF',
    danger: '#FF3B30',
    warning: '#FF9500',
    
    textPrimary: '#1C1C1E',
    textSecondary: '#6E6E73',
    placeholder: '#AEAEB2',
    
    background: '#F2F2F7',
    card: '#FFFFFF',
    border: '#D1D1D6',
    
    overlay: 'rgba(0,0,0,0.5)',
    disabled: '#EFEFF4',
};

const styles = StyleSheet.create({
    // --- Layout & Loading ---
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 10,
        color: colors.textSecondary,
        fontSize: 16,
    },
    listLoadingIndicator: {
        paddingVertical: 10,
    },

    // --- Header ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingBottom: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerButton: {
        width: 44, // Kích thước chuẩn cho vùng bấm
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: 'center',
    },

    // --- Danh sách & Card ---
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingVertical: 16, // Khoảng cách cho card đầu tiên và cuối cùng
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12, // Khoảng cách giữa các card
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemMainContent: {
        flex: 1, // Chiếm phần lớn
        marginRight: 16,
    },
    itemName: {
        fontSize: 17,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 16, // Khoảng cách giữa 2 nút Sửa/Xóa
    },
    actionButton: {
        padding: 4,
    },

    // --- Trạng thái rỗng ---
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100, // Đẩy lên giữa màn hình
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textSecondary,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 15,
        color: colors.placeholder,
        marginTop: 8,
    },

    // --- Nút Add (FAB) ---
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

    // --- Modal ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end', // Trượt từ dưới lên
        backgroundColor: colors.overlay,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30, // Thêm không gian cho nút
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative', // Để nút close_absolute
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: -8, // Dịch ra ngoài lề 1 chút
        top: -4,
    },

    // --- Form trong Modal ---
    inputLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: 8,
        marginTop: 12,
    },
    textInput: {
        backgroundColor: colors.disabled,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        fontSize: 16,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },

    // --- Nút trong Modal ---
    modalActions: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.disabled,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    modalButtonText: {
        color: colors.card,
        fontWeight: '600',
        fontSize: 16,
    },
    modalButtonTextCancel: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 16,
    },
});