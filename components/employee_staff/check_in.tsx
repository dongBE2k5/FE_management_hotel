import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";

export default function CheckinModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <Text style={styles.headerTitle}>📅 Xác nhận check-in</Text>
          <Text style={styles.subTitle}>Xác nhận khách hàng đã Check-In</Text>

          {/* Card thông tin */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.bold}>👤 Nguyễn Văn A</Text>
              <View style={[styles.badge, { backgroundColor: "green" }]}>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  Đã thanh toán tiền phòng
                </Text>
              </View>
            </View>

            <Text>📞 0123 456 789</Text>
            <Text>CCCD: 032547458151215</Text>

            <View style={styles.divider} />

            <Text style={styles.bold}>🛏️ Phòng gia đình - Phòng 123</Text>
            <View style={styles.rowBetween}>
              <View>
                <Text>Check-in thực tế</Text>
                <Text style={styles.bold}>16:15 28/01/2025</Text>
              </View>
              <View>
                <Text>Check-out dự kiến</Text>
                <Text style={styles.bold}>12:30 30/01/2025</Text>
              </View>
            </View>

            <View style={styles.rowBetween}>
              <Text>Số ngày dự kiến: 2 đêm</Text>
              <Text>Số khách: 5 người</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.bold}>Tổng tiền chưa bao gồm dịch vụ</Text>
              <Text style={[styles.bold, { fontSize: 16 }]}>5.000.000 ₫</Text>
            </View>

            <Text style={{ marginTop: 8 }}>
              🛁 Tắm miễn phí, buffet buổi sáng
            </Text>
          </View>

          {/* Footer buttons */}
          <View style={styles.rowBetween}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#ccc" }]}
              onPress={onClose}
            >
              <Text style={{ color: "#000", fontWeight: "600" }}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "green" }]}
              onPress={onConfirm}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                Xác nhận check-in
              </Text>
            </TouchableOpacity>
          </View>
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
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    width: "90%",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subTitle: {
    color: "#555",
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    alignItems: "center",
  },
  bold: {
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
});
