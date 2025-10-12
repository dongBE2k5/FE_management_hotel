import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Giả định bạn đã có các hàm API và component Modal này
import { getBookingById, getHistoryBookingsByBookingId } from "@/service/BookingAPI";
// import { getServicesByBookingId } from "@/service/ServiceAPI"; // Bỏ comment khi có API dịch vụ
import CostDetailModal from "../model/CostDetailModal";
import StaffListModal from "../model/staffListModal";

// HÀM HỢP NHẤT DỮ LIỆU CHO MÀN HÌNH CHÍNH
const transformDataForScreen = (bookingDetails, historyDetails) => {
  // Tìm thời gian check-in thực tế từ lịch sử
  const checkInRecord = historyDetails.find(item => item.newStatus === 'CHECK_IN');
  const actualCheckInTime = checkInRecord
    ? new Date(checkInRecord.createdAt).toLocaleString('vi-VN')
    : 'Chưa check-in';

  // Lấy thời gian check-out là thời gian hiện tại
  const actualCheckOutTime = new Date().toLocaleString('vi-VN');

  // Map trạng thái thanh toán
  let paymentStatusText = 'Chưa xác định';
  switch (bookingDetails.paymentStatus) {
    case 'DA_THANH_TOAN': paymentStatusText = 'Đã thanh toán'; break;
    case 'DA_COC': paymentStatusText = 'Đã cọc'; break;
    case 'CHUA_THANH_TOAN': paymentStatusText = 'Chưa thanh toán'; break;
  }

  // Trả về một đối tượng duy nhất cho UI chính
  return {
    id_booking: bookingDetails.id,
    name: bookingDetails.user?.fullName ?? 'N/A',
    phone: bookingDetails.user?.phone ?? 'N/A',
    cccd: bookingDetails.user?.cccd ?? 'N/A',
    roomType: bookingDetails.room?.type ?? 'N/A',
    roomNumber: bookingDetails.room?.number ?? 'N/A',
    status: paymentStatusText,
    numberOfNights: `${bookingDetails.room?.nights ?? 0} đêm`,
    numberOfGuests: `${bookingDetails.numberOfGuests ?? 0} người`,
    totalAmount: `${(bookingDetails.totalPrice ?? 0).toLocaleString('vi-VN')} ₫`,
    amenities: '🛁 Tắm miễn phí, buffet buổi sáng', // Giữ tạm hoặc lấy từ API nếu có
    checkInTime: actualCheckInTime,
    checkOutTime: actualCheckOutTime,
  };
};

