import { getBookingById, getHistoryBookingsByBookingId, updateBookingStatus } from "@/service/BookingAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheckinModal from "../model/check_in";
import MiniBarScreen from "../model/minibar";
import SuccessModal from "../model/sucsessModal";

// HÀM BIẾN ĐỔI DỮ LIỆU BOOKING CHÍNH
const transformApiData = (booking) => {
    //  (Phần logic API đã được chuyển vào hàm handleCheckInConfirm)
    const checkInDate = booking.checkInDate ? new Date(booking.checkInDate) : null;
    const checkOutDate = booking.checkOutDate ? new Date(booking.checkOutDate) : null;
    let nights = 0;
    if (checkInDate && checkOutDate) {
        nights = Math.max(0, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    }

    return {
        id_booking: booking.id ?? 'N/A',
        status: booking.status ?? 'pending_checkin', // 👈 Trạng thái này RẤT QUAN TRỌNG
        payment_status: booking.paymentStatus ?? 'unpaid',
        customer: {
            id: booking.user?.id ?? 'N/A',
            name: booking.user?.fullName ?? 'Khách hàng',
            cccd: booking.user?.cccd ?? 'Chưa cung cấp',
            avatar: booking.user?.avatar ?? 'https://i.pravatar.cc/100',
        },
        room: {
            name: booking.room?.typeRoom ?? 'Loại phòng',
            number: booking.room?.number ?? 'N/A',
            checkin_date: checkInDate ? checkInDate.toLocaleDateString('vi-VN') : 'N/A',
            checkout_date: checkOutDate ? checkOutDate.toLocaleDateString('vi-VN') : 'N/A',
            nights: nights,
            guests: booking.numberOfGuests ?? 0,
        },
        pricing: {
            price_per_night: booking.room?.pricePerNight ?? (booking.totalPrice / (nights || 1)),
            extra_hour_fee: booking.extraFee ?? 0,
            room_total: booking.totalPrice ?? 0,
        },
        services: booking.services ?? [],
    };
};

// (Hàm mapHistoryData giữ nguyên)
const mapHistoryData = (historyItem) => {
    const time = new Date(historyItem.createdAt).toLocaleString('vi-VN');
    let statusText = "Không xác định";
    let color = 'black'; 

    switch (historyItem.newStatus) {
        case "CHUA_THANH_TOAN":
            statusText = "Chưa thanh toán";
            break;
        case "DA_THANH_TOAN":
            statusText = "Đã thanh toán";
            color = '#0077aa'; 
            break;
        case "DA_COC":
            statusText = "Đã cọc";
            color = '#0077aa'; 
            break;
        case "CHECK_IN":
            statusText = "Đã check-in";
            color = 'green';
            break;
        case "CHECK_OUT":
            statusText = "Đã check-out";
            color = 'red';
            break;
        case "DA_HUY":
            statusText = "Đã hủy";
            color = 'gray';
            break;
        default:
            statusText = historyItem.newStatus; 
    }

    return {
        time: time,
        status: statusText,
        color: color,
        link: historyItem.newStatus === "DA_THANH_TOAN" || historyItem.newStatus === "DA_COC"
    };
};


export default function BookingDetail() {
    const navigation = useNavigation();
    const route = useRoute();
    const { bookingId } = route.params;

    const [bookingData, setBookingData] = useState(null);
    const [history, setHistory] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showMiniBar, setShowMiniBar] = useState(false);

    // (Hàm fetchBookingDetails giữ nguyên)
    const fetchBookingDetails = async () => {
        if (!bookingId) {
            setError("Không tìm thấy ID đặt phòng.");
            setIsLoading(false);
            return;
        }
        try {
            if (!bookingData) setIsLoading(true);
            setError(null);

            const [rawData, rawHistoryData] = await Promise.all([
                getBookingById(bookingId),
                getHistoryBookingsByBookingId(bookingId)
            ]);

            const formattedData = transformApiData(rawData);
            setBookingData(formattedData);

            const formattedHistory = rawHistoryData.map(mapHistoryData);
            setHistory(formattedHistory);

        } catch (err) {
            console.error("Lỗi khi lấy chi tiết đặt phòng:", err);
            setError(err.message || "Đã xảy ra lỗi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    // (Hàm handleCheckInConfirm giữ nguyên)
    const handleCheckInConfirm = async () => {
        try {
            const userId = await AsyncStorage.getItem("userId");
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
                return;
            }

            await updateBookingStatus(bookingId, "CHECK_IN", Number(userId));

            setShowCheckInModal(false);
            setShowSuccess(true);
            
            await fetchBookingDetails();

        } catch (err) {
            console.error("Lỗi khi check-in:", err);
            Alert.alert("Lỗi", "Không thể thực hiện check-in. Vui lòng thử lại.");
            setShowCheckInModal(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
            </View>
        );
    }

    if (!bookingData) {
        return (
            <View style={styles.centered}>
                <Text>Không tìm thấy thông tin đặt phòng.</Text>
            </View>
        );
    }

    const isCheckedIn = bookingData?.status === 'CHECK_IN';
    const isCheckedOut = bookingData?.status === 'CHECK_OUT';
    
    // ✨ BIẾN MỚI: Kiểm tra đã thanh toán 100% chưa
    const isPaid = bookingData?.status === 'DA_THANH_TOAN'|| 'DA_COC';

    const serviceTotal = (bookingData?.services ?? []).reduce((total, service) => total + (service.price || 0), 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
            </View>

            {/* ✨ SỬA LẠI LOGIC HIỂN THỊ NÚT */}
            {isCheckedOut ? (
                // 1. Đã check-out: Hiển thị nút "Kiểm tra thông tin check out"
                <TouchableOpacity
                    style={[styles.checkinBtn, { backgroundColor: '#6c757d' }]} // Màu xám
                    onPress={() => navigation.navigate("checkout", { bookingId: bookingData.id_booking })}
                >
                    <Text style={styles.checkinText}>Kiểm tra thông tin check out</Text>
                </TouchableOpacity>
            ) : isCheckedIn ? (
                // 2. Đã check-in: Hiển thị nút Check-out
                <TouchableOpacity
                    style={[styles.checkinBtn, { backgroundColor: "#c02727" }]}
                    onPress={() => navigation.navigate("checkout", { bookingId: bookingData.id_booking })}
                >
                    <Text style={styles.checkinText}>Check-out</Text>
                </TouchableOpacity>
            ) : (
                // 3. Chưa check-in: Hiển thị nút Check-in (với logic mới)
                <TouchableOpacity
                    style={[
                        styles.checkinBtn, 
                        // Đặt màu dựa trên trạng thái đã thanh toán
                        isPaid ? { backgroundColor: "#32d35d" } : { backgroundColor: "#6c757d" }
                    ]}
                    onPress={() => {
                        // Thêm kiểm tra khi nhấn
                        if (isPaid) {
                            setShowCheckInModal(true); // Chỉ mở modal nếu đã thanh toán
                        } else {
                            Alert.alert(
                                "Chưa thể Check-in",
                                "Khách hàng phải ở trạng thái 'Đã thanh toán' (100%) mới có thể Check-in."
                            );
                        }
                    }}
                >
                    <Text style={styles.checkinText}>Check-in</Text>
                </TouchableOpacity>
            )}

            <CheckinModal 
                visible={showCheckInModal} 
                onClose={() => setShowCheckInModal(false)} 
                onConfirm={handleCheckInConfirm}
            />
            <SuccessModal visible={showSuccess} message="Check-in thành công!" onClose={() => setShowSuccess(false)} />
            <Modal visible={showMiniBar} animationType="slide"><MiniBarScreen onClose={() => setShowMiniBar(false)} /></Modal>

            {/* <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowMiniBar(true)}>
                    <Text style={styles.actionText}>Thêm dịch vụ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
                    <Text style={styles.actionText}>Chỉnh sửa</Text>
                </TouchableOpacity>
            </View> */}

            <View style={styles.card}>
                <View style={styles.customerRow}>
                    <Image
                        source={{ uri: bookingData.customer.avatar }}
                        style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.customerName}>{bookingData.customer.name}</Text>
                        <Text>CCCD: {bookingData.customer.cccd}</Text>
                        <Text>User Id: {bookingData.customer.id}</Text>
                        <Text>Mã Booking: {bookingData.id_booking}</Text>
                    </View>
                </View>

                {bookingData.payment_status === 'paid' && (
                    <TouchableOpacity style={styles.paidBox}><Text style={styles.paidText}>Đã thanh toán</Text></TouchableOpacity>
                )}
                {isCheckedIn && (
                    <TouchableOpacity style={styles.checkinBox}><Text style={styles.checkinBoxText}>Đã Check in</Text></TouchableOpacity>
                )}
                {isCheckedOut && (
                    <TouchableOpacity style={styles.checkoutBox}><Text style={styles.checkoutBoxText}>Đã Check out</Text></TouchableOpacity>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin nhận phòng</Text>
                <View style={styles.tableWrapper}>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <Text style={[styles.tableHeader, styles.timeCol]}>Thời gian</Text>
                        <Text style={[styles.tableHeader, styles.statusCol]}>Trạng thái</Text>
                    </View>
                    {history.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableText, styles.timeCol]}>{item.time}</Text>
                            <Text style={[styles.tableText, styles.statusCol, item.link && styles.link, { color: item.color }]}>
                                {item.status}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin phòng</Text>
                <Text style={styles.roomName}>{bookingData.room.name} <Text style={styles.roomTag}>: {bookingData.room.number}</Text></Text>
                <View style={styles.rowBetween}><Text>📅 Check-in: {bookingData.room.checkin_date}</Text><Text>📅 Check-out: {bookingData.room.checkout_date}</Text></View>
                <View style={styles.rowBetween}><Text>🛏️ Số đêm: {bookingData.room.nights} đêm</Text><Text>👥 Số người: {bookingData.room.guests} người</Text></View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin giá phòng</Text>
                <View style={[styles.rowBetween, styles.rowLine]}><Text>Giá mỗi đêm</Text><Text>{bookingData.pricing.price_per_night.toLocaleString('vi-VN')} ₫</Text></View>
                <View style={[styles.rowBetween, styles.rowLine]}><Text>{bookingData.room.nights} đêm</Text><Text>{bookingData.pricing.room_total.toLocaleString('vi-VN')} ₫</Text></View>
                <View style={[styles.rowBetween, styles.rowLine]}><Text>Thêm giờ</Text><Text>{bookingData.pricing.extra_hour_fee.toLocaleString('vi-VN')} ₫</Text></View>
                <View style={[styles.rowBetween, styles.totalRow]}><Text style={styles.totalLabel}>Tổng cộng</Text><Text style={styles.totalPrice}>{bookingData.pricing.room_total.toLocaleString('vi-VN')} ₫</Text></View>
            </View>

            {/* <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin dịch vụ</Text>
                <View>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <Text style={[styles.tableHeader, styles.serviceNameCol]}>Tên dịch vụ</Text><Text style={[styles.tableHeader, styles.serviceCol]}>Loại</Text><Text style={[styles.tableHeader, styles.serviceCol]}>Số lượng</Text><Text style={[styles.tableHeader, styles.servicePriceCol]}>Giá</Text>
                    </View>
                    {bookingData.services.map(service => (
                        <View style={styles.tableRow} key={service.id}>
                            <Text style={[styles.tableText, styles.serviceNameCol]}>{service.name}</Text><Text style={[styles.tableText, styles.serviceCol]}>{service.type}</Text><Text style={[styles.tableText, styles.serviceCol]}>{service.quantity}</Text><Text style={[styles.tableText, styles.servicePriceCol]}>{(service.price ?? 0).toLocaleString('vi-VN')} ₫</Text>
                        </View>
                    ))}
                </View>
                <View style={[styles.rowBetween, styles.serviceTotalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalPrice}>{serviceTotal.toLocaleString('vi-VN')} ₫</Text>
                </View>
            </View> */}
        </ScrollView>
    );
}

// (Styles giữ nguyên)
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffff',
        padding: 20,
    },
    container: { flex: 1, backgroundColor: "#ffffffff", padding: 16 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    back: { fontSize: 20, marginRight: 8 },
    headerTitle: { fontSize: 18, fontWeight: "bold" },
    checkinBtn: {
        backgroundColor: "#c02727ff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    checkinText: { color: "#fff", fontWeight: "bold" },
    actionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    actionBtn: {
        padding: 10,
        backgroundColor: "#e0f7fa",
        borderRadius: 8,
    },
    editBtn: { backgroundColor: "#f1f1f1" },
    actionText: { fontSize: 14, fontWeight: "500" },
    card: {
        backgroundColor: "#f3f3f3ff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    customerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    customerName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    paidBox: {
        marginTop: 8,
        width: 140,
        backgroundColor: "#3432a1ff",
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "center",
        paddingHorizontal: 12,
    },
    paidText: {
        color: "#e9ebf0ff",
        fontWeight: "600",
        textAlign: "center",
    },
    checkinBox: {
        marginTop: 8,
        width: 140,
        backgroundColor: "#32d35dff",
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "center",
        paddingHorizontal: 12,
    },
    checkinBoxText: {
        color: "#171817ff",
        fontWeight: "600",
        textAlign: "center",
    },
    checkoutBox: {
        marginTop: 8,
        width: 140,
        backgroundColor: "#c02727", // Màu đỏ
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "center",
        paddingHorizontal: 12,
    },
    checkoutBoxText: {
        color: "#fff", // Chữ trắng
        fontWeight: "600",
        textAlign: "center",
    },
    cardTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 17 },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    link: { color: "#0077aa", fontWeight: "500" },
    roomName: { fontWeight: "bold", marginBottom: 6 },
    roomTag: { fontSize: 14, color: "#555" },
    totalRow: { borderTopWidth: 1, borderColor: "#ddd", paddingTop: 8, marginTop: 8 },
    totalLabel: { fontWeight: "bold" },
    totalPrice: { fontWeight: "bold", fontSize: 16 },
    tableWrapper: {
        borderWidth: 1,
        borderColor: "#0c0c0cff",
        borderRadius: 10,
        overflow: "hidden",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#000000ff",
    },
    tableHeaderRow: {
        backgroundColor: "#b3b2b2ff",
    },
    tableHeader: {
        fontWeight: "bold",
        padding: 8,
        textAlign: "center",
        fontSize: 14,
    },
    tableText: {
        padding: 8,
        fontSize: 13,
    },
    timeCol: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: "#000000ff",
    },
    statusCol: {
        flex: 1,
    },
    rowLine: {
        borderBottomWidth: 1,
        borderColor: "#ddd",
        paddingBottom: 6,
        marginBottom: 6,
    },
    serviceNameCol: {
        flex: 2,
        borderRightWidth: 1,
        borderColor: "#ccc",
        padding: 6,
    },
    serviceCol: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: "#ccc",
        padding: 6,
        textAlign: "center",
    },
    servicePriceCol: {
        flex: 1.5,
        padding: 6,
        textAlign: "right",
    },
    serviceTotalRow: {
        borderTopWidth: 1,
        borderColor: "#007bff",
        paddingVertical: 8,
        marginTop: 8,
        backgroundColor: "#f9f9f9",
        borderRadius: 6,
        paddingHorizontal: 6,
    },
});