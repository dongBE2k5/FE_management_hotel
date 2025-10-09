import BookingResponse from "@/models/Booking/BookingResponse";
import { getBookingsByUserId } from "@/service/BookingAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../userHome/header";

export default function BookedList() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);

 
  useFocusEffect(
    useCallback(() => {
      const fetchBookings = async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');
          console.log(userId);
          const res = await getBookingsByUserId(Number(userId));
          console.log("📦 Dữ liệu booking:", res);
          setBookings(res);
        } catch (error) {
          console.error("❌ Lỗi khi lấy danh sách booking:", error);
        }
      };

      fetchBookings();

      return () => { };
    }, [])
  );

  function getStatusLabel(status: string) {
    const statusData = {
      CHUA_THANH_TOAN: "Chờ thanh toán",
      DA_THANH_TOAN: "Đã thanh toán",
      CHECK_IN: "Check-in",
      CHECK_OUT: "Check-out",
      DA_COC: "Đã cọc"
    };
    
    return statusData[status as keyof typeof statusData] || "Không xác định";
  }



  const renderItem = ({ item }: { item: BookingResponse }) => {
    const { room, checkInDate, checkOutDate, totalPrice, status } = item;

    return (
      <>
        <View style={styles.card}>
          {/* Ảnh phòng */}
          <Image
            source={{
              uri:
                "https://achi.vn/wp-content/uploads/2024/12/Thiet-ke-khach-san-hien-dai-dep-3-sao-tai-da-nang-achi-A184-01.jpg"
            }}
            style={styles.hotelImage}
          />

          {/* Nội dung thông tin */}
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.roomType}>
                {room?.typeRoom === "DON" ? "Phòng Đơn" : room?.typeRoom === "DOI" ? "Phòng Đôi" : "Phòng Gia Đình"}
              </Text>
              <Text
                style={[
                  styles.statusBadge,
                  status !== "CHUA_THANH_TOAN"
                    ? styles.statusSuccess
                    : styles.statusPending,
                ]}
              >
                {getStatusLabel(status)}
              </Text>
            </View>

            <Text style={styles.roomNumber}>Phòng: {room?.roomNumber}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {room?.description}
            </Text>

            <View style={styles.dateRow}>
              <View>
                <Text style={styles.label}>Nhận phòng</Text>
                <Text style={styles.value}>{checkInDate.toString()}</Text>
              </View>
              <View>
                <Text style={styles.label}>Trả phòng</Text>
                <Text style={styles.value}>{checkOutDate.toString()}</Text>
              </View>
              <View>
                <Text style={styles.label}>Giá</Text>
                <Text style={[styles.value, { color: "#DC2626" }]}>
                  {totalPrice.toLocaleString("vi-VN")}₫
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.detailButton} onPress={() => router.push(`/booking/${item.id}`)}>
              <Text style={styles.detailText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>🧾 Lịch sử đặt phòng</Text>

        {bookings.length === 0 ? (
          <Text style={styles.emptyText}>Bạn chưa có đặt phòng nào.</Text>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  hotelImage: {
    width: "100%",
    height: 170,
  },
  infoContainer: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  statusSuccess: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  roomNumber: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  detailButton: {
    marginTop: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  detailText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 40,
    fontSize: 16,
  },
});
