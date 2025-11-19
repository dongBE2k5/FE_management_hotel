import { urlImage } from "@/constants/BaseURL";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

// 🔹 Hàm helper (Giữ nguyên)
const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    return "0 ₫";
  }
  return `${value.toLocaleString("vi-VN")} ₫`;
};

export default function DamageConfirmModal({
  visible,
  onClose,
  onBackToFeedback,
  onBackToConstdetailmodal,
  damagedItems = [],
  usedServices = [], // 👈 SỬA: Nhận mảng, mặc định là []
}) {
  console.log("dịch vụ", damagedItems, usedServices);

  // 👈 SỬA: Tính toán lại, bao gồm cả dịch vụ
  const { totalDamages, totalServices, servicesList } = React.useMemo(() => {
    const damages = damagedItems || [];
    // 👈 SỬA: 'usedServices' giờ là mảng (servicesData)
    const servicesData = usedServices || [];

    const totalDamages = damages.reduce((acc, item) => {
      const quantity = Number(item.quantityAffected) || 0;
      const price = Number(item.price) || 0;
      return acc + (price * quantity);
    }, 0);

    const totalServices = servicesData.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return acc + (price * quantity);
    }, 0);

    return {
      totalDamages,
      totalServices,
      servicesList: servicesData, // Trả về mảng dịch vụ
    };
  }, [damagedItems, usedServices]); // 👈 'usedServices' là dependency

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Xác nhận chi phí phát sinh</Text>

              {/* 👈 SỬA: Cập nhật hộp cảnh báo */}
              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={22} color="#E6A23C" />
                <Text style={styles.warningText}>
                  Nhân viên đã báo cáo:
                  {totalDamages > 0 && (
                    <Text>
                      {"\n"}• Hư hỏng/Thiếu: <Text style={styles.boldRed}>{formatCurrency(totalDamages)}</Text>
                    </Text>
                  )}
                  {totalServices > 0 && (
                    <Text>
                      {"\n"}• Dịch vụ đã dùng: <Text style={styles.boldRed}>{formatCurrency(totalServices)}</Text>
                    </Text>
                  )}
                  {(totalDamages === 0 && totalServices === 0) && " Không có chi phí phát sinh."}
                </Text>
              </View>

              <ScrollView style={styles.listContainer}>
                {/* 👈 SỬA: Danh sách 1 - Vật dụng hỏng */}
                {damagedItems.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Vật dụng đền bù</Text>
                    {damagedItems.map((item, index) => (
                      <View key={`damage-${item.id || index}`}>
                        <View style={styles.item}>
                          <Text style={styles.itemName}>{item.itemName}</Text>
                          <Text style={styles.itemPrice}>
                            {formatCurrency(item.price * item.quantityAffected)}
                          </Text>
                        </View>
                        <Text style={styles.subText}>
                          {`${formatCurrency(item.price)} × ${item.quantityAffected}`}
                        </Text>
                        {/* 👇 Hiển thị ảnh nếu có */}
                        {item.image && (
                          <>
                            {console.log("Ảnh:", item.image)}
                            <Image
                              source={{ uri: `${urlImage}${item.image}` }}
                              style={styles.itemImage}
                              resizeMode="cover"
                            />
                          </>
                        )}
      
                          
                  
                        {index < damagedItems.length - 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    ))}
                  </>
                )}

                {/* 👈 THÊM MỚI: Danh sách 2 - Dịch vụ đã dùng */}
                {servicesList.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Dịch vụ đã dùng</Text>
                    {/* Logic render này đã đúng, không cần sửa */}
                    {servicesList.map((item, index) => (
                      <View key={`service-${item.utilityId || index}`}>
                        <View style={styles.item}>
                          <Text style={styles.itemName}>{item.utilityName}</Text>
                          <Text style={styles.itemPrice}>
                            {formatCurrency(item.price * item.quantity)}
                          </Text>
                        </View>
                        <Text style={styles.subText}>
                          {`${formatCurrency(item.price)} × ${item.quantity}`}
                        </Text>
                        {index < servicesList.length - 1 && (
                          <View style={styles.divider} />
                        )}
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#2ecc71" }]}
                  onPress={onBackToFeedback}
                >
                  <Text style={styles.btnText}>Yêu cầu kiểm tra lại</Text>
                </TouchableOpacity>

                {/* Nút xác nhận (Giữ nguyên logic) */}
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007BFF" }]}
                  onPress={() => {
                    // Vẫn chỉ truyền damagedItems,
                    // vì FeedbackModal đã có usedServices trong state của nó
                    onBackToConstdetailmodal?.(damagedItems,true);
                  }}
                >
                  <Text style={styles.btnText}>Xác nhận & Thêm vào hóa đơn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// (Styles giữ nguyên, thêm sectionTitle)
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    maxHeight: "80%",
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdf6ec", // 👈 SỬA: Màu vàng nhạt
    borderColor: "#E6A23C", // 👈 SỬA: Viền vàng
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: "#333",
  },
  bold: {
    fontWeight: "600",
  },
  boldRed: {
    fontWeight: "700",
    color: "red",
  },
  listContainer: {
    maxHeight: 300, // 👈 Tăng chiều cao 
    marginBottom: 10,
  },
  // 👈 THÊM MỚI
  sectionTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: {
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontWeight: "600",
    color: "#000",
  },
  subText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
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