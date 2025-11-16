import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getBookingById, getHistoryBookingsByBookingId, updateBookingStatus } from "@/service/BookingAPI";
import { getBookingUtilityByBookingId } from "@/service/BookingUtilityAPI"; 
import { getEmployeeByHotel } from '@/service/EmpoyeeAPI';
import { getPaymentsByBookingId } from "@/service/Payment/PaymentAPI";
import { getRoomItemsByBooking } from "@/service/RoomItemAPI"; // 👈 Đã dùng API mới
import AsyncStorage from '@react-native-async-storage/async-storage';
import CostDetailModal from "../model/costdetailModal";
import PaymentHistoryModal from "../model/PaymentHistoryModal"; // 👈 Sửa tên file (nếu cần)
import StaffListModal from "../model/staffListModal";

// HÀM HỢP NHẤT DỮ LIỆU CHO MÀN HÌNH CHÍNH
// (Giữ nguyên)
const transformDataForScreen = (bookingDetails, historyDetails, isPaid) => {
    // ... (logic giữ nguyên)
    const checkInRecord = historyDetails.find(item => item.newStatus === 'CHECK_IN');
    const actualCheckInTime = checkInRecord
        ? new Date(checkInRecord.createdAt).toLocaleString('vi-VN')
        : 'Chưa check-in';

    const actualCheckOutTime = new Date().toLocaleString('vi-VN');

    let paymentStatusText = 'Chưa thanh toán';
    if (isPaid) {
        paymentStatusText = 'Đã thanh toán';
    } else {
        const hasDeposit = historyDetails.some(item => item.newStatus === 'DA_COC');
        if (hasDeposit) {
            paymentStatusText = 'Đã cọc';
        }
    }

    return {
        id_booking: bookingDetails.id,
        name: bookingDetails.user?.fullName ?? 'N/A',
        phone: bookingDetails.user?.phone ?? 'N/A',
        roomId: bookingDetails.room?.id ?? null,
        cccd: bookingDetails.user?.cccd ?? 'N/A',
        roomType: bookingDetails.room?.typeRoom ?? 'N/A',
        roomNumber: bookingDetails.room?.roomNumber ?? 'N/A',
        status: paymentStatusText,
        numberOfNights: `${bookingDetails.room?.nights ?? 0} đêm`,
        numberOfGuests: `${bookingDetails.numberOfGuests ?? 0} người`,
        totalAmount: `${(bookingDetails.totalPrice ?? 0).toLocaleString('vi-VN')} ₫`,
        amenities: '🛁 Tắm miễn phí, buffet buổi sáng',
        checkInTime: actualCheckInTime,
        checkOutTime: actualCheckOutTime,
    };
};

// (Hàm formService giữ nguyên)
const formService = (servicesArray) => {
    if (!servicesArray || !Array.isArray(servicesArray)) {
        return [];
    }
    return servicesArray.map((item) => ({
        name: item.utilityName,
        quantity: item.quantity,
        price: item.price,
    }));
};


