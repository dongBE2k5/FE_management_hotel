import { useNavigation } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheckinModal from "../model/check_in";
import MiniBarScreen from "../model/minibar";
import SuccessModal from "../model/sucsessModal";

// --- DỮ LIỆU MẪU ---
// Trong ứng dụng thực tế, bạn sẽ nhận dữ liệu này từ API hoặc qua navigation params
const mockBookingData = {
    id_booking: '445454646',
    status: 'pending_checkin', // 'pending_checkin' hoặc 'checked_in'
    payment_status: 'paid', // 'paid' hoặc 'unpaid'
    customer: {
        id: '154548',
        name: 'Nguyễn Văn A',
        cccd: '032547458151215',
        avatar: 'https://i.pravatar.cc/100',
    },
    room: {
        name: 'Phòng đôi',
        number: '501',
        checkin_date: '28/01/2025',
        checkout_date: '30/01/2025',
        nights: 2,
        guests: 2,
    },
    pricing: {
        price_per_night: 2500000,
        extra_hour_fee: 0,
        room_total: 5000000,
    },
    services: [
        { id: 1, name: 'Buffet buổi sáng', type: 'Thường', quantity: 1, price: 2500000 },
        { id: 2, name: 'Xe đưa đón sân bay', type: 'VIP', quantity: 2, price: 1000000 },
        { id: 3, name: 'Spa thư giãn', type: 'Thường', quantity: 1, price: 800000 },
    ],
    history: [
        { time: '16:18:00 28/9/2025', status: 'Đã đặt phòng thành công', link: true },
        { time: '16:18:00 28/9/2025', status: 'Đã Thanh Toán', link: true },
        { time: '16:18:00 28/9/2025', status: 'Đã Check-in', color: 'green' },
        { time: '16:18:00 28/9/2025', status: 'Đã Check-out', color: 'red' },
    ]
};

