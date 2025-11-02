import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView, // 👈 Thêm ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// 🔹 Hàm helper để format tiền tệ
const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return "0 ₫";
  }
  return `${value.toLocaleString("vi-VN")} ₫`;
};

export default function DamageConfirmModal({
  visible,
  onClose,
  onBackToFeedback,
  onBackToConstdetailmodal,
  damagedItems = [], // 👈 Nhận prop damagedItems
}) {
  
    console.log('damagedItems in DamageConfirmModal:', damagedItems);
  // 🔹 Tự động tính toán tổng số lượng và tổng chi phí
  const { totalQuantity, totalCost } = React.useMemo(() => {
    return damagedItems.reduce(
      (acc, item) => {
        // Đảm bảo quantityAffected và price là số
        const quantity = Number(item.quantityAffected) || 0;
        const price = Number(item.price) || 0;
        
        acc.totalQuantity += quantity;
        acc.totalCost += price * quantity;
        return acc;
      },
      { totalQuantity: 0, totalCost: 0 }
    );
  }, [damagedItems]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Bấm vào vùng overlay sẽ đóng modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* View bên trong không nhận sự kiện chạm overlay */}
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Tiêu đề */}
              <Text style={styles.title}>Xác nhận chi phí đền bù</Text>

              {/* Thông báo chính - Đã thay bằng dữ liệu động */}
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={22} color="red" />
                <Text style={styles.warningText}>
                  Nhân viên đã báo cáo{" "}
                  <Text style={styles.bold}>
                    {totalQuantity} mục hư hỏng/thiếu
                  </Text>{" "}
                  với tổng chi phí là{" "}
                  <Text style={styles.boldRed}>{formatCurrency(totalCost)}</Text>.
                </Text>
              </View>

              {/* Danh sách chi tiết - Đã thay bằng .map() */}
              <ScrollView style={styles.listContainer}>
                {damagedItems.map((item, index) => (
                  <View key={item.id || index}>
                    <View style={styles.item}>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemPrice}>
                        {formatCurrency(item.price * item.quantityAffected)}
                      </Text>
                    </View>
                    <Text style={styles.subText}>
                      {`${formatCurrency(item.price)} × ${item.quantityAffected}`}
                    </Text>
                    {/* Thêm đường kẻ nếu không phải item cuối */}
                    {index < damagedItems.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Nút hành động (Giữ nguyên logic) */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#2ecc71" }]}
                  onPress={onBackToFeedback} 
                >
                  <Text style={styles.btnText}>Yêu cầu kiểm tra lại</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007BFF" }]}
                  onPress={() => {
                    onClose?.();
                    setTimeout(() => {
                      onBackToConstdetailmodal?.();
                    }, 300);
                  }}
                >
                  <Text style={styles.btnText}>Xác nhận & Thêm vào hóa đơn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    maxHeight: "80%", // 👈 Thêm giới hạn chiều cao
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  bold: {
    fontWeight: "600",
  },
  boldRed: {
    fontWeight: "700",
    color: "red",
  },
  // 👈 Thêm style cho ScrollView
  listContainer: {
    maxHeight: 200, // Giới hạn chiều cao của list
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: {
    fontWeight: "600",
    color: "#333",
    flexShrink: 1, // 👈 Cho phép tên item xuống dòng
    marginRight: 8,
  },
  itemPrice: {
    fontWeight: "600",
    color: "#000",
  },
  subText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});