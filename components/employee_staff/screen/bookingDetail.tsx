import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

// SỬA ĐỔI: Sử dụng các component thật được import từ thư mục model
import CheckinModal from "../model/check_in";
import MiniBarScreen from "../model/minibar";
import SuccessModal from "../model/sucsessModal"; // Giữ nguyên lỗi chính tả 'sucsess' để khớp với code của bạn


export default function BookingDetail(props) {
  const navigation = useNavigation();
  // Nhận dữ liệu thật từ props thay vì hardcode
  const item = props.item || {
    id_booking: 'B00123',
    name: 'Nguyễn Văn An',
    phone: '0987 654 321',
    cccd: '012345678912',
    userId: 'U00456'
  };

  // State
  const [isCheckedIn, setIsCheckedIn] = useState(false); // Bắt đầu với trạng thái chưa check-in
  const router = useRouter();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMiniBar, setShowMiniBar] = useState(false);

  const handleCheckInSuccess = () => {
    setShowCheckInModal(false);
    setShowSuccess(true);
    setIsCheckedIn(true); // Cập nhật trạng thái sau khi check-in thành công
    setTimeout(() => setShowSuccess(false), 2000); // Tự động đóng modal thành công
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        {/* Nút Check-in / Check-out */}
        {isCheckedIn ? (
          <TouchableOpacity
            style={[styles.mainActionButton, { backgroundColor: COLORS.danger }]}
            onPress={() => navigation.navigate("checkout")} // SỬA LỖI: Dùng router.push
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
            <Text style={styles.mainActionButtonText}>Check-out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainActionButton, { backgroundColor: COLORS.success }]}
            onPress={() => setShowCheckInModal(true)}
          >
             <Ionicons name="log-in-outline" size={22} color={COLORS.white} />
            <Text style={styles.mainActionButtonText}>Check-in</Text>
          </TouchableOpacity>
        )}

        {/* Action buttons phụ */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowMiniBar(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Thêm dịch vụ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
             <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Thông tin khách */}
        <View style={styles.card}>
            <View style={styles.customerRow}>
                <Image
                    source={{ uri: `https://i.pravatar.cc/150?u=${item.userId}` }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerInfo}>CCCD: {item.cccd}</Text>
                    <Text style={styles.customerInfo}>User ID: {item.userId}</Text>
                    <Text style={styles.customerInfo}>Mã Booking: {item.id_booking}</Text>
                </View>
            </View>
            <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, {backgroundColor: COLORS.primaryFaded}]}>
                    <Text style={[styles.statusBadgeText, {color: COLORS.primary}]}>Đã thanh toán</Text>
                </View>
                {isCheckedIn && (
                    <View style={[styles.statusBadge, {backgroundColor: COLORS.successFaded}]}>
                        <Text style={[styles.statusBadgeText, {color: COLORS.success}]}>Đã Check-in</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Lịch sử nhận phòng - Giao diện bảng */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Lịch sử nhận phòng</Text>
            <View style={styles.table}>
                {/* Header */}
                <View style={styles.tableRowHeader}>
                    <Text style={[styles.tableHeader, {flex: 1.5}]}>Thời gian</Text>
                    <Text style={[styles.tableHeader, {flex: 2}]}>Trạng thái</Text>
                </View>
                {/* Body */}
                <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>16:18 28/09/2025</Text>
                    <Text style={styles.tableCell}>Đặt phòng thành công</Text>
                </View>
                 <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>16:20 28/09/2025</Text>
                    <Text style={styles.tableCell}>Đã thanh toán</Text>
                </View>
                {isCheckedIn && (
                    <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>14:00 29/09/2025</Text>
                        <Text style={[styles.tableCell, {color: COLORS.success, fontWeight: '600'}]}>Đã Check-in</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Thông tin phòng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin phòng</Text>
          <Text style={styles.roomName}>
            Phòng Superior Double <Text style={styles.roomNumber}>P.501</Text>
          </Text>
           <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Check-in:</Text>
                <Text style={styles.infoValue}>Thứ Ba, 28/01/2025</Text>
            </View>
             <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Check-out:</Text>
                <Text style={styles.infoValue}>Thứ Năm, 30/01/2025</Text>
            </View>
             <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số đêm:</Text>
                <Text style={styles.infoValue}>2 đêm</Text>
            </View>
             <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số người:</Text>
                <Text style={styles.infoValue}>2 người lớn</Text>
            </View>
        </View>

        {/* Thông tin giá & dịch vụ */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
            {/* Giá phòng */}
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giá phòng (2 đêm x 2.500.000₫)</Text>
                <Text style={styles.priceValue}>5.000.000 ₫</Text>
            </View>
             {/* Dịch vụ */}
            <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Xe đưa đón sân bay</Text>
                <Text style={styles.priceValue}>1.000.000 ₫</Text>
            </View>
             <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Spa thư giãn (x1)</Text>
                <Text style={styles.priceValue}>800.000 ₫</Text>
            </View>
            {/* Total */}
             <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalPrice}>6.800.000 ₫</Text>
            </View>
        </View>

        {/* Modals */}
        <CheckinModal
            visible={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            onConfirm={handleCheckInSuccess}
        />
        <SuccessModal
            visible={showSuccess}
            message="Check-in thành công!"
            onClose={() => setShowSuccess(false)}
        />
        <Modal visible={showMiniBar} animationType="slide" transparent={true}>
            <MiniBarScreen onClose={() => setShowMiniBar(false)} />
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const COLORS = {
  primary: '#007AFF',
  primaryFaded: '#E6F2FF',
  success: '#34C759',
  successFaded: '#E2F8E8',
  danger: '#FF3B30',
  white: '#FFFFFF',
  lightGray: '#EFEFEF',
  mediumGray: '#D1D1D6',
  textDark: '#1C1C1E',
  textLight: '#8A8A8E',
  background: '#F9F9F9', // Nền sáng hơn một chút
  border: '#EAEAEA',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },

  mainActionButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mainActionButtonText: { color: COLORS.white, fontWeight: "bold", fontSize: 18 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, gap: 15 },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600", color: COLORS.primary },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 15, fontSize: 17, color: COLORS.textDark },
  
  customerRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  customerName: { fontSize: 18, fontWeight: "bold", color: COLORS.textDark, marginBottom: 4 },
  customerInfo: { fontSize: 14, color: COLORS.textLight, lineHeight: 20 },
  
  statusBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontWeight: "600",
    fontSize: 12,
  },
  
  // Giao diện bảng được làm lại
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden', // Quan trọng để bo góc hoạt động
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableHeader: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.textDark,
  },
  tableCell: {
    flex: 2, // Mặc định
    padding: 10,
    fontSize: 14,
    color: COLORS.textLight,
  },

  roomName: { fontWeight: "600", fontSize: 16, marginBottom: 10, color: COLORS.textDark },
  roomNumber: { color: COLORS.primary, fontWeight: 'bold' },
  
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
      color: COLORS.textLight,
      fontSize: 14,
  },
  infoValue: {
      color: COLORS.textDark,
      fontSize: 14,
      fontWeight: '500'
  },
  
  priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
  },
  priceLabel: {
      fontSize: 14,
      color: COLORS.textLight,
  },
  priceValue: {
      fontSize: 14,
      color: COLORS.textDark,
      fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    marginTop: 5,
  },
  totalLabel: { fontWeight: "bold", fontSize: 18, color: COLORS.textDark },
  totalPrice: { fontWeight: "bold", fontSize: 18, color: COLORS.primary },

  // Styles for Modals (ví dụ)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
  }
});

