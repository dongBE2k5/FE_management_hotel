import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import * as Linking from 'expo-linking';
import PaymentAPI from "../../../service/Payment/PaymentAPI";

// Hàm helper để định dạng tiền tệ cho đẹp
const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};
const handlePayment = async () => {
  try {
    const paymentUrl = await PaymentAPI.createPayment(5000000,'vnpay',1 ) 
    if (paymentUrl) {
      await Linking.openURL(paymentUrl.toString());
    }
    else {
      Alert.alert("Lỗi","Không thể tạo đơn thanh toán")
      console.log("reponse",paymentUrl)
    }
  } catch (error) {
    console.error("Error during payment:", error);
  }
};
export default function CostDetailModal({ visible, onClose }) {

const costData = {
  roomDetails: {
    name: "Phòng gia đình",
    description: "2 đêm × 2,500,000 ₫",
    price: 5000000,
  },
  services: [
    {
      name: "Buffet sáng",
      description: "SL: 2 × 150,000 ₫",
      price: 300000,
    },
    {
      name: "Spa thư giãn",
      description: "SL: 1 × 300,000 ₫",
      price: 300000,
    },
    {
      name: "Giặt ủi",
      description: "SL: 3 × 50,000 ₫",
      price: 150000,
    },
  ],
};

  // Tính toán tổng tiền dịch vụ
  const servicesTotal = costData.services?.reduce(
    (total, service) => total + service.price,
    0
  ) ?? 0;

  // Tính tổng cộng hóa đơn
  const totalAmount = (costData.roomDetails?.price ?? 0) + servicesTotal;

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
            {/* Phần tiền phòng - Lấy từ props */}
            {costData.roomDetails && (
              <>
                <Text style={styles.sectionTitle}>Tiền phòng</Text>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.bold}>{costData.roomDetails.name}</Text>
                    <Text style={styles.subText}>{costData.roomDetails.description}</Text>
                  </View>
                  <Text style={styles.price}>{formatCurrency(costData.roomDetails.price)}</Text>
                </View>
              </>
            )}

            {/* Phần dịch vụ đã dùng - Dùng map để render */}
            {costData.services && costData.services.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Dịch vụ đã dùng</Text>
                {costData.services.map((service, index) => (
                  <View style={styles.rowBetween} key={index}>
                    <View>
                      <Text style={styles.bold}>{service.name}</Text>
                      <Text style={styles.subText}>{service.description}</Text>
                    </View>
                    <Text style={styles.price}>{formatCurrency(service.price)}</Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Tổng cộng - Tự động tính toán */}
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>

          {/* Nút đóng */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeBtn} onPress={handlePayment}>
            <Text style={styles.closeText}>thanh toán </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Styles giữ nguyên như cũ
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