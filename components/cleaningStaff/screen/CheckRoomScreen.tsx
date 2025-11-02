import React, { useState, useMemo, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert, // Thêm Alert để thông báo lỗi
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router'; // Import đã được sử dụng
import { useRoute } from '@react-navigation/native';
import { 
    createDamagedItem, 
    getRoomItemsByTypeRoomId,
} from '@/service/RoomItemAPI'; // <-- Giả định 'updateStatusRequest' ở cùng file
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateStatusRequest } from '@/service/Realtime/WebSocketAPI';

// --- COMPONENT: Modal nhập số lượng khi bị thiếu ---
const MissingItemModal = ({ visible, onClose, onConfirm, item }) => {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        // Cập nhật số lượng về 1 mỗi khi mở modal cho item mới
        if (visible) {
            setQuantity(1);
        }
    }, [visible, item]);

    const handleConfirm = () => {
        onConfirm(item, quantity);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Đồ dùng bị thiếu</Text>
                    <View style={styles.itemRow}>
                        <Text style={styles.itemNameText}>{item?.name}</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                            >
                                <Ionicons name="remove" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(q => q + 1)}
                            >
                                <Ionicons name="add" size={24} color="#34C759" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- COMPONENT: Modal xác nhận kiểm tra (Tóm tắt) ---