// Sử dụng `props` để truyền dữ liệu vào, ví dụ: { bookingData }
export default function BookingDetail({ route }) {
    // Lấy dữ liệu từ navigation params, nếu không có thì dùng dữ liệu mẫu
    const bookingData = route?.params?.bookingData || mockBookingData;

    const navigation = useNavigation();
    const router = useRouter(); // Giữ lại nếu bạn có dùng

    // ----- STATE QUẢN LÝ TRẠNG THÁI UI -----
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [showCheckInModal, setShowCheckInModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showMiniBar, setShowMiniBar] = useState(false);

    // Cập nhật trạng thái isCheckedIn khi dữ liệu bookingData thay đổi
    useEffect(() => {
        if (bookingData) {
            setIsCheckedIn(bookingData.status === 'checked_in');
        }
    }, [bookingData]);

    // ----- CÁC HÀM XỬ LÝ SỰ KIỆN -----
    const handleCheckInConfirm = () => {
        // Trong thực tế, bạn sẽ gọi API để check-in ở đây
        // Sau khi API trả về thành công, cập nhật lại state
        setIsCheckedIn(true);
        setShowCheckInModal(false);
        setShowSuccess(true);
    };

    const handleNavigateToCheckout = () => {
        navigation.navigate("checkout", { bookingId: bookingData.id_booking });
    };

    const serviceTotal = bookingData.services.reduce((total, service) => total + service.price, 0);

    if (!bookingData) {
        return <View><Text>Đang tải dữ liệu...</Text></View>; // Hoặc một component loading
    }
    
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
            </View>

            {/* Nút Check-in / Check-out */}
            {isCheckedIn ? (
                <TouchableOpacity
                    style={[styles.checkinBtn, { backgroundColor: "#c02727" }]}
                    onPress={handleNavigateToCheckout}
                >
                    <Text style={styles.checkinText}>Check-out</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.checkinBtn, { backgroundColor: "#32d35d" }]}
                    onPress={() => setShowCheckInModal(true)}
                >
                    <Text style={styles.checkinText}>Check-in</Text>
                </TouchableOpacity>
            )}

            {/* Modals */}
            <CheckinModal
                visible={showCheckInModal}
                onClose={() => setShowCheckInModal(false)}
                onConfirm={handleCheckInConfirm}
            />
            <SuccessModal
                visible={showSuccess}
                message="Check-in thành công!"
                onClose={() => setShowSuccess(false)}
            />
            <Modal visible={showMiniBar} animationType="slide">
                <MiniBarScreen onClose={() => setShowMiniBar(false)} />
            </Modal>

            {/* Action buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setShowMiniBar(true)}
                >
                    <Text style={styles.actionText}>Thêm dịch vụ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
                    <Text style={styles.actionText}>Chỉnh sửa</Text>
                </TouchableOpacity>
            </View>

            {/* Thông tin khách */}
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
                    <TouchableOpacity style={styles.paidBox}>
                        <Text style={styles.paidText}>Đã thanh toán</Text>
                    </TouchableOpacity>
                )}
                {isCheckedIn && (
                    <TouchableOpacity style={styles.checkinBox}>
                        <Text style={styles.checkinBoxText}>Đã Check in</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Thông tin nhận phòng */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin nhận phòng</Text>
                <View style={styles.tableWrapper}>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <Text style={[styles.tableHeader, styles.timeCol]}>Thời gian</Text>
                        <Text style={[styles.tableHeader, styles.statusCol]}>Trạng thái</Text>
                    </View>
                    {bookingData.history.map((item, index) => (
                        <View style={styles.tableRow} key={index}>
                            <Text style={[styles.tableText, styles.timeCol]}>{item.time}</Text>
                            <Text style={[styles.tableText, styles.statusCol, item.link && styles.link, item.color && { color: item.color }]}>
                                {item.status}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Thông tin phòng */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin phòng</Text>
                <Text style={styles.roomName}>
                    {bookingData.room.name} <Text style={styles.roomTag}>: {bookingData.room.number}</Text>
                </Text>
                <View style={styles.rowBetween}>
                    <Text>📅 Check-in: {bookingData.room.checkin_date}</Text>
                    <Text>📅 Check-out: {bookingData.room.checkout_date}</Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text>🛏️ Số đêm: {bookingData.room.nights} đêm</Text>
                    <Text>👥 Số người: {bookingData.room.guests} người</Text>
                </View>
            </View>

            {/* Thông tin giá phòng */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin giá phòng</Text>
                <View style={[styles.rowBetween, styles.rowLine]}>
                    <Text>Giá mỗi đêm</Text>
                    <Text>{bookingData.pricing.price_per_night.toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={[styles.rowBetween, styles.rowLine]}>
                    <Text>{bookingData.room.nights} đêm</Text>
                    <Text>{bookingData.pricing.room_total.toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={[styles.rowBetween, styles.rowLine]}>
                    <Text>Thêm giờ</Text>
                    <Text>{bookingData.pricing.extra_hour_fee.toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={[styles.rowBetween, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalPrice}>{bookingData.pricing.room_total.toLocaleString('vi-VN')} ₫</Text>
                </View>
            </View>

            {/* Thông tin dịch vụ */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Thông tin dịch vụ</Text>
                <View>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <Text style={[styles.tableHeader, styles.serviceNameCol]}>Tên dịch vụ</Text>
                        <Text style={[styles.tableHeader, styles.serviceCol]}>Loại</Text>
                        <Text style={[styles.tableHeader, styles.serviceCol]}>Số lượng</Text>
                        <Text style={[styles.tableHeader, styles.servicePriceCol]}>Giá</Text>
                    </View>
                    {bookingData.services.map(service => (
                        <View style={styles.tableRow} key={service.id}>
                            <Text style={[styles.tableText, styles.serviceNameCol]}>{service.name}</Text>
                            <Text style={[styles.tableText, styles.serviceCol]}>{service.type}</Text>
                            <Text style={[styles.tableText, styles.serviceCol]}>{service.quantity}</Text>
                            <Text style={[styles.tableText, styles.servicePriceCol]}>{service.price.toLocaleString('vi-VN')} ₫</Text>
                        </View>
                    ))}
                </View>
                <View style={[styles.rowBetween, styles.serviceTotalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalPrice}>{serviceTotal.toLocaleString('vi-VN')} ₫</Text>
                </View>
            </View>
        </ScrollView>
    );
}
// Giữ nguyên phần styles của bạn
const styles = StyleSheet.create({
    // ... Dán toàn bộ styles của bạn vào đây ...
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

    // Box Thanh toán
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

    // Box Check-in
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