export default function Checkout() {
    const navigation = useNavigation();
    const route = useRoute();
    const { bookingId } = route.params;

    // State cho dữ liệu, loading và lỗi
    const [bookingData, setBookingData] = useState(null);
    const [costDetailsForModal, setCostDetailsForModal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✨ State damagedItems VÀ usedServices
    const [damagedItems, setDamagedItems] = useState([]);
    const [usedServices, setUsedServices] = useState([]);

    // State cho các modal
    const [costModalVisible, setCostModalVisible] = useState(false);
    const [staffModalVisible, setStaffModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [employeeList, setEmployeeList] = useState([]);

    // State cho modal lịch sử thanh toán
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [paymentHistoryModalVisible, setPaymentHistoryModalVisible] = useState(false);

    // 👈 State để biết booking đã check-out TỪ TRƯỚC chưa
    const [isAlreadyCheckedOut, setIsAlreadyCheckedOut] = useState(false);

    // (Hàm staffData giữ nguyên)
    const staffData = (employee) => ({
        id: employee.user.id,
        role: employee.position === "CLEANING" ? "Nhân viên dọn phòng" : "Nhân viên khách sạn",
        name: employee.user.fullName,
        phone: employee.user.phone,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!bookingId) {
                setError("Không có mã đặt phòng.");
                setIsLoading(false);
                return;
            }
            try {
                const hotelIdStr = await AsyncStorage.getItem('hotelID');
                const hotelId = hotelIdStr ? Number(hotelIdStr) : null;
                if (!hotelId) {
                    setError("Không tìm thấy thông tin khách sạn.");
                    setIsLoading(false);
                    return;
                }
                setIsLoading(true);

                const [bookingDetails, historyDetails, payments, listEmployee] = await Promise.all([
                    getBookingById(bookingId),
                    getHistoryBookingsByBookingId(bookingId),
                    getPaymentsByBookingId(bookingId),
                    getEmployeeByHotel(hotelId),
                ]);

                // Lưu trữ lịch sử thanh toán
                setPaymentHistory(payments || []);

                // Set employee list
                setEmployeeList(listEmployee
                    ?.filter(emp => emp?.position === "CLEANING")
                    .map(staffData));

                
                // 👈 SỬA ĐỔI: Tính 'isPaid' Ở ĐÂY, ngay sau khi có 'payments'
                const isPaid = payments.some(payment => payment.status === 'success');
                

                // 1. Xử lý dữ liệu cho màn hình checkout chính (Giờ 'isPaid' đã tồn tại)
                const formattedScreenData = transformDataForScreen(bookingDetails, historyDetails, isPaid);
                setBookingData(formattedScreenData);

                // 👈 Cập nhật trạng thái check-out
                const bookingStatus = bookingDetails.status;
                setIsAlreadyCheckedOut(bookingStatus === 'CHECK_OUT');
                
                // 👈 SỬA ĐỔI: Xóa dòng logic sai này
                // let isPaid = bookingStatus === 'CHECK_OUT'? true : false; 

                // --- LOGIC TẢI DỮ LIỆU NẾU ĐÃ CHECK-OUT ---
                let fetchedDamages = [];
                let fetchedServices = [];

                if (bookingStatus === 'CHECK_OUT') {
                    console.log("Booking đã CHECK_OUT, đang tải chi tiết hỏng hóc và dịch vụ...");
                    try {
                        const [damageData, utilityData] = await Promise.all([
                            getRoomItemsByBooking(bookingId), // 👈 Sử dụng API mới
                            getBookingUtilityByBookingId(bookingId)
                        ]);
                          console.log("báo hư",damageData);
                          
                        // Format và set state
                        fetchedDamages = (damageData || []).map(item => ({
                            name: item.itemName,
                            quantity: item.quantityAffected, // 🔔 Lưu ý: Đảm bảo API trả về 'quantityAffected'
                            price: item.price,
                            description: item.status === 'MISSING' ? 'Báo thiếu' : 'Báo hỏng',
                            image:item.image
                        }));

                        fetchedServices = formService(utilityData?.utilityItemBookingResponse || []);

                        setDamagedItems(fetchedDamages);
                        setUsedServices(fetchedServices);

                    } catch (err) {
                        console.warn("Lỗi khi tải dữ liệu check-out (hư hỏng/dịch vụ):", err);
                    }
                }
                // --- KẾT THÚC LOGIC MỚI ---

                // 2. Chuẩn bị dữ liệu riêng cho CostDetailModal
                const relevantTimeRecord = historyDetails.find(item => item.newStatus === 'CHECK_IN') ||
                    historyDetails.find(item => item.newStatus === 'CHECK_OUT');

                if (relevantTimeRecord && bookingDetails.room?.price) {
                    const checkInDate = new Date(relevantTimeRecord.createdAt);
                    checkInDate.setHours(12, 0, 0, 0);

                    const checkOutRecord = historyDetails.find(item => item.newStatus === 'CHECK_OUT');
                    const checkOutDate = checkOutRecord ? new Date(checkOutRecord.createdAt) : new Date();
                    checkOutDate.setHours(12, 0, 0, 0);

                    const diffTime = Math.max(0, checkOutDate - checkInDate);
                    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const roomTotal = numberOfDays * bookingDetails.room.price;

                    const modalData = {
                        roomDetails: {
                            name: bookingDetails.room.type,
                            description: `${numberOfDays} đêm × ${bookingDetails.room.price.toLocaleString('vi-VN')} ₫`,
                            price: roomTotal,
                        },
                        services: fetchedServices, 
                        damagedItems: fetchedDamages, 
                        bookingId: bookingId,
                        isPaid: isPaid, // 👈 SỬA: Giờ đã dùng 'isPaid' được tính đúng từ 'payments'
                    };
                    setCostDetailsForModal(modalData);
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu check-out:", err);
                setError(err.message || "Đã xảy ra lỗi không xác định.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [bookingId]);

    // (Hàm handleConfirmCheckout giữ nguyên)
    const handleConfirmCheckout = async () => {
        // ... (logic giữ nguyên)
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                return;
            }

            await updateBookingStatus(bookingId, "CHECK_OUT", Number(userId));

            Alert.alert("Thành công", "Check-out (thanh toán thủ công) thành công!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (err) {
            console.error("Lỗi khi xác nhận check-out:", err);
            Alert.alert("Lỗi", "Không thể xác nhận check-out. Vui lòng thử lại.");
        }
    };

    // (Hàm handleReportReceived giữ nguyên)
    const handleReportReceived = (receivedDamagedItems, receivedServices) => {
        // ... (logic giữ nguyên)
        console.log("Nhận được báo cáo hư hỏng:", receivedDamagedItems);
        console.log("Nhận được báo cáo dịch vụ (array):", receivedServices);

        const formattedDamagedItems = (receivedDamagedItems || []).map(item => ({
            name: item.itemName,
            quantity: item.quantityAffected,
            price: item.price,
            description: item.status === 'MISSING' ? 'Báo thiếu' : 'Báo hỏng'
        }));
        setDamagedItems(formattedDamagedItems);

        const formattedServices = formService(receivedServices);
        setUsedServices(formattedServices);

        setCostDetailsForModal(prevCostDetails => ({
            ...prevCostDetails,
            damagedItems: formattedDamagedItems,
            services: formattedServices
        }));

        setCurrentStep(3);
        setStaffModalVisible(false);
    };


    if (isLoading) {
        // ... (Giữ nguyên JSX loading)
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#1E63E9" />
                <Text style={{ marginTop: 10 }}>Đang tải thông tin...</Text>
            </View>
        );
    }
    if (error) {
        // ... (Giữ nguyên JSX error)
        return (
            <View style={styles.centeredContainer}>
                <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ... (Giữ nguyên JSX Header, Progress, Card thông tin) ... */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>📅 Xác nhận check-out</Text>
                    <Text style={styles.subTitle}>Xác nhận khách hàng đã Check-out</Text>
                    <View style={styles.progressWrapper}>
                        <View style={styles.progressVisualContainer}>
                            <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}><Text style={styles.stepTextActive}>1</Text></View>
                            <View style={[styles.connector, currentStep > 1 && styles.connectorActive]} />
                            <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}><Text style={currentStep >= 2 ? styles.stepTextActive : styles.stepTextInactive}>2</Text></View>
                            <View style={[styles.connector, currentStep > 2 && styles.connectorActive]} />
                            <View style={[styles.stepCircle, currentStep >= 3 ? styles.stepCircleActive : styles.stepCircleInactive]}><Text style={currentStep >= 3 ? styles.stepTextActive : styles.stepTextInactive}>3</Text></View>
                        </View>
                        <View style={styles.progressLabelContainer}>
                            <Text style={styles.stepLabel}>Xác nhận</Text>
                            <Text style={styles.stepLabel}>Kiểm tra phòng</Text>
                            <Text style={styles.stepLabel}>Thanh toán</Text>
                        </View>
                    </View>
                </View>

                {bookingData && (
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={{ fontWeight: "600" }}>👤 {bookingData.name}</Text>
                            <View style={[styles.badge, { backgroundColor: bookingData.status === "Đã cọc" ? "orange" : "green" }]} >
                                <Text style={{ color: "#fff", fontSize: 12 }}>{bookingData.status}</Text>
                            </View>
                        </View>
                        <Text>📞 {bookingData.phone}</Text>
                        <Text>CMND/CCCD: {bookingData.cccd}</Text>
                        <View style={styles.divider} />
                        <Text style={{ fontWeight: "600" }}>🛏️ {bookingData.roomType} - Phòng {bookingData.roomNumber}</Text>
                        <View style={styles.rowBetween}>
                            <View><Text>Check-in thực tế</Text><Text style={styles.bold}>{bookingData.checkInTime}</Text></View>
                            <View><Text>Check-out thực tế</Text><Text style={styles.bold}>{bookingData.checkOutTime}</Text></View>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text>Số ngày dự kiến: {bookingData.numberOfNights}</Text>
                            <Text>Số khách: {bookingData.numberOfGuests}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={{ fontWeight: "600" }}>Tổng tiền</Text>
                            <Text style={[styles.bold, { fontSize: 16 }]}>{bookingData.totalAmount}</Text>
                        </View>
                        <Text style={{ marginTop: 8 }}>{bookingData.amenities}</Text>
                    </View>
                )}

                {/* Ẩn nút "Gọi nhân viên" nếu đã check-out */}
                {!isAlreadyCheckedOut && (
                    <TouchableOpacity style={[styles.btn, { backgroundColor: "green" }]} onPress={() => setStaffModalVisible(true)}>
                        <Text style={styles.btnText}>Gọi nhân viên kiểm tra phòng</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#1E63E9" }]}
                    onPress={() => setCostModalVisible(true)}
                >
                    <Text style={styles.btnText}>Xem chi tiết dịch vụ & thanh toán</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#ffc107" }]} // Màu vàng
                    onPress={() => setPaymentHistoryModalVisible(true)}
                >
                    <Text style={[styles.btnText, { color: '#000' }]}>Lịch sử thanh toán</Text>
                </TouchableOpacity>

                {/* Ẩn nút "Xác nhận Check-out" nếu đã check-out */}
                {!isAlreadyCheckedOut && (
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: "#dc3545" }]}
                        onPress={handleConfirmCheckout}
                    >
                        <Text style={styles.btnText}>Xác nhận Check-out</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.btn, { backgroundColor: "#ccc" }]} onPress={() => navigation.goBack()}>
                    <Text style={{ fontWeight: "600", color: "#000" }}>Quay lại</Text>
                </TouchableOpacity>

            </ScrollView>

            <StaffListModal
                visible={staffModalVisible}
                staffList={employeeList}
                onClose={() => setStaffModalVisible(false)}
                roomId={bookingData?.roomId}
                bookingId={bookingId}
                onReportReceived={handleReportReceived}
            />

            <CostDetailModal
                visible={costModalVisible}
                onClose={() => setCostModalVisible(false)}
                costData={costDetailsForModal}
                onManualPayment={handleConfirmCheckout}
            />

            <PaymentHistoryModal
                visible={paymentHistoryModalVisible}
                onClose={() => setPaymentHistoryModalVisible(false)}
                payments={paymentHistory}
            />
        </View>
    );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: 'center',
    },
    subTitle: {
        color: "#666",
        marginBottom: 24,
        textAlign: 'center',
        fontSize: 14,
    },
    progressWrapper: {},
    progressVisualContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,
    },
    progressLabelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#1E63E9',
    },
    stepCircleInactive: {
        backgroundColor: '#D9D9D9',
    },
    stepTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    stepTextInactive: {
        color: '#333333',
        fontWeight: 'bold',
    },
    stepLabel: {
        flex: 1,
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
    },
    connector: {
        flex: 1,
        height: 2,
        backgroundColor: '#D9D9D9',
        marginHorizontal: 10,
    },
    connectorActive: {
        backgroundColor: '#1E63E9',
    },
    card: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },
    bold: {
        fontWeight: "600",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    divider: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 8,
    },
    btn: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
});