const ConfirmCheckModal = ({ visible, onClose, onConfirm, checklist, time }) => {

    // Lọc ra các mục không "OK" để hiển thị tóm tắt
    const itemsWithIssues = useMemo(
        () => checklist.filter(item => item.status !== 'ok'),
        [checklist]
    );

    const getStatusText = (item) => {
        if (item.status === 'broken') return 'Hư';
        if (item.status === 'missing') return `Thiếu ${item.quantity}`;
        return 'OK';
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Xác nhận kiểm tra phòng</Text>
                    <View style={styles.summaryList}>
                        <Text style={styles.summaryTitle}>Tình trạng vật dụng</Text>
                        {itemsWithIssues.map(item => (
                            <View key={item.id} style={styles.summaryItem}>
                                <Text style={styles.summaryItemName}>{item.name}</Text>
                                <Text style={[
                                    styles.summaryItemStatus,
                                    item.status === 'broken' && styles.statusBroken,
                                    item.status === 'missing' && styles.statusMissing,
                                ]}>
                                    {getStatusText(item)}
                                </Text>
                            </View>
                        ))}
                        {itemsWithIssues.length === 0 && (
                            <Text style={styles.summaryAllOk}>Tất cả vật dụng đều OK</Text>
                        )}
                    </View>

                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={20} color="#718096" />
                        <Text style={styles.timeText}>Thời gian thực tế: {time}</Text>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function CheckRoomScreen() {
    const navigation = useNavigation(); // Khởi tạo navigation
    const route = useRoute();
    // 'id' từ param chính là 'roomId'
    const { id, roomNumber, roomTypeId, requestId, assignmentId } = route.params;
    console.log("roomid",id, roomNumber, roomTypeId, requestId, assignmentId);
    
    const [checklist, setChecklist] = useState([]); // Khởi tạo mảng rỗng
    const [isMissingModalVisible, setMissingModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Thêm state loading

    useEffect(() => {
        const loadItemData = async () => {
            try {
                setIsLoading(true);
                const data = await getRoomItemsByTypeRoomId(roomTypeId);
                
                // Chuyển đổi dữ liệu API (RoomItem) sang định dạng state (checklist)
                // API: { itemId, itemName, ... }
                // State: { id, name, status: 'ok', quantity: 0 }
                const formattedData = data.map(item => ({
                    id: item.itemId,       // Ánh xạ itemId -> id
                    name: item.itemName,   // Ánh xạ itemName -> name
                    status: 'ok',          // Trạng thái mặc định
                    quantity: 0,           // Số lượng bị ảnh hưởng (hư/thiếu)
                }));
                
                setChecklist(formattedData);
            } catch (error) {
                console.error("Lỗi khi tải danh sách vật dụng:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách vật dụng. Vui lòng thử lại.");
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        loadItemData();
    }, [roomTypeId, navigation]); // Thêm navigation vào dependency array

    // Hàm cập nhật trạng thái
    const setItemStatus = (itemId, status) => {
        setChecklist(prevList =>
            prevList.map(item =>
                item.id === itemId
                    // Khi set về 'ok' hoặc 'broken', reset số lượng về 0
                    ? { ...item, status: status, quantity: (status === 'ok' || status === 'broken') ? 0 : item.quantity }
                    : item
            )
        );
    };

    // Xử lý khi nhấn "Thiếu"
    const handlePressMissing = (item) => {
        setSelectedItem(item);
        setMissingModalVisible(true);
    };

    // Xử lý khi xác nhận số lượng thiếu
    const handleConfirmMissing = (item, quantity) => {
        setChecklist(prevList =>
            prevList.map(i =>
                i.id === item.id ? { ...i, status: 'missing', quantity: quantity } : i
            )
        );
        setMissingModalVisible(false);
        setSelectedItem(null);
    };

    // Xử lý khi nhấn "OK" hoặc "Hư"
    const handlePressStatus = (item, status) => {
        setItemStatus(item.id, status);
    };

    // Xử lý khi nhấn nút xác nhận cuối cùng
    const handleFinalConfirm = async () => {
        const userIdStr = await AsyncStorage.getItem("userId");
        const userId = userIdStr ? Number(userIdStr) : null;

        if (!userId) {
            Alert.alert("Lỗi", "Không xác định được người dùng. Vui lòng đăng nhập lại.");
            return;
        }

        // 1. Lọc ra các mục có vấn đề (không phải 'ok')
        const itemsWithIssues = checklist.filter(item => item.status !== 'ok');

        // 2. Phân nhánh logic
        try {
            if (itemsWithIssues.length > 0) {
                // TRƯỜNG HỢP 1: CÓ VẤN ĐỀ
                
                // 2a. Tạo mảng request hỏng hóc
                const damagedItemRequests = itemsWithIssues.map(item => {
                    let serverStatus = '';
                    if (item.status === 'broken') {
                        serverStatus = 'DAMAGED';
                    } else if (item.status === 'missing') {
                        serverStatus = 'MISSING';
                    }

                    return {
                        roomId: id,
                        itemId: item.id,
                        quantityAffected: item.status === 'broken' ? 1 : item.quantity,
                        status: serverStatus,
                        image: null,
                        reportedBy: userId,
                        requestStaffId: requestId // Gửi kèm requestId từ param
                    };
                });

                // 2b. Gửi request hỏng hóc
                const promises = damagedItemRequests.map(request => createDamagedItem(request));
                await Promise.all(promises);
                
                // 2c. Cập nhật request chính là "HAS_ISSUE"
                await updateStatusRequest(requestId, "HAS_ISSUE", id, assignmentId);
                
                console.log("Đã báo cáo thành công các mục:", damagedItemRequests);
                Alert.alert("Thành công", "Đã ghi nhận tình trạng phòng (Có vấn đề).");

            } else {
                // TRƯỜNG HỢP 2: KHÔNG CÓ VẤN ĐỀ
                
                // 2a. Cập nhật request chính là "NO_ISSUE"
                console.log("cập nhận request",requestId,id,assignmentId);
                await updateStatusRequest(requestId, "NO_ISSUE", id, assignmentId);
                
                console.log("Không có vấn đề, đã cập nhật request sang NO_ISSUE.");
                Alert.alert("Thành công", "Đã ghi nhận tình trạng phòng (Tất cả OK).");
            }
        
        } catch (error) {
            // 3. Xử lý lỗi chung
            console.error("Lỗi khi gửi báo cáo hỏng hóc hoặc cập nhật status:", error);
            Alert.alert("Lỗi", "Thao tác thất bại. Vui lòng thử lại.");
        } finally {
            // 4. Luôn đóng modal và quay lại
            setConfirmModalVisible(false);
            navigation.goBack();
        }
    };

    // Lấy thời gian hiện tại
    const currentTime = new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1A202C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết kiểm tra phòng</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Thông tin phòng */}
            <View style={styles.roomInfo}>
                <Ionicons name="keypad-outline" size={20} color="#0062E0" />
                <Text style={styles.roomNumber}>Phòng {roomNumber}</Text>
            </View>

            {/* Danh sách */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <Text style={styles.listTitle}>Danh sách kiểm tra</Text>
                    {checklist.map(item => (
                        <View key={item.id} style={styles.checkItemCard}>
                            <Text style={styles.checkItemName}>{item.name}</Text>
                            <View style={styles.statusOptions}>
                                {/* Nút OK */}
                                <TouchableOpacity
                                    style={[styles.statusButton, item.status === 'ok' && styles.okSelected]}
                                    onPress={() => handlePressStatus(item, 'ok')}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color={item.status === 'ok' ? '#34C759' : '#CBD5E0'} />
                                    <Text style={[styles.statusText, item.status === 'ok' && styles.okText]}>OK</Text>
                                </TouchableOpacity>

                                {/* Nút Thiếu */}
                                <TouchableOpacity
                                    style={[styles.statusButton, item.status === 'missing' && styles.missingSelected]}
                                    onPress={() => handlePressMissing(item)}
                                >
                                    <Ionicons name="alert-circle" size={20} color={item.status === 'missing' ? '#FF9500' : '#CBD5E0'} />
                                    <Text style={[styles.statusText, item.status === 'missing' && styles.missingText]}>
                                        {item.status === 'missing' && item.quantity > 0 ? `Thiếu ${item.quantity}` : 'Thiếu'}
                                    </Text>
                                </TouchableOpacity>

                                {/* Nút Hư */}
                                <TouchableOpacity
                                    style={[styles.statusButton, item.status === 'broken' && styles.brokenSelected]}
                                    onPress={() => handlePressStatus(item, 'broken')}
                                >
                                    <Ionicons name="close-circle" size={20} color={item.status === 'broken' ? '#FF3B30' : '#CBD5E0'} />
                                    <Text style={[styles.statusText, item.status === 'broken' && styles.brokenText]}>Hư</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Nút xác nhận */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.mainConfirmButton, isLoading && styles.disabledButton]} // Vô hiệu hóa khi đang tải
                    onPress={() => setConfirmModalVisible(true)}
                    disabled={isLoading}
                >
                    <Text style={styles.mainConfirmButtonText}>Xác nhận kiểm tra</Text>
                </TouchableOpacity>
            </View>

            {/* Modals */}
            {selectedItem && ( // Chỉ render modal khi có selectedItem
                <MissingItemModal
                    visible={isMissingModalVisible}
                    onClose={() => setMissingModalVisible(false)}
                    onConfirm={handleConfirmMissing}
                    item={selectedItem}
                />
            )}
            <ConfirmCheckModal
                visible={isConfirmModalVisible}
                onClose={() => setConfirmModalVisible(false)}
                onConfirm={handleFinalConfirm}
                checklist={checklist}
                time={currentTime.replace(', ', ' ')}
            />
        </SafeAreaView>
    );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA', // Nền xám siêu nhạt
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    backButton: {
        padding: 5,
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0062E0',
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#718096',
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    checkItemCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    checkItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: 15,
    },
    statusOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        flex: 1, // Giúp các nút chia đều không gian
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Căn giữa nội dung nút
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        marginHorizontal: 4, // Thêm khoảng cách nhỏ giữa các nút
    },
    statusText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#CBD5E0',
    },
    // Trạng thái khi được chọn
    okSelected: {
        backgroundColor: '#E6F7EB',
        borderColor: '#34C759',
    },
    okText: {
        color: '#34C759',
    },
    missingSelected: {
        backgroundColor: '#FFF8E5',
        borderColor: '#FF9500',
    },
    missingText: {
        color: '#FF9500',
    },
    brokenSelected: {
        backgroundColor: '#FFF0F0',
        borderColor: '#FF3B30',
    },
    brokenText: {
        color: '#FF3B30',
    },
    // Footer
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    mainConfirmButton: {
        backgroundColor: '#2563EB', // Màu xanh dương
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A0AEC0', // Màu xám khi bị vô hiệu hóa
    },
    mainConfirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal chung
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '90%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#EDF2F7',
        marginRight: 10,
    },
    confirmButton: {
        backgroundColor: '#34C759', // Màu xanh lá
        marginLeft: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A202C', // Màu chữ cho nút Hủy
    },
    // Modal "Thiếu"
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    itemNameText: {
        fontSize: 16,
        color: '#1A202C',
        fontWeight: '600',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        padding: 5,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#1A202C',
        minWidth: 30, // Đảm bảo số không bị nhảy layout
        textAlign: 'center',
    },
    // Modal "Xác nhận"
    summaryList: {
        backgroundColor: '#F5F8FA',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        maxHeight: 200, // Thêm chiều cao tối đa và cho phép cuộn
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 10,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    summaryItemName: {
        fontSize: 16,
        color: '#4A5568',
        flex: 1, // Cho phép tên xuống dòng
    },
    summaryItemStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10, // Thêm khoảng cách
    },
    statusBroken: {
        color: '#FF3B30',
    },
    statusMissing: {
        color: '#FF9500',
    },
    summaryAllOk: {
        fontSize: 16,
        color: '#34C759',
        textAlign: 'center',
        padding: 10,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    timeText: {
        fontSize: 14,
        color: '#718096',
        marginLeft: 8,
    }
});