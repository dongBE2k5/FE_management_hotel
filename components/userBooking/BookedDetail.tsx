import BookingResponse from "@/models/Booking/BookingResponse";
import { getBookingById } from "@/service/BookingAPI";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import HotelReviewForm from "./HotelReviewForm";


type BookingDetailScreenProps = {
    bookingId: number;
}
export default function BookingDetailScreen({ bookingId }: BookingDetailScreenProps) {
    const [booking, setBooking] = useState<BookingResponse>();

    useEffect(() => {
        const getBookingDetail = async () => {
            console.log(bookingId);

            if (bookingId) {
                const data = await getBookingById(bookingId);
                if (data) {
                    setBooking(data);
                } else {
                    return "Không tìm thấy thông tin đặt phòng.";
                }
                console.log(data);

            }
        }
        getBookingDetail();
    }, [bookingId]);
    return (
        // <Text>BookedDetail</Text>
        <ScrollView style={styles.container}>
            <Image
                source={{
                    uri: "https://achi.vn/wp-content/uploads/2024/12/Thiet-ke-khach-san-hien-dai-dep-3-sao-tai-da-nang-achi-A184-01.jpg",
                }}
                style={styles.image}
            />

            {/* Tiêu đề */}
            <View style={styles.header}>
                <Text style={styles.roomType}>{booking?.room?.typeRoom == "DON" ? "Phòng đơn" : booking?.room?.typeRoom == "DOI" ? "Phòng đôi" : "Phòng gia đình"}</Text>
                <Text style={styles.roomNumber}>Phòng số {booking?.room?.roomNumber}</Text>
            </View>

            {/* Thông tin đặt phòng */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Ngày nhận phòng:</Text>
                    <Text style={styles.value}>{booking?.checkInDate.toString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Ngày trả phòng:</Text>
                    <Text style={styles.value}>{booking?.checkOutDate.toString()}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Tổng tiền:</Text>
                    <Text style={[styles.value, styles.price]}>
                        {booking?.totalPrice.toLocaleString("vi-VN")} ₫
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Trạng thái:</Text>
                    <Text
                        style={[
                            styles.status,
                            { color: status === "AVAILABLE" ? "#16A34A" : "#DC2626" },
                        ]}
                    >
                        {status === "AVAILABLE" ? "Đã xác nhận" : "Đang xử lý"}
                    </Text>
                </View>
            </View>

            {/* Thông tin người đặt */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin người đặt</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Họ tên:</Text>
                    <Text style={styles.value}>{booking?.user?.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{booking?.user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Số điện thoại:</Text>
                    <Text style={styles.value}>{booking?.user?.phone}</Text>
                </View>
            </View>

            {/* Mô tả phòng */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mô tả phòng</Text>
                <Text style={styles.description}>{booking?.room?.description}</Text>
            </View>
            <View style={styles.section}>
                <HotelReviewForm />
            </View>

            {/* Nút quay lại */}
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                <Text style={styles.buttonText}>Quay lại</Text>
            </TouchableOpacity>
            
        </ScrollView>
    );
    // return (
    //     <View>
    //         <Text>BookedDetail</Text>
    //     </View>
    // )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    image: {
        width: "100%",
        height: 220,
    },
    header: {
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#E2E8F0",
    },
    roomType: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
    },
    roomNumber: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 4,
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    label: {
        fontSize: 14,
        color: "#475569",
    },
    value: {
        fontSize: 14,
        fontWeight: "500",
        color: "#0F172A",
    },
    price: {
        color: "#2563EB",
        fontWeight: "700",
    },
    status: {
        fontWeight: "600",
    },
    description: {
        color: "#475569",
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        backgroundColor: "#3B82F6",
        marginTop: 24,
        marginHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 40,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
