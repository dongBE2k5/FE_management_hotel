import PaymentBankScreen from "@/components/payment/PaymentBankScreen";
import { initiatePayment } from "@/components/payment/PaymentButton";
import { urlImage } from "@/constants/BaseURL";
import { EmployeeStackParamList } from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react"; // Thêm useEffect nếu cần, hiện tại dùng logic trực tiếp
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

const formatCurrency = (value) => {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// 1. ĐỊNH NGHĨA CÁC PHƯƠNG THỨC THANH TOÁN
const PaymentMethods = {
  VNPAY: "VNPAY",
  BANK: "BANK",
  CASH: "CASH",
};

export default function CostDetailModal({
  visible,
  onClose,
  costData,
  onManualPayment,
}) {
  console.log("tiền", costData);

  if (!costData || Object.keys(costData).length === 0) {
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

  // Tính toán chi phí
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

  const isPaid = costData?.isPaid ?? false;
  const hasDamages = damagedItemsTotal > 0;
  const amountToPay = !isPaid ? totalAmount : hasDamages ? damagedItemsTotal : 0;
  const showPaymentButtons = !isPaid;

  const [showModalBank, setShowModalBank] = useState(false);
  const [urlPay, setUrlpay] = useState(); // Dùng để truyền vào WebView hoặc Modal Bank
  const navigation = useNavigation<EmployeeStackParamList>();

  // ✨ STATE MỚI: Cache URL và lưu số tiền lần cuối tạo URL
  const [paymentCache, setPaymentCache] = useState({
    VNPAY: null,
    BANK: null,
    lastAmount: 0, // Lưu số tiền lúc tạo link
  });

  // ✨ 2. HÀM XỬ LÝ THANH TOÁN
  const handlePayment = async (paymentMethod) => {
    try {
      const hotelIdStr = await AsyncStorage.getItem("hotelID");
      const hotelId = hotelIdStr ? Number(hotelIdStr) : null;
      if (!hotelId) {
        Alert.alert("Lỗi", "Không tìm thấy hotelID. Vui lòng kiểm tra HostProvider.");
        return;
      }
      
      if (!costData?.bookingId || amountToPay <= 0) {
        Alert.alert("Lỗi", "Không đủ thông tin hoặc tổng tiền không hợp lệ.");
        return;
      }

      let url = null;

      switch (paymentMethod) {
        // --- Case Online (VNPAY, BANK) ---
        case PaymentMethods.VNPAY:
        case PaymentMethods.BANK:
          
          // ✨ LOGIC CACHE:
          // Kiểm tra xem số tiền có thay đổi không hoặc URL method đó đã có chưa
          const isAmountChanged = amountToPay !== paymentCache.lastAmount;
          const cachedUrl = paymentCache[paymentMethod];

          if (!isAmountChanged && cachedUrl) {
            // CASE 1: Tiền không đổi và đã có URL -> Dùng lại URL cũ
            console.log(`Using cached URL for ${paymentMethod}`);
            url = cachedUrl;
          } else {
            // CASE 2: Tiền đổi HOẶC chưa có URL -> Gọi API tạo mới
            console.log(`Creating new URL for ${paymentMethod}. Amount changed: ${isAmountChanged}`);
            
            url = await initiatePayment(
              amountToPay,
              paymentMethod,
              costData.bookingId,
              hotelId
            );

            // Lưu vào state cache nếu tạo thành công
            if (url) {
              setPaymentCache((prev) => ({
                ...prev,
                // Nếu tiền đổi thì reset cả 2 URL, nếu không thì chỉ update method hiện tại
                VNPAY: isAmountChanged ? (paymentMethod === "VNPAY" ? url : null) : (paymentMethod === "VNPAY" ? url : prev.VNPAY),
                BANK: isAmountChanged ? (paymentMethod === "BANK" ? url : null) : (paymentMethod === "BANK" ? url : prev.BANK),
                lastAmount: amountToPay,
              }));
            }
          }

          // Xử lý điều hướng sau khi có URL
          setUrlpay(url);

          if (paymentMethod === "VNPAY") {
            if (url) {
              navigation.navigate("PaymentWebView", { url });
            }
          } else if (paymentMethod === "BANK") {
            if (url) {
              setShowModalBank(true);
            }
          }
          break;

        // --- Case Manual (CASH) ---
        case PaymentMethods.CASH:
          url = await PaymentAPI.createPaymentMumanual(
            amountToPay,
            PaymentMethods.CASH,
            costData.bookingId
          );

          if (url) {
            if (onManualPayment) {
               // onManualPayment();
            } else {
              Alert.alert("Thành công", "Đã ghi nhận thanh toán tiền mặt.");
            }
            onClose();
          } else {
            Alert.alert("Lỗi", "Không thể tạo thanh toán tiền mặt.");
          }
          break;

        default:
          Alert.alert("Lỗi", "Phương thức thanh toán không hợp lệ.");
      }
    } catch (error) {
      console.error(`Lỗi khi thanh toán [${paymentMethod}]:`, error);
      Alert.alert("Lỗi", `Đã xảy ra sự cố khi thanh toán [${paymentMethod}].`);
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
                        {item.image && (
                          <Image
                            source={{ uri: `${urlImage}${item.image}` }}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
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

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalPrice}>{formatCurrency(totalAmount)}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>

          {showPaymentButtons && (
            <>
              {/* Nút 1: Thanh toán VNPAY */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#28a745" }]}
                onPress={() => handlePayment(PaymentMethods.VNPAY)}
              >
                <Text style={styles.closeText}>
                  Thanh toán VNPAY {formatCurrency(amountToPay)}
                </Text>
              </TouchableOpacity>

              {/* Nút 2: Thanh toán BANK */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#17a2b8" }]}
                onPress={() => handlePayment(PaymentMethods.BANK)}
              >
                <Text style={styles.closeText}>
                  Thanh toán BANK {formatCurrency(amountToPay)}
                </Text>
              </TouchableOpacity>

              {/* Nút 3: Thanh toán Tiền mặt */}
              <TouchableOpacity
                style={[styles.paymentBtn, { backgroundColor: "#007BFF" }]}
                onPress={() => handlePayment(PaymentMethods.CASH)}
              >
                <Text style={styles.closeText}>
                  Xác nhận (Thanh toán tiền mặt)
                </Text>
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
    backgroundColor: "#f5f5f5",
  },
});