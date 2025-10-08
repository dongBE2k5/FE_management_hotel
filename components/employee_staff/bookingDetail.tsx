import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Image } from "react-native";
import MiniBarScreen from "./minibar";
import CheckoutModal from "./check_out";
import { router, useRouter } from 'expo-router';
import CheckinModal from "./check_in";
import SuccessModal from "./sucsessModal";
export default function BookingDetailScreen(item) {
  item = {
    id_booking: '1',
    name: 'Nguyễn Văn A',
    phone: '0123 456 789',
  }
  // Random trạng thái check-in
  const [isCheckedIn] = useState(Math.random() < 0.5);
  const router = useRouter();
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigation = useNavigation();
  // tao state de mo modal minibar
  const [showMiniBar, setShowMiniBar] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/listRoom')}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
      </View>

      {/* Nút Check-in - checkout */}
      {isCheckedIn ? (
        <TouchableOpacity
          style={[styles.checkinBtn, { backgroundColor: "#c02727" }]}
          onPress={() => router.push("/check_out")} // 👉 chuyển sang màn checkout
        >
          <Text style={styles.checkinText}>Check-out</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.checkinBtn, { backgroundColor: "#32d35d" }]}
          onPress={() => setShowCheckInModal(true)} // 👉 mở modal check-in
        >
          <Text style={styles.checkinText}>Check-in</Text>
        </TouchableOpacity>
      )}
      {/* 👇 Thêm CheckinModal ngay ở đây */}

      <CheckinModal
        visible={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onConfirm={() => {
          setShowCheckInModal(false);
          setShowSuccess(true);
        }}
      />

      <SuccessModal
        visible={showSuccess}
        message="Check-in thành công!"
        onClose={() => setShowSuccess(false)}
      />


      {/* Action buttons */}
      <View style={styles.actionRow}>
        {/* 👇 Chuyển sang MiniBar khi click */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setShowMiniBar(true)}  // 👈 sang màn hình MiniBar
        >
          <Text style={styles.actionText}>Thêm dịch vụ</Text>
        </TouchableOpacity>
        {/* khai bao modal minibar */}
        <Modal visible={showMiniBar} animationType="slide">
          <MiniBarScreen onClose={() => setShowMiniBar(false)} />
          {/* 👈 truyền hàm đóng */}
        </Modal>

        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
          <Text style={styles.actionText}>Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin khách */}
      <View style={styles.card}>
        <View style={styles.customerRow}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }} // Avatar giả
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.customerName}>Nguyễn Văn A</Text>
            <Text>CCCD: 032547458151215</Text>
            <Text>User Id: 154548</Text>
            <Text>Mã Booking: 445454646</Text>
          </View>
        </View>

        {/* Box trạng thái thanh toán */}
        <TouchableOpacity style={styles.paidBox}>
          <Text style={styles.paidText}>Đã thanh toán</Text>
        </TouchableOpacity>

        {/* Box trạng thái check-in (ẩn/hiện theo trạng thái) */}
        {isCheckedIn && (
          <TouchableOpacity style={styles.checkinBox}>
            <Text style={styles.checkinBoxText}>Đã Check in</Text>
          </TouchableOpacity>
        )}


      </View>

      {/* Thông tin nhận phòng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin nhận phòng</Text>

        <View style={styles.tableWrapper}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableHeader, styles.timeCol]}>Thời gian</Text>
            <Text style={[styles.tableHeader, styles.statusCol]}>Trạng thái</Text>
          </View>

          {/* Các dòng */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.timeCol]}>16:18:00 28/9/2025</Text>
            <Text style={[styles.tableText, styles.statusCol, styles.link]}>
              Đã đặt phòng thành công
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.timeCol]}>16:18:00 28/9/2025</Text>
            <Text style={[styles.tableText, styles.statusCol, styles.link]}>
              Đã Thanh Toán
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.timeCol]}>16:18:00 28/9/2025</Text>
            <Text style={[styles.tableText, styles.statusCol, { color: "green" }]}>
              Đã Check-in
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.timeCol]}>16:18:00 28/9/2025</Text>
            <Text style={[styles.tableText, styles.statusCol, { color: "red" }]}>
              Đã Check-out
            </Text>
          </View>
        </View>
      </View>

      {/* Thông tin phòng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin phòng</Text>
        <Text style={styles.roomName}>
          Phòng đôi <Text style={styles.roomTag}>: 501</Text>
        </Text>
        <View style={styles.rowBetween}>
          <Text>📅 Check-in: 28/01/2025</Text>
          <Text>📅 Check-out: 30/01/2025</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text>🛏️ Số đêm: 2 đêm</Text>
          <Text>👥 Số người: 2 người</Text>
        </View>
      </View>

      {/* Thông tin giá phòng */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin giá phòng</Text>

        <View style={[styles.rowBetween, styles.rowLine]}>
          <Text>Giá mỗi đêm</Text>
          <Text>2.500.000 ₫</Text>
        </View>

        <View style={[styles.rowBetween, styles.rowLine]}>
          <Text>2 đêm</Text>
          <Text>5.000.000 ₫</Text>
        </View>

        <View style={[styles.rowBetween, styles.rowLine]}>
          <Text>Thêm giờ</Text>
          <Text>0 ₫</Text>
        </View>

        <View style={[styles.rowBetween, styles.totalRow]}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>5.000.000 ₫</Text>
        </View>
      </View>

      {/* Thông tin dịch vụ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin dịch vụ</Text>

        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeader, styles.serviceNameCol]}>Tên dịch vụ</Text>
          <Text style={[styles.tableHeader, styles.serviceCol]}>Loại</Text>
          <Text style={[styles.tableHeader, styles.serviceCol]}>Số lượng</Text>
          <Text style={[styles.tableHeader, styles.servicePriceCol]}>Giá</Text>
        </View>

        {/* Dòng dữ liệu */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableText, styles.serviceNameCol]}>Buffet buổi sáng</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>Thường</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>1</Text>
          <Text style={[styles.tableText, styles.servicePriceCol]}>2.500.000 ₫</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableText, styles.serviceNameCol]}>Xe đưa đón sân bay</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>VIP</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>2</Text>
          <Text style={[styles.tableText, styles.servicePriceCol]}>1.000.000 ₫</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableText, styles.serviceNameCol]}>Spa thư giãn</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>Thường</Text>
          <Text style={[styles.tableText, styles.serviceCol]}>1</Text>
          <Text style={[styles.tableText, styles.servicePriceCol]}>800.000 ₫</Text>
        </View>

        {/* Tổng cộng */}
        <View style={[styles.rowBetween, styles.serviceTotalRow]}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>4.300.000 ₫</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffffff", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  back: { fontSize: 20, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  checkinBtn: {
    backgroundColor: "#c02727ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  checkinText: { color: "#fff", fontWeight: "bold" },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  actionBtn: {
    padding: 10,
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
  },
  editBtn: { backgroundColor: "#f1f1f1" },
  actionText: { fontSize: 14, fontWeight: "500" },

  card: {
    backgroundColor: "#f3f3f3ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  customerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },

  customerName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },

  // Box Thanh toán
  paidBox: {
    marginTop: 8,
    width: 140,
    backgroundColor: "#3432a1ff",
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  paidText: {
    color: "#e9ebf0ff",
    fontWeight: "600",
    textAlign: "center",
  },

  // Box Check-in
  checkinBox: {
    marginTop: 8,
    width: 140,
    backgroundColor: "#32d35dff",
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "center",
    paddingHorizontal: 12,
  },
  checkinBoxText: {
    color: "#171817ff",
    fontWeight: "600",
    textAlign: "center",
  },

  cardTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 17 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  link: { color: "#0077aa", fontWeight: "500" },

  roomName: { fontWeight: "bold", marginBottom: 6 },
  roomTag: { fontSize: 14, color: "#555" },

  totalRow: { borderTopWidth: 1, borderColor: "#ddd", paddingTop: 8, marginTop: 8 },
  totalLabel: { fontWeight: "bold" },
  totalPrice: { fontWeight: "bold", fontSize: 16 },
  tableWrapper: {
    borderWidth: 1,
    borderColor: "#0c0c0cff",
    borderRadius: 10,
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000000ff",
  },

  tableHeaderRow: {
    backgroundColor: "#b3b2b2ff",
  },

  tableHeader: {
    fontWeight: "bold",
    padding: 8,
    textAlign: "center",
    fontSize: 14,
  },

  tableText: {
    padding: 8,
    fontSize: 13,
  },

  timeCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#000000ff",
  },

  statusCol: {
    flex: 1,
  },
  rowLine: {
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 6,
    marginBottom: 6,
  },

  serviceNameCol: {
    flex: 2,
    borderRightWidth: 1,
    borderColor: "#ccc",
    padding: 6,
  },
  serviceCol: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    textAlign: "center",
  },
  servicePriceCol: {
    flex: 1.5,
    padding: 6,
    textAlign: "right",
  },
  serviceTotalRow: {
    borderTopWidth: 1,
    borderColor: "#007bff",
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
    paddingHorizontal: 6,
  },
});
