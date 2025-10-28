import React, { useState, useMemo } from 'react';
import { 
    SafeAreaView, 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

// Dữ liệu giả cho danh sách cần kiểm tra
const initialChecklist = [
    { id: 'item_1', name: 'Giường', status: 'ok', quantity: 0 },
    { id: 'item_2', name: 'Nước có sẵn', status: 'ok', quantity: 0 },
    { id: 'item_3', name: 'Khăn tắm có sẵn', status: 'ok', quantity: 0 },
    { id: 'item_4', name: 'Vật dụng khác', status: 'ok', quantity: 0 },
    { id: 'item_5', name: 'Giường (phụ)', status: 'ok', quantity: 0 },
];

// --- COMPONENT: Modal nhập số lượng khi bị thiếu ---
const MissingItemModal = ({ visible, onClose, onConfirm, item }) => {
    const [quantity, setQuantity] = useState(1);

    const handleConfirm = () => {
        onConfirm(item, quantity);
        setQuantity(1); // Reset
    };

    const handleClose = () => {
        onClose();
        setQuantity(1); // Reset
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
                            <Text style={styles.buttonText}>Xác nhận</Text>
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
                        <Text style={styles.summaryTitle}>Danh sách vật dụng có trong phòng</Text>
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
                            <Text style={styles.buttonText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function CheckRoomScreen(id,status,priority,on) {
        const navigation = useNavigation();
    const [checklist, setChecklist] = useState(initialChecklist);
    const [isMissingModalVisible, setMissingModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // Hàm cập nhật trạng thái
    const setItemStatus = (itemId, status) => {
        setChecklist(prevList => 
            prevList.map(item => 
                item.id === itemId ? { ...item, status: status, quantity: status === 'ok' ? 0 : item.quantity } : item
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
    const handleFinalConfirm = () => {
      
        // Xử lý logic gửi dữ liệu đi...
        console.log("Dữ liệu kiểm tra cuối cùng:", checklist);
        setConfirmModalVisible(false);
     navigation.goBack();
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
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A202C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết kiểm tra phòng</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Thông tin phòng */}
            <View style={styles.roomInfo}>
                <Ionicons name="keypad-outline" size={20} color="#0062E0" />
                <Text style={styles.roomNumber}>Phòng 301</Text>
            </View>

            {/* Danh sách */}
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

            {/* Nút xác nhận */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.mainConfirmButton} 
                    onPress={() => setConfirmModalVisible(true)}
                >
                    <Text style={styles.mainConfirmButtonText}>Xác nhận kiểm tra</Text>
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <MissingItemModal 
                visible={isMissingModalVisible}
                onClose={() => setMissingModalVisible(false)}
                onConfirm={handleConfirmMissing}
                item={selectedItem}
            />
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
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
    },
    // Modal "Xác nhận"
    summaryList: {
        backgroundColor: '#F5F8FA',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
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
    },
    summaryItemStatus: {
        fontSize: 16,
        fontWeight: 'bold',
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