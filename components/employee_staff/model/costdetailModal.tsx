import { initiatePayment } from "@/components/payment/PaymentButton";
import { urlImage } from "@/constants/BaseURL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PaymentAPI from "../../../service/Payment/PaymentAPI";
import PaymentBankScreen from "@/components/payment/PaymentBankScreen";
import { EmployeeStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { ro } from "date-fns/locale";


const formatCurrency = (value) => {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// ✨ 1. ĐỊNH NGHĨA CÁC PHƯƠNG THỨC THANH TOÁN
const PaymentMethods = {
  VNPAY: "VNPAY",
  BANK: "BANK",
  CASH: "CASH", // Đổi từ MANUAL thành CASH
};

export default function CostDetailModal({
  visible,
  onClose,
  costData,
  onManualPayment, // onManualPayment được giữ lại để dùng cho CASH
}) {
  console.log("tiền", costData);

  if (!costData || Object.keys(costData).length === 0) {
    // (Modal "Không có thông tin" giữ nguyên)
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
            <Text style={{ textAlign: "center", marginVertical: 10 }}>
              Không thể tính toán chi phí. Vui lòng kiểm tra lại thông tin đặt
              phòng hoặc yêu cầu check-in.
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // (Phần tính toán giữ nguyên)
  const roomPrice = costData?.roomDetails?.price ?? 0;
  const servicesTotal =
    costData?.services?.reduce(
      (sum, s) => sum + (s.price ?? 0) * (s.quantity ?? 1),
      0
    ) ?? 0;
  const damagedItemsTotal =
    costData?.damagedItems?.reduce(
      (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
      0
    ) ?? 0;

  const totalAmount = roomPrice + servicesTotal + damagedItemsTotal;

  // (Logic xác định số tiền thanh toán giữ nguyên)
  const isPaid = costData?.isPaid ?? false;
  const hasDamages = damagedItemsTotal > 0;
  const amountToPay = !isPaid ? totalAmount : hasDamages ? damagedItemsTotal : 0;
  // const amountToPay = 100000;
  const showPaymentButtons = !isPaid;
  console.log(showPaymentButtons);
  const [showModalBank, setShowModalBank] = useState(false);
  const [urlPay, setUrlpay] = useState();
 
    const navigation = useNavigation<EmployeeStackParamList>();
  // ✨ 2. HÀM THANH TOÁN TỔNG HỢP (Thay thế 2 hàm cũ)
  const handlePayment = async (paymentMethod) => {
    try {
      const hotelIdStr = await AsyncStorage.getItem('hotelID');
      const hotelId = hotelIdStr ? Number(hotelIdStr) : null;

      // 1. Validation chung
      if (!costData?.bookingId || amountToPay <= 0) {
        Alert.alert("Lỗi", "Không đủ thông tin hoặc tổng tiền không hợp lệ.");
        return;
      }

      let url;
 
      // 2. Chia logic theo paymentMethod
      switch (paymentMethod) {
        // --- Case Online (VNPAY, BANK) ---
        case PaymentMethods.VNPAY:
        case PaymentMethods.BANK:
          url = await  initiatePayment(
            amountToPay,
            paymentMethod, // Gửi "VNPAY" hoặc "BANK"
            costData.bookingId,
            hotelId
          );
          setUrlpay(url)
          if (paymentMethod === "VNPAY") {


            if (url) {
              navigation.navigate("PaymentWebView", { url });
            }

          }
          else if (paymentMethod === "BANK") {

            if (url) {

              setShowModalBank(true)
            }
          }

          break;

        // --- Case Manual (CASH) ---
        case PaymentMethods.CASH:
          // Sử dụng hàm createPaymentMumanual như code cũ
          url = await PaymentAPI.createPaymentMumanual(
            amountToPay,
            PaymentMethods.CASH, // Gửi "CASH" (thay vì "MANUAL")
            costData.bookingId
          );

          if (url) {
            if (onManualPayment) {
              // onManualPayment(); // Gọi hàm xác nhận checkout (nếu có)
            } else {
              Alert.alert("Thành công", "Đã ghi nhận thanh toán tiền mặt.");
            }
            onClose(); // Đóng modal
          } else {
            Alert.alert("Lỗi", "Không thể tạo thanh toán tiền mặt.");
          }
          break;

        // --- Case mặc định ---
        default:
          Alert.alert("Lỗi", "Phương thức thanh toán không hợp lệ.");
      }
    } catch (error) {
      console.error(`Lỗi khi thanh toán [${paymentMethod}]:`, error);
      Alert.alert("Lỗi", `Đã xảy ra sự cố khi thanh toán [${paymentMethod}].`);
    }
  };

  /*
  // (Hai hàm cũ đã bị xoá và gộp thành handlePayment ở trên)
  // const handlePayment = async () => { ... };
  // const handleManualPayment = async () => { ... };
  */

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

          {/* (Phần ScrollView Tiền phòng, Dịch vụ, Đền bù giữ nguyên) */}
          <ScrollView style={{ maxHeight: 400 }}>
            {/* Tiền phòng */}
            {costData.roomDetails && (
              <>
                <Text style={styles.sectionTitle}>Tiền phòng</Text>
                <View style={styles.rowBetween}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.bold}>{costData.roomDetails.name}</Text>
                    {costData.roomDetails.description ? (
                      <Text style={styles.subText}>
                        {costData.roomDetails.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.price}>{formatCurrency(roomPrice)}</Text>
                </View>
              </>
            )}

            {/* Dịch vụ */}
            {Array.isArray(costData.services) &&
              costData.services.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Dịch vụ đã dùng</Text>
                  {costData.services.map((service, i) => (
                    <View style={styles.rowBetween} key={`service-${i}`}>
                      <View style={styles.itemDetails}>
                        <View style={styles.itemNameRow}>
                          <Text style={styles.bold}>{service.name}</Text>
                          {(service.quantity ?? 0) > 0 && (
                            <Text style={styles.quantityText}>
                              {" "}
                              (x{service.quantity})
                            </Text>
                          )}
                        </View>
                        {service.description ? (
                          <Text style={styles.subText}>
                            {service.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={styles.price}>
                        {formatCurrency(
                          (service.price ?? 0) * (service.quantity ?? 1)
                        )}
                      </Text>
                    </View>
                  ))}
                </>
              )}

            {/* Vật dụng đền bù */}
            {Array.isArray(costData.damagedItems) &&
              costData.damagedItems.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Vật dụng đền bù</Text>
                  {costData.damagedItems.map((item, i) => (
                    <View style={styles.rowBetween} key={`damage-${i}`}>
                      <View style={styles.itemDetails}>
                        <View style={styles.itemNameRow}>
                          <Text style={styles.bold}>{item.name}</Text>
                          {(item.quantity ?? 0) > 0 && (
                            <Text style={styles.quantityText}>
                              {" "}
                              (x{item.quantity})
                            </Text>
                          )}
                        </View>
                        {item.description ? (
                          <Text style={styles.subText}>
                            {item.description}
                          </Text>
                        ) : null}
                        {/* Hiển thị ảnh nếu có */}
                        {item.image && (
                          <>
                            {console.log("Ảnh:", `${urlImage}${item.image}`)}
                            <Image
                              source={{ uri: `${urlImage}${item.image}` }}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          </>
                        )}
                      </View>
                      <Text style={[styles.price, { color: "red" }]}>
                        {formatCurrency(
                          (item.price ?? 0) * (item.quantity ?? 1)
                        )}
                      </Text>
                    </View>
                  ))}
                </>
              )}
          </ScrollView>

          <View style={styles.divider} />

          {/* (Tổng cộng giữ nguyên) */}
          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>

          {/* Nút Đóng (luôn hiển thị) */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>

          {/* ✨ 3. CẬP NHẬT KHỐI THANH TOÁN */}
          {showPaymentButtons && (
            <>
              {/* Nút 1: Thanh toán VNPAY */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#28a745" }]}
                onPress={() => handlePayment(PaymentMethods.VNPAY)} // 👈 SỬA
              >
                <Text style={styles.closeText}>
                  Thanh toán VNPAY {formatCurrency(amountToPay)}
                </Text>
              </TouchableOpacity>

              {/* Nút 2: Thanh toán BANK (Nút mới) */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#17a2b8" }]} // Màu khác
                onPress={() => handlePayment(PaymentMethods.BANK)} // 👈 SỬA
              >
                <Text style={styles.closeText}>
                  Thanh toán BANK {formatCurrency(amountToPay)}
                </Text>
              </TouchableOpacity>

              {/* Nút 3: Thanh toán Tiền mặt (CASH) */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#007BFF" }]}
                onPress={() => handlePayment(PaymentMethods.CASH)} // 👈 SỬA
              >
                <Text style={styles.closeText}>Xác nhận (Thanh toán tiền mặt)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <PaymentBankScreen
                visible={showModalBank}
                route={urlPay}
                onClose={() => setShowModalBank(false)}
              />
    </Modal>
    
  );
}

// (Styles giữ nguyên)
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
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
  },
  bold: {
    fontWeight: "600",
  },
  quantityText: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
  },
  subText: {
    color: "#666",
    fontSize: 12,
    flexShrink: 1,
  },
  price: {
    color: "green",
    fontWeight: "600",
    marginLeft: 8,
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
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  paymentBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5", // fallback màu nền khi chưa load
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});