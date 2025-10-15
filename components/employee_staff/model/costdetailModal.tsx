import * as Linking from 'expo-linking';
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PaymentAPI from "../../../service/Payment/PaymentAPI";

// Hàm helper để định dạng tiền tệ
const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Component nhận props và hiển thị, không chứa logic kiểm tra dữ liệu rỗng
export default function CostDetailModal({ visible, onClose, costData }) {

  // Nếu không có dữ liệu, hiển thị modal thông báo
  if (!costData) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Không có thông tin</Text>
                    <Text style={{ textAlign: 'center', marginVertical: 10 }}>
                        Không thể tính toán chi phí. Vui lòng kiểm tra lại thông tin check-in.
                    </Text>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
  }

  // Luôn giả định costData có tồn tại khi modal được mở
  // Tính tổng tiền dịch vụ
  const servicesTotal = costData?.services?.reduce(
    (total, service) => total + service.price,
    0
  ) ?? 0;

  // Tính tổng cộng hóa đơn
  const totalAmount = (costData?.roomDetails?.price ?? 0) + servicesTotal;

  const handlePayment = async () => {
    try {
      if (!totalAmount || !costData?.bookingId) {
        Alert.alert("Lỗi", "Không đủ thông tin để thanh toán.");
        return;
      }
      const paymentUrl = await PaymentAPI.createPayment(totalAmount, 'vnpay', costData.bookingId);
      if (paymentUrl) {
        await Linking.openURL(paymentUrl.toString());
      } else {
        Alert.alert("Lỗi", "Không thể tạo đơn thanh toán");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi thanh toán.");
    }
  };

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
            {costData?.roomDetails && (
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

            {/* Phần dịch vụ đã dùng */}
            {costData?.services && costData.services.length > 0 && (
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

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>
          
          {/* Nút bấm giữ lại giao diện gốc của bạn */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
          
          {/* Nút thanh toán chỉ hiển thị khi chưa thanh toán */}
          {!costData?.isPaid && (
            <TouchableOpacity style={styles.closeBtn} onPress={handlePayment}>
                <Text style={styles.closeText}>Thanh toán</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// Giữ nguyên styles gốc của bạn
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
        backgroundColor: "#1E90FF", // Trả lại màu xanh gốc
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