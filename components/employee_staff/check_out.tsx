import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import CostDetailModal from "./costdetailModal";
import StaffListModal from "./staffListModal";
import { router } from "expo-router";
import { useNavigation } from '@react-navigation/native'; 
export default function CheckoutScreen({  route }) {
  // Lấy status từ params nếu có
  const status = route?.params?.status || "Đã thanh toán";
  const navigation = useNavigation();
  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
const [showCostDetailModal, setShowCostDetailModal] = useState(false);
const [showAddServiceModal, setShowAddServiceModal] = useState(false);

// Hàm callback để mở lại CostDetailModal
const handleBackToCostDetail = () => {
  setShowCostDetailModal(true);
};
  // Dữ liệu giả nhân viên (props giả)
  const staffData = [
    {
      role: "Nhân viên dọn phòng",
      name: "Đỗ Nguyên Tài",
      status: "Đang kiểm tra phòng",
      phone: "012354667897",
    },
    {
      role: "Nhân viên dọn phòng",
      name: "Cao Đại Đồng",
      status: "Đang dọn dẹp",
      phone: "012354667897",
    },
    {
      role: "Nhân viên dọn phòng",
      name: "Nguyễn Phan Huy Thuận ",
      status: "Hết giờ làm việc",
      phone: "012354667897",
    },
    {
      role: "Nhân viên dọn phòng",
      name: "Nguyễn Trương Khang",
      status: "Đang chờ",
      phone: "012354667897",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📅 Xác nhận check-out</Text>
          <Text style={styles.subTitle}>Xác nhận khách hàng đã Check-out</Text>

          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.stepRow}>
            <Text style={[styles.step, { color: "#999" }]}>Đã Check-in</Text>
            <Text style={[styles.step, { color: "#999" }]}>Đang sử dụng</Text>
            <Text style={[styles.step, { color: "#999" }]}>
              Chuẩn bị Check-out
            </Text>
            <Text style={[styles.step, { color: "green", fontWeight: "600" }]}>
              Đã Check-out
            </Text>
          </View>
        </View>

        {/* Thông tin khách */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: "600" }}>👤 Nguyễn Văn A</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: status === "Đã cọc" ? "orange" : "green" },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>{status}</Text>
            </View>
          </View>
          <Text>📞 0123 456 789</Text>
          <Text>CMND/CCCD: 032547458151215</Text>

          <View style={styles.divider} />

          <Text style={{ fontWeight: "600" }}>
            🛏️ Phòng gia đình - Phòng 123
          </Text>
          <View style={styles.rowBetween}>
            <View>
              <Text>Check-in thực tế</Text>
              <Text style={styles.bold}>16:15 28/01/2025</Text>
            </View>
            <View>
              <Text>Check-out thực tế</Text>
              <Text style={styles.bold}>13:40 30/01/2025</Text>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text>Số ngày dự kiến: 2 đêm</Text>
            <Text>Số khách: 5 người</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: "600" }}>Tổng tiền</Text>
            <Text style={[styles.bold, { fontSize: 16 }]}>5.000.000 ₫</Text>
          </View>

          <Text style={{ marginTop: 8 }}>🛁 Tắm miễn phí, buffet buổi sáng</Text>
        </View>

        {/* Nút hành động */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "green" }]}
          onPress={() => setStaffModalVisible(true)}
        >
          <Text style={styles.btnText}>Gọi nhân viên kiểm tra phòng</Text>
        </TouchableOpacity>

        {/* Modal danh sách nhân viên */}
        <StaffListModal
          visible={staffModalVisible}
          staffList={staffData}
          onClose={() => setStaffModalVisible(false)}
        />

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#1E63E9" }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnText}>Xem chi tiết dịch vụ đã dùng</Text>
        </TouchableOpacity>

        <CostDetailModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        {/* Nút hủy → quay lại màn trước */}
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#ccc" }]}
          onPress={() => navigation.navigate('bookingDetail', { bookingId: 1 })}
        >
          <Text style={{ fontWeight: "600", color: "#000" }}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subTitle: {
    color: "#555",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "green",
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  step: {
    fontSize: 12,
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
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
