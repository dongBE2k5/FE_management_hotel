import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Voucher from "@/models/Voucher";
import { getHotelById } from "@/service/HotelAPI";

interface SavedVoucherCardProps {
  voucher: Voucher;
  onSelect?: (voucher: Voucher) => void;
}

export default function SavedVoucherCard({ voucher, onSelect }: SavedVoucherCardProps) {
  const usedPercent = ((voucher.used || 0) / voucher.initialQuantity) * 100;
  const isOutOfStock = (voucher.used || 0) >= voucher.initialQuantity; // 👈 Kiểm tra hết lượt

  //lấy tên ks thông qua hotel_id
  const [hotelName, setHotelName] = useState<string | null>(null);
  useEffect(() => {
    if (voucher.hotelId) {
      getHotelById(voucher.hotelId)
        .then(hotel => setHotelName(hotel?.name || "Khách sạn"))
        .catch(() => setHotelName("Không xác định"));
    }
  }, [voucher.hotelId]);
  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity
        style={[styles.cardContainer, isOutOfStock && { opacity: 0.6 }]} // 👈 Làm mờ nếu hết
        disabled={isOutOfStock} // 👈 Không cho bấm
        onPress={() => !isOutOfStock && onSelect && onSelect(voucher)} // 👈 Chỉ gọi khi còn lượt
      >
        {/* Dải màu bên trái */}
        <View style={[styles.leftBar, isOutOfStock && { backgroundColor: "#A0A0A0" }]}>
          <Ionicons name="gift-outline" size={22} color="#fff" />
          <Text style={styles.leftText}>{voucher.code || "Ưu đãi đặc biệt"}</Text>
        </View>

        {/* Phần nội dung bên phải */}
        <View style={styles.rightContent}>
          {/* ⚙️ Nhãn loại voucher */}
          <Text
            style={[
              styles.voucherType,
              !voucher.hotelId ? styles.appVoucher : styles.hotelVoucher,
            ]}
          >
            {!voucher.hotelId
              ? "🎁 Toàn hệ thống"
              : hotelName
                ? `🏨 ${hotelName}`
                : "Đang tải..."}
          </Text>

          <Text style={styles.percentText}>Giảm {voucher.percent}% đặt khách sạn</Text>
          <Text style={styles.desc}>
            Đơn Tối Thiểu {voucher.priceCondition?.toLocaleString()} VND
          </Text>

          <Text style={styles.eventName}>{voucher.name || "Sự kiện ưu đãi"}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.status}>
              Đã dùng {voucher.used || 0}/{voucher.initialQuantity} ({usedPercent.toFixed(0)}%)
            </Text>

            {isOutOfStock && (
              <Text style={styles.outOfStockText}>Đã hết lượt</Text>
            )}
          </View>
        </View>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    width: "100%",
  },
  leftBar: {
    backgroundColor: "#009EDE",
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    paddingVertical: 12,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  leftText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  rightContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  percentText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#000",
  },
  desc: {
    fontSize: 12,
    color: "#555",
    marginVertical: 3,
  },
  eventName: {
    fontSize: 12,
    color: "#FF5722",
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  status: {
    fontSize: 11,
    color: "#666",
  },
  outOfStockText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "red",
  },
  voucherType: {
    fontSize: 11,
    fontWeight: "bold",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 4,
  },
  appVoucher: {
    backgroundColor: "#FFB300",
    color: "#fff",
  },
  hotelVoucher: {
    backgroundColor: "#00BCD4",
    color: "#fff",
  },

});
