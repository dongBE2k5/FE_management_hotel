import BookingResponse from "@/models/Booking/BookingResponse";
import { getBookingById } from "@/service/BookingAPI";
import { RootStackParamList } from "@/types/navigation";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import RoomReviewForm from "./RoomReviewForm";

type BookingDetailScreenProps = {
    bookingId: number;
}
export default function BookingDetailScreen() {
    const route = useRoute<RouteProp<RootStackParamList, 'BookedDetail'>>();
    const bookingId = route.params.id;
    console.log("bookingId", bookingId);
    const [booking, setBooking] = useState<BookingResponse>();
    const navigation = useNavigation();
    console.log("Vào trang booking detail", bookingId);
    const getStatusLabel = (status: string) => {
        const statusData = {
            CHUA_THANH_TOAN: "Chờ thanh toán",
            DA_THANH_TOAN: "Đã thanh toán",
            CHECK_IN: "Check-in",
            CHECK_OUT: "Check-out",
            DA_COC: "Đã cọc",
            DA_HUY: "Đã hủy",
        };
        return statusData[status as keyof typeof statusData] || "Không xác định";
    };

    useEffect(() => {
        const getBookingDetail = async () => {
            console.log(bookingId);

            if (bookingId) {
                const data = await getBookingById(bookingId);
                if (data) {
                    console.log("Lấy đc data", data);
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Image
                    source={{
                        uri: booking?.imageHotel,
                    }}
                    style={styles.image}
                />
                {/* nút mũi tên*/}
                <View style={styles.arrowContainer}>
                    <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
                        <Ionicons name="arrow-back" size={20} color="#009EDE" />
                    </Pressable>

                </View>
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
                                { color: booking?.status === "AVAILABLE" ? "#16A34A" : "#DC2626" },
                            ]}
                        >
                            {getStatusLabel(booking?.status!)}
                        </Text>
                        <Text>
                            {booking?.updatedAt && (
                                <Text style={styles.timeText}>
                                    {new Date(booking.updatedAt).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    ngày{" "}
                                    {new Date(booking.updatedAt).toLocaleDateString("vi-VN")}
                                </Text>
                            )}

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

                {/* Đánh giá khách sạn */}
            
                <View style={styles.section}>
                    {booking?.status === "DA_THANH_TOAN" ? (
                        <RoomReviewForm
                            roomId={booking.room.id}
                            hotelName={booking.room.hotelName}
                        />
                    ) : (
                        <Text style={{ textAlign: "center", color: "#777", fontStyle: "italic" }}>
                            Bạn chỉ có thể đánh giá sau khi đã thanh toán phòng.
                        </Text>
                    )}
                </View>

            </ScrollView>
        </GestureHandlerRootView>

    );

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
    arrowContainer: {
        alignItems: "flex-start",
        marginTop: 10,
        paddingHorizontal: 10,
    },
    timeText: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 5,
        fontStyle: "italic",
    },

});