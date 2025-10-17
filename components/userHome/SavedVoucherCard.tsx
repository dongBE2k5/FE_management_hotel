import { StyleSheet, Text, View,TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Voucher from "@/models/Voucher";

interface SavedVoucherCardProps {
  voucher: Voucher;
  onSelect?: (voucher: Voucher) => void;
}

export default function SavedVoucherCard({ voucher }: SavedVoucherCardProps) {
  const usedPercent = ((voucher.used || 0) / voucher.quantity) * 100;

  return (
    <View style={styles.shadowWrapper}>
      <TouchableOpacity style={styles.cardContainer}>
        {/* Dải màu bên trái */}
        <View style={styles.leftBar}>
          <Ionicons name="gift-outline" size={22} color="#fff" />
          <Text style={styles.leftText}>{voucher.name || "Ưu đãi đặc biệt"}</Text>
        </View>

        {/* Phần nội dung bên phải */}
        <View style={styles.rightContent}>
          <Text style={styles.percentText}>
             Giảm {voucher.percent}% đặt khách sạn
          </Text>
          <Text style={styles.desc}>
            Đơn Tối Thiểu {voucher.priceCondition?.toLocaleString()} VND
          </Text>

          <Text style={styles.eventName}>{voucher.name || "Sự kiện ưu đãi"}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.status}>
              Đã dùng {voucher.used || 0}/{voucher.quantity} ({usedPercent.toFixed(0)}%)
            </Text>
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

    // 🌫️ Bóng mềm cho iOS
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,

    // 🌫️ Bóng cho Android
    elevation: 6,
  },

  cardContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
      width: '100%',
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
  },
  status: {
    fontSize: 11,
    color: "#666",
  },
});
