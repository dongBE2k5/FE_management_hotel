import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import CostDetailModal from "../model/costdetailModal";
import StaffListModal from "../model/staffListModal";

export default function checkout({ }) {
  const navigation = useNavigation();
  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [showCostDetailModal, setShowCostDetailModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  
  // State để điều khiển thanh tiến trình
  const [currentStep, setCurrentStep] = useState(1);

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
    // ... các nhân viên khác
  ];

  // <<< THAY ĐỔI 1: Mở rộng mảng data để chứa tất cả thông tin cần thiết
  const data = [
    {
      id_booking: '1',
      name: 'Nguyễn Văn A',
      phone: '0123 456 789',
      cccd: '032547458151215',
      roomType: 'Phòng gia đình',
      roomNumber: '123',
      checkInTime: '16:15 28/01/2025',
      checkOutTime: '13:40 30/01/2025',
      status: 'Đã thanh toán',
      numberOfNights: '2 đêm',
      numberOfGuests: '5 người',
      totalAmount: '5.000.000 ₫',
      amenities: '🛁 Tắm miễn phí, buffet buổi sáng',
    },
  ];

  // <<< THAY ĐỔI 2: Lấy thông tin booking từ mảng (giả sử chỉ có 1 item)
  const bookingData = data[0];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>📅 Xác nhận check-out</Text>
            <Text style={styles.subTitle}>Xác nhận khách hàng đã Check-out</Text>

            {/* Thanh tiến trình */}
            <View style={styles.progressWrapper}>
                <View style={styles.progressVisualContainer}>
                    <View style={[styles.stepCircle, currentStep >= 1 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                        <Text style={currentStep >= 1 ? styles.stepTextActive : styles.stepTextInactive}>1</Text>
                    </View>
                    <View style={[styles.connector, currentStep > 1 && styles.connectorActive]} />
                    <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                        <Text style={currentStep >= 2 ? styles.stepTextActive : styles.stepTextInactive}>2</Text>
                    </View>
                    <View style={[styles.connector, currentStep > 2 && styles.connectorActive]} />
                    <View style={[styles.stepCircle, currentStep >= 3 ? styles.stepCircleActive : styles.stepCircleInactive]}>
                        <Text style={currentStep >= 3 ? styles.stepTextActive : styles.stepTextInactive}>3</Text>
                    </View>
                </View>
                <View style={styles.progressLabelContainer}>
                    <Text style={styles.stepLabel}>Xác nhận</Text>
                    <Text style={styles.stepLabel}>Kiểm tra phòng</Text>
                    <Text style={styles.stepLabel}>Thanh toán</Text>
                </View>
            </View>
        </View>

        {/* <<< THAY ĐỔI 3: Sử dụng dữ liệu từ `bookingData` để hiển thị */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: "600" }}>👤 {bookingData.name}</Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: bookingData.status === "Đã cọc" ? "orange" : "green" },
              ]}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>{bookingData.status}</Text>
            </View>
          </View>
          <Text>📞 {bookingData.phone}</Text>
          <Text>CMND/CCCD: {bookingData.cccd}</Text>

          <View style={styles.divider} />

          <Text style={{ fontWeight: "600" }}>
            🛏️ {bookingData.roomType} - Phòng {bookingData.roomNumber}
          </Text>
          <View style={styles.rowBetween}>
            <View>
              <Text>Check-in thực tế</Text>
              <Text style={styles.bold}>{bookingData.checkInTime}</Text>
            </View>
            <View>
              <Text>Check-out thực tế</Text>
              <Text style={styles.bold}>{bookingData.checkOutTime}</Text>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text>Số ngày dự kiến: {bookingData.numberOfNights}</Text>
            <Text>Số khách: {bookingData.numberOfGuests}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={{ fontWeight: "600" }}>Tổng tiền</Text>
            <Text style={[styles.bold, { fontSize: 16 }]}>{bookingData.totalAmount}</Text>
          </View>

          <Text style={{ marginTop: 8 }}>{bookingData.amenities}</Text>
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
          onPress={() => navigation.navigate('bookingDetail', { bookingId: bookingData.id_booking })}
        >
          <Text style={{ fontWeight: "600", color: "#000" }}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (giữ nguyên styles của bạn)
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 24, // Tăng khoảng cách
  },
  headerTitle: {
    fontSize: 22, // Tăng kích thước
    fontWeight: "bold",
    textAlign: 'center', // Căn giữa
  },
  subTitle: {
    color: "#666", // Màu chữ xám hơn
    marginBottom: 24, // Tăng khoảng cách
    textAlign: 'center', // Căn giữa
    fontSize: 14,
  },
  
  // SỬA ĐỔI: Styles mới cho thanh tiến trình
  progressWrapper: {
    // Container chung
  },
  progressVisualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  
  },
  stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
  },
  stepCircleActive: {
      backgroundColor: '#1E63E9',
  },
  stepCircleInactive: {
      backgroundColor: '#D9D9D9',
  },
  stepTextActive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
  },
  stepTextInactive: {
      color: '#333333',
      fontWeight: 'bold',
  },
  stepLabel: {
      flex: 1, // Để các label tự động căn đều
      fontSize: 12,
      textAlign: 'center',
      color: '#666',
  },
  connector: {
      flex: 1,
      height: 2,
      backgroundColor: '#D9D9D9',
      marginHorizontal: 10,
  },
  connectorActive: {
      backgroundColor: '#1E63E9',
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