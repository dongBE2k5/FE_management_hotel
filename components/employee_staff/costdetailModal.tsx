import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function CostDetailModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Chi tiết dịch vụ & chi phí</Text>

          <ScrollView style={{ maxHeight: 400 }}>
            {/* Phần tiền phòng */}
            <Text style={styles.sectionTitle}>Tiền phòng</Text>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bold}>Phòng gia đình</Text>
                <Text style={styles.subText}>2 đêm × 2,500,000 ₫</Text>
              </View>
              <Text style={styles.price}>5,000,000 ₫</Text>
            </View>

            {/* Phần dịch vụ đã dùng */}
            <Text style={styles.sectionTitle}>Dịch vụ đã dùng</Text>

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bold}>Buffet sáng</Text>
                <Text style={styles.subText}>SL: 2 × 150,000 ₫</Text>
              </View>
              <Text style={styles.price}>300,000 ₫</Text>
            </View>

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.bold}>Spa</Text>
                <Text style={styles.subText}>SL: 1 × 300,000 ₫</Text>
              </View>
              <Text style={styles.price}>300,000 ₫</Text>
            </View>
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Tổng cộng */}
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>5,600,000 ₫</Text>
          </View>

          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "90%",
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "600",
  },
  subText: {
    color: "#666",
    fontSize: 12,
  },
  price: {
    color: "green",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  totalLabel: {
    fontWeight: "700",
  },
  totalPrice: {
    fontWeight: "700",
    color: "green",
    fontSize: 16,
  },
  closeBtn: {
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});
