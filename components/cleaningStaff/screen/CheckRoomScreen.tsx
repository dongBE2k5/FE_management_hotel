import { createBookingUtility } from '@/service/BookingUtilityAPI'; // <-- IMPORT MỚI
import { getUtilityOfHotelByHotelIdAndType } from '@/service/HotelUtilityAPI'; // <-- IMPORT MỚI
import { updateStatusRequest } from '@/service/Realtime/WebSocketAPI';
import {
    createDamagedItem,
    getRoomItemsByTypeRoomId,
} from '@/service/RoomItemAPI';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import { useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --- COMPONENT: MissingItemModal (Không thay đổi) ---
const MissingItemModal = ({ visible, onClose, onConfirm, item }) => {
    // ... (Giữ nguyên code của bạn)
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
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

// --- COMPONENT: ConfirmCheckModal (Sửa đổi để thêm Minibar) ---
const ConfirmCheckModal = ({ visible, onClose, onConfirm, checklist, minibarItems, time }) => {

    const itemsWithIssues = useMemo(
        () => checklist.filter(item => item.status !== 'ok'),
        [checklist]
    );

    // <-- THÊM MỚI: Lọc minibar đã sử dụng -->
    const usedMinibarItems = useMemo(
        () => minibarItems.filter(item => item.quantity > 0),
        [minibarItems]
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
                    
                    {/* Tóm tắt vật dụng */}
                    <View style={styles.summaryList}>
                        <Text style={styles.summaryTitle}>Tình trạng vật dụng</Text>
                        {itemsWithIssues.map(item => (
                            <View key={item.id} style={styles.summaryItem}>
                                <Text style={styles.summaryItemName}>{item.name}</Text>
                                {item.image && (
                                    <Ionicons name="camera" size={20} color="#718096" style={{ marginRight: 10 }} />
                                )}
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

                    {/* <-- THÊM MỚI: Tóm tắt Minibar --> */}
                    <View style={styles.summaryList}>
                        <Text style={styles.summaryTitle}>Minibar đã sử dụng</Text>
                        {usedMinibarItems.map(item => (
                            <View key={item.id} style={styles.summaryItem}>
                                <Text style={styles.summaryItemName}>{item.name}</Text>
                                <Text style={styles.summaryItemStatus}>Số lượng: {item.quantity}</Text>
                            </View>
                        ))}
                        {usedMinibarItems.length === 0 && (
                            <Text style={styles.summaryAllOk}>Không sử dụng minibar</Text>
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
    const navigation = useNavigation();
    const route = useRoute();
    // <-- SỬA ĐỔI: Lấy hotelId từ params
    const { id, roomNumber, roomTypeId, requestId, assignmentId, bookingId, hotelId } = route.params;
    console.log("hotelid",hotelId);
    
    const [checklist, setChecklist] = useState([]);
    const [minibarItems, setMinibarItems] = useState([]); // <-- THÊM MỚI: State cho Minibar
    const [isMissingModalVisible, setMissingModalVisible] = useState(false);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadItemData = async () => {
            try {
                setIsLoading(true);
                
                // <-- SỬA ĐỔI: Gọi song song cả 2 API -->
                const [damageData, minibarData] = await Promise.all([
                    getRoomItemsByTypeRoomId(roomTypeId),
                    getUtilityOfHotelByHotelIdAndType(hotelId, 'MINIBAR')
                ]);

                // Xử lý data vật dụng (checklist)
                const formattedDamageData = damageData.map(item => ({
                    id: item.itemId,
                    name: item.itemName,
                    status: 'ok',
                    quantity: 0,
                    image: null, 
                }));
                setChecklist(formattedDamageData);
                
                // <-- THÊM MỚI: Xử lý data minibar -->
                const formattedMinibarData = minibarData.data.map(item => ({
                    id: item.id, // Đây là utilityId
                    name: item.name,
                    quantity: 0, // Mặc định là 0 (không sử dụng)
                    price: item.price,
                }));
                setMinibarItems(formattedMinibarData);


            } catch (error) {
                console.error("Lỗi khi tải danh sách vật dụng hoặc minibar:", error);
                Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
                navigation.goBack();
            } finally {
                setIsLoading(false);
            }
        };

        // <-- SỬA ĐỔI: Thêm hotelId vào dependency
        loadItemData();
    }, [roomTypeId, navigation, hotelId]);

    // Hàm cập nhật trạng thái vật dụng (checklist)
    const setItemStatus = (itemId, status) => {
        setChecklist(prevList =>
            prevList.map(item =>
                item.id === itemId
                    ? {
                        ...item,
                        status: status,
                        quantity: (status === 'ok' || status === 'broken') ? 0 : item.quantity,
                        image: (status === 'ok') ? null : item.image
                    }
                    : item
            )
        );
    };

    // --- (Các hàm xử lý vật dụng: handlePressMissing, handleConfirmMissing, handleTakePhoto, handlePressStatus giữ nguyên) ---

    // Xử lý khi nhấn "Thiếu"
    const handlePressMissing = (item) => {
        setSelectedItem(item);
        setMissingModalVisible(true);
    };

    // Xử lý khi xác nhận số lượng thiếu
    const handleConfirmMissing = (item, quantity) => {
        setChecklist(prevList =>
            prevList.map(i =>
                i.id === item.id ? { ...i, status: 'missing', quantity: quantity, image: null } : i
            )
        );
        setMissingModalVisible(false);
        setSelectedItem(null);
    };

    // Hàm chụp ảnh
    const handleTakePhoto = async (item) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Lỗi", "Bạn cần cấp quyền truy cập camera để chụp ảnh.");
            return;
        }
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true, 
                aspect: [4, 3],
                quality: 0.7, 
                base64: false, 
            });

            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                setChecklist(prevList =>
                    prevList.map(i =>
                        i.id === item.id ? { ...i, status: 'broken', quantity: 0, image: imageUri } : i
                    )
                );
            } else {
                setItemStatus(item.id, 'broken');
            }
        } catch (error) {
            console.log("Lỗi khi mở camera:", error);
            Alert.alert("Lỗi", "Không thể mở camera. Vui lòng thử lại.");
            setItemStatus(item.id, 'broken'); 
        }
    };

    // Xử lý khi nhấn "OK" hoặc "Hư"
    const handlePressStatus = (item, status) => {
        if (status === 'broken') {
            Alert.alert(
                "Xác nhận đồ hư",
                `Bạn có muốn chụp ảnh ${item.name} bị hư không?`,
                [
                    {
                        text: "Bỏ qua", 
                        onPress: () => setItemStatus(item.id, 'broken'), 
                        style: "cancel"
                    },
                    {
                        text: "Chụp ảnh", 
                        onPress: () => handleTakePhoto(item) 
                    }
                ]
            );
        } else {
            setItemStatus(item.id, status);
        }
    };

    // <-- THÊM MỚI: Hàm xử lý số lượng Minibar -->
    const handleMinibarQuantityChange = (itemId, newQuantity) => {
        // Đảm bảo số lượng không âm
        const clampedQuantity = Math.max(0, newQuantity); 
        setMinibarItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity: clampedQuantity } : item
            )
        );
    };


    // <-- SỬA ĐỔI: Xử lý khi nhấn nút xác nhận cuối cùng (Logic tổng) -->
    const handleFinalConfirm = async () => {
        const userIdStr = await AsyncStorage.getItem("userId");
        const userId = userIdStr ? Number(userIdStr) : null;

        if (!userId) {
            Alert.alert("Lỗi", "Không xác định được người dùng. Vui lòng đăng nhập lại.");
            return;
        }

        // 1. Lọc vật dụng hỏng/thiếu
        const itemsWithIssues = checklist.filter(item => item.status !== 'ok');
        
        // 2. Lọc minibar đã sử dụng
        const usedMinibarItems = minibarItems.filter(item => item.quantity > 0);

        let isSuccess = false; // Cờ để kiểm tra gửi API thành công

        try {
            const apiPromises = []; // Mảng chứa các_tác_vụ_gọi_API

            // 3a. Chuẩn bị request Báo cáo hỏng hóc
            if (itemsWithIssues.length > 0) {
                const damagedItemRequests = itemsWithIssues.map(item => {
                    let serverStatus = '';
                    if (item.status === 'broken') serverStatus = 'DAMAGED';
                    else if (item.status === 'missing') serverStatus = 'MISSING';

                    return {
                        data: {
                            roomId: id,
                            itemId: item.id,
                            quantityAffected: item.status === 'broken' ? 1 : item.quantity,
                            status: serverStatus,
                            reportedBy: userId,
                            requestStaffId: requestId,
                            bookingId: bookingId,
                        },
                        image: item.image, // URI hoặc null
                    };
                });
                
                // Thêm các promise hỏng hóc vào mảng
                damagedItemRequests.forEach(req => {
                    apiPromises.push(createDamagedItem(req.data, req.image));
                });
            }

            // 3b. Chuẩn bị request Minibar
            if (usedMinibarItems.length > 0) {
                const bookingUtilityRequest = {
                    bookingId: bookingId, 
                    utilityItemBooking: usedMinibarItems.map(item => ({
                        utilityId: item.id,
                        quantity: item.quantity,
                    })),
                };
                
                // Thêm promise minibar vào mảng
                apiPromises.push(createBookingUtility(bookingUtilityRequest));
            }
            
            // 4. Gửi đồng thời tất cả các báo cáo (hỏng hóc, minibar)
            if (apiPromises.length > 0) {
                await Promise.all(apiPromises);
                console.log("Đã gửi thành công các báo cáo (hỏng hóc/minibar).");
            }

            // 5. Cập nhật trạng thái cuối cùng của Request (chỉ_dựa_trên_đồ_hỏng)
            // Đây là 4 trường hợp bạn đã mô tả
            if (itemsWithIssues.length > 0) {
                await updateStatusRequest(requestId, "HAS_ISSUE", id, assignmentId);
                Alert.alert("Thành công", "Đã ghi nhận tình trạng phòng (Có vấn đề).");
            } else {
                await updateStatusRequest(requestId, "NO_ISSUE", id, assignmentId);
                Alert.alert("Thành công", "Đã ghi nhận tình trạng phòng (Tất cả OK).");
            }
            
            isSuccess = true;

        } catch (error) {
            console.error("Lỗi khi gửi báo cáo hỏng hóc hoặc cập nhật status:", error);
            Alert.alert("Lỗi", "Thao tác thất bại. Vui lòng thử lại.");
        } finally {
            // 6. Đóng modal và quay lại (chỉ khi thành công)
            setConfirmModalVisible(false);
            if (isSuccess) {
                navigation.goBack();
            }
        }
    };

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
                    {/* DANH SÁCH VẬT DỤNG */}
                    <Text style={styles.listTitle}>Danh sách kiểm tra</Text>
                    {checklist.map(item => (
                        <View key={item.id} style={styles.checkItemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.checkItemName}>{item.name}</Text>
                                {item.image && (
                                    <Image source={{ uri: item.image }} style={styles.thumbnail} />
                                )}
                            </View>
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
                                    {item.status === 'broken' && item.image && (
                                        <Ionicons name="camera" size={16} color="#FF3B30" style={{ marginLeft: 5 }} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    {/* <-- THÊM MỚI: DANH SÁCH MINIBAR --> */}
                    <Text style={styles.listTitle}>Minibar</Text>
                    {minibarItems.map(item => (
                        <View key={item.id} style={styles.checkItemCard}>
                            <Text style={styles.checkItemName}>{item.name}</Text>
                            
                            {/* Toggle Buttons */}
                            <View style={styles.statusOptions}>
                                <TouchableOpacity
                                    style={[styles.statusButton, item.quantity === 0 && styles.okSelected]} // Style "OK"
                                    onPress={() => handleMinibarQuantityChange(item.id, 0)}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color={item.quantity === 0 ? '#34C759' : '#CBD5E0'} />
                                    <Text style={[styles.statusText, item.quantity === 0 && styles.okText]}>Không sử dụng</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[styles.statusButton, item.quantity > 0 && styles.brokenSelected]} // Style "Hư"
                                    onPress={() => handleMinibarQuantityChange(item.id, item.quantity > 0 ? 0 : 1)} // Toggle
                                >
                                    <Ionicons name="card" size={20} color={item.quantity > 0 ? '#FF3B30' : '#CBD5E0'} />
                                    <Text style={[styles.statusText, item.quantity > 0 && styles.brokenText]}>Đã sử dụng</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Bộ chọn số lượng (chỉ hiện khi đã sử dụng) */}
                            {item.quantity > 0 && (
                                <View style={styles.minibarQuantityWrapper}>
                                    <Text style={styles.minibarQuantityLabel}>Số lượng:</Text>
                                    <View style={styles.quantityControl}>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => handleMinibarQuantityChange(item.id, item.quantity - 1)}
                                        >
                                            <Ionicons name="remove" size={24} color="#FF3B30" />
                                        </TouchableOpacity>
                                        <Text style={styles.quantityText}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => handleMinibarQuantityChange(item.id, item.quantity + 1)}
                                        >
                                            <Ionicons name="add" size={24} color="#34C759" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Nút xác nhận */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.mainConfirmButton, isLoading && styles.disabledButton]}
                    onPress={() => setConfirmModalVisible(true)}
                    disabled={isLoading}
                >
                    <Text style={styles.mainConfirmButtonText}>Xác nhận kiểm tra</Text>
                </TouchableOpacity>
            </View>

            {/* Modals */}
            {selectedItem && (
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
                minibarItems={minibarItems} // <-- THÊM MỚI: Truyền state minibar
                time={currentTime.replace(', ', ' ')}
            />
        </SafeAreaView>
    );
}

// --- STYLESHEET (Thêm style cho Minibar) ---
const styles = StyleSheet.create({
    // ... (Toàn bộ style cũ của bạn giữ nguyên) ...
    container: {
        flex: 1,
        backgroundColor: '#F5F8FA',
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
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A202C',
        flex: 1, 
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#EDF2F7',
    },
    statusOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        marginHorizontal: 4,
    },
    statusText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#CBD5E0',
    },
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
    footer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    mainConfirmButton: {
        backgroundColor: '#2563EB',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A0AEC0',
    },
    mainConfirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
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
        backgroundColor: '#34C759',
        marginLeft: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A202C',
    },
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
        minWidth: 30,
        textAlign: 'center',
    },
    summaryList: {
        backgroundColor: '#F5F8FA',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        maxHeight: 150, // <-- SỬA ĐỔI: Giảm chiều cao để vừa 2 bảng
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
        alignItems: 'center', 
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7',
    },
    summaryItemName: {
        fontSize: 16,
        color: '#4A5568',
        flex: 1,
    },
    summaryItemStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
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
    },
    // <-- THÊM MỚI: Style cho bộ chọn số lượng minibar -->
    minibarQuantityWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#EDF2F7',
    },
    minibarQuantityLabel: {
        fontSize: 16,
        color: '#4A5568',
        fontWeight: '600',
    },
});