export default function Checkout() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params;

  // State cho dữ liệu, loading và lỗi
  const [bookingData, setBookingData] = useState(null);
  const [costDetailsForModal, setCostDetailsForModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho các modal
  const [costModalVisible, setCostModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Dữ liệu giả nhân viên (có thể thay bằng API sau)
  const staffData = [
    {
      role: "Nhân viên dọn phòng",
      name: "Đỗ Nguyên Tài",
      status: "Đang kiểm tra phòng",
      phone: "012354667897",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        setError("Không có mã đặt phòng.");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        // Gọi đồng thời các API cần thiết
        const [bookingDetails, historyDetails] = await Promise.all([
          getBookingById(bookingId),
          getHistoryBookingsByBookingId(bookingId),
          // getServicesByBookingId(bookingId) // Bỏ comment khi có API
        ]);

        // 1. Xử lý dữ liệu cho màn hình checkout chính
        const formattedScreenData = transformDataForScreen(bookingDetails, historyDetails);
        setBookingData(formattedScreenData);

        // 2. Chuẩn bị dữ liệu riêng cho CostDetailModal
        const checkInRecord = historyDetails.find(item => item.newStatus === 'CHECK_IN');
        // console.log(checkInRecord.createdAt);
        console.log(bookingDetails);

        if (checkInRecord && bookingDetails.room?.price) {
          const checkInDate = new Date(checkInRecord.createdAt);
          checkInDate.setHours(12, 0, 0, 0); // Chuẩn hóa giờ check-in

          const checkOutDate = new Date();
          checkOutDate.setHours(12, 0, 0, 0); // Chuẩn hóa giờ check-out

          // Tính số ngày, làm tròn lên
          const diffTime = Math.max(0, checkOutDate - checkInDate);
          const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          const roomTotal = numberOfDays * bookingDetails.room.price;



          const modalData = {
            roomDetails: {
              name: bookingDetails.room.type,
              description: `${numberOfDays} đêm × ${bookingDetails.room.price} ₫`,
              price: roomTotal,
            },
            // services: servicesUsed.map(...) // Bỏ comment và xử lý khi có API
            services: [], // Để trống theo yêu cầu
            bookingId: bookingId, // Truyền ID để thanh toán
          };
          setCostDetailsForModal(modalData);
        }

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu check-out:", err);
        setError(err.message || "Đã xảy ra lỗi không xác định.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  // Giao diện khi đang tải
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1E63E9" />
        <Text style={{ marginTop: 10 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  // Giao diện khi có lỗi
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: 'red' }}>Lỗi: {error}</Text>
      </View>
    );
  }

  // Giao diện chính khi đã có dữ liệu
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📅 Xác nhận check-out</Text>
          <Text style={styles.subTitle}>Xác nhận khách hàng đã Check-out</Text>
          {/* Thanh tiến trình */}
          <View style={styles.progressWrapper}>
            <View style={styles.progressVisualContainer}>
              <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}><Text style={styles.stepTextActive}>1</Text></View>
              <View style={[styles.connector, currentStep > 1 && styles.connectorActive]} />
              <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}><Text style={currentStep >= 2 ? styles.stepTextActive : styles.stepTextInactive}>2</Text></View>
              <View style={[styles.connector, currentStep > 2 && styles.connectorActive]} />
              <View style={[styles.stepCircle, currentStep >= 3 ? styles.stepCircleActive : styles.stepCircleInactive]}><Text style={currentStep >= 3 ? styles.stepTextActive : styles.stepTextInactive}>3</Text></View>
            </View>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.stepLabel}>Xác nhận</Text>
              <Text style={styles.stepLabel}>Kiểm tra phòng</Text>
              <Text style={styles.stepLabel}>Thanh toán</Text>
            </View>
          </View>
        </View>

        {bookingData && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={{ fontWeight: "600" }}>👤 {bookingData.name}</Text>
              <View style={[styles.badge, { backgroundColor: bookingData.status === "Đã cọc" ? "orange" : "green" }]} >
                <Text style={{ color: "#fff", fontSize: 12 }}>{bookingData.status}</Text>
              </View>
            </View>
            <Text>📞 {bookingData.phone}</Text>
            <Text>CMND/CCCD: {bookingData.cccd}</Text>
            <View style={styles.divider} />
            <Text style={{ fontWeight: "600" }}>🛏️ {bookingData.roomType} - Phòng {bookingData.roomNumber}</Text>
            <View style={styles.rowBetween}>
              <View><Text>Check-in thực tế</Text><Text style={styles.bold}>{bookingData.checkInTime}</Text></View>
              <View><Text>Check-out thực tế</Text><Text style={styles.bold}>{bookingData.checkOutTime}</Text></View>
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
        )}

        <TouchableOpacity style={[styles.btn, { backgroundColor: "green" }]} onPress={() => setStaffModalVisible(true)}>
          <Text style={styles.btnText}>Gọi nhân viên kiểm tra phòng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#1E63E9" }]}
          // BỎ ĐIỀU KIỆN IF, LUÔN CHO PHÉP MỞ MODAL
          onPress={() => setCostModalVisible(true)}
        >
          <Text style={styles.btnText}>Xem chi tiết dịch vụ & thanh toán</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: "#ccc" }]} onPress={() => navigation.goBack()}>
          <Text style={{ fontWeight: "600", color: "#000" }}>Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>

      <StaffListModal
        visible={staffModalVisible}
        staffList={staffData}
        onClose={() => setStaffModalVisible(false)}
      />

      <CostDetailModal
        visible={costModalVisible}
        onClose={() => setCostModalVisible(false)}
        costData={costDetailsForModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: 'center',
  },
  subTitle: {
    color: "#666",
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  progressWrapper: {},
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
    flex: 1,
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