import BookingResponse from "@/models/Booking/BookingResponse";
import { getBookingsByUserId, updateBookingStatus } from "@/service/BookingAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("CHUA_THANH_TOAN");
  const filteredBookings = filterStatus
    ? bookings.filter((b) => b.status === filterStatus)
    : bookings;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      const res = await getBookingsByUserId(Number(userId));

      // 🔍 Kiểm tra: có booking nào CHUA_THANH_TOAN bị đổi sang DA_HUY không
      setBookings((prev) => {
        if (prev.length > 0) {
          const canceledAuto = res.filter((newB) => {
            const old = prev.find((b) => b.id === newB.id);
            return old?.status === "CHUA_THANH_TOAN" && newB.status === "DA_HUY";
          });

          if (canceledAuto.length > 0) {
            // Alert.alert(
            //   "⚠️ Đặt phòng bị hủy",
            //   "Một số đơn chưa thanh toán đã bị hủy do quá thời gian thanh toán."
            // );
          }
        }
        return res;
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách booking:", error);
    } finally {
      setLoading(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchBookings();
      setCountdown(60); // reset đếm ngược mỗi khi mở lại tab
    }, [])
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      // fetch lại bookings khi countdown về 0
      fetchBookings();
    }
  }, [countdown]);


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

  const handleCancelBooking = async (bookingId: number) => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc muốn hủy đặt phòng này không?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem("userId");
              if (!userId) return;
              await updateBookingStatus(bookingId, "DA_HUY", Number(userId));
              Alert.alert("✅ Thành công", "Đã hủy đặt phòng!");
              fetchBookings();
            } catch (error) {
              console.error("❌ Lỗi khi hủy đặt phòng:", error);
              Alert.alert("❌ Lỗi", "Không thể hủy đặt phòng.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: BookingResponse }) => {
    const { room, checkInDate, checkOutDate, totalPrice, status } = item;

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: "https://achi.vn/wp-content/uploads/2024/12/Thiet-ke-khach-san-hien-dai-dep-3-sao-tai-da-nang-achi-A184-01.jpg",
          }}
          style={styles.hotelImage}
        />
        <Text style={styles.roomNumber}>Phòng: {room?.roomNumber}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.roomType}>
              {room?.typeRoom === "DON"
                ? "Phòng Đơn"
                : room?.typeRoom === "DOI"
                  ? "Phòng Đôi"
                  : "Phòng Gia Đình"}
            </Text>
            <Text
              style={[
                styles.statusBadge,
                status === "DA_HUY"
                  ? styles.statusCancel
                  : status !== "CHUA_THANH_TOAN"
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


          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.detailButton, { flex: 1 }]}
              onPress={() => router.push(`/booking/${item.id}`)}
            >
              <Text style={styles.detailText}>Xem chi tiết</Text>
            </TouchableOpacity>

            {status === "CHUA_THANH_TOAN" && (
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1 }]}
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>🧾 Lịch sử đặt phòng</Text>

        {/* 🔽 Thanh lọc trạng thái */}
        <View style={styles.filterRow}>
          {[
            { label: "Chưa thanh toán", value: "CHUA_THANH_TOAN" },
            { label: "Đã thanh toán", value: "DA_THANH_TOAN" },
            { label: "Đã hủy", value: "DA_HUY" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterButton,
                filterStatus === opt.value && styles.filterButtonActive,
              ]}
              onPress={() =>
                setFilterStatus((prev) => (prev === opt.value ? "" : opt.value))
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === opt.value && styles.filterTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🔽 Danh sách booking */}
        {filteredBookings.length === 0 ? (
          <Text style={styles.emptyText}>Không có đặt phòng nào phù hợp.</Text>
        ) : (
          <FlatList
            data={filteredBookings}
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
    backgroundColor: "#fff",
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
  },
  statusSuccess: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  statusCancel: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
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
  countdownBox: {
    marginTop: 6,
    paddingVertical: 4,
    backgroundColor: "#FEF9C3",
    borderRadius: 6,
    alignItems: "center",
  },
  countdownText: {
    color: "#92400E",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  detailButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  detailText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F87171",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 40,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: "#3B82F6",
  },
  filterText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

});
