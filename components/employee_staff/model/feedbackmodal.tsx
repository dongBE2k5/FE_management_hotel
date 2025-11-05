import { getRoomItemsByResquset } from "@/service/RoomItemAPI";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CostDetailModal from "./costdetailModal";
import DamageConfirmModal from './dameconfirmmodal';

export default function FeedbackModal({
  visible,
  onClose,
  onCloseAll,
  staffName = "Nguyễn Văn B",
  roomNumber = "P.???", // 👈 Nhận từ prop
  activeRequest,      // 👈 NHẬN PROP MỚI
}) {
  // THÊM STATE MỚI:
  const [isLoadingItems, setIsLoadingItems] = useState(false); // Dùng khi tải item hỏng
  const [damagedItems, setDamagedItems] = useState([]);       // Dùng để lưu item hỏng

  const [showCostModal, setShowCostModal] = useState(false);
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [tempCostData, setTempCostData] = useState(null);

  // Interface cho data (bạn đã cung cấp)
  // interface DamagedItemResponse {
  //     requestStaffId: number;
  //     id: number;
  //     ...
  // }

  // ✨ THÊM useEffect MỚI: Lắng nghe 'visible' và 'activeRequest'
  useEffect(() => {
    const handleRequestResponse = async () => {
      // 1. Modal hiển thị VÀ đã nhận được phản hồi
      if (activeRequest) {
        // Kiểm tra status theo logic của bạn
        if (activeRequest.status === "HAS_ISSUE") {
          setIsLoadingItems(true); // Bắt đầu tải chi tiết
          try {
            // GỌI API THẬT NHƯ YÊU CẦU CỦA BẠN
            const items = await getRoomItemsByResquset(activeRequest.id);
            setDamagedItems(items);
          } catch (error) {
            console.error("Lỗi khi tải vật dụng hư hỏng:", error);
            setDamagedItems([]); // Xử lý lỗi
          } finally {
            setIsLoadingItems(false); // Tải xong chi tiết
          }
        } else {
          // Trường hợp 'NO_ISSUE' hoặc 'RECEIVED'
          setDamagedItems([]);
          setIsLoadingItems(false);
        }
      }
      // 2. Modal hiển thị NHƯNG CHƯA nhận được phản hồi
      else if (visible) {
        setIsLoadingItems(false); // Chưa cần tải item
        setDamagedItems([]); // Reset data cũ
      }
    };

    if (visible) {
      handleRequestResponse();
    }
  }, [visible, activeRequest]); // 👈 Kích hoạt khi activeRequest thay đổi

  const shouldShowMainModal = visible && !showCostModal && !showDamageModal;

  // HÀM RENDER NỘI DUNG CHÍNH CỦA MODAL
  const renderModalContent = () => {
    // 1. CHƯA CÓ PHẢN HỒI (đang chờ WebSocket)
    if (!activeRequest) {
      return (
        <>
          <Text style={styles.header}>Hộp thư phản hồi</Text>
          <ActivityIndicator
            size="large"
            color="#000"
            style={{ marginVertical: 16 }}
          />
          <Text style={styles.waitText}>
            Đang chờ phản hồi từ{" "}
            <Text style={{ fontWeight: "700" }}>{staffName}</Text>...
          </Text>
        </>
      );
    }

    // 2. MỚI: ĐÃ NHẬN YÊU CẦU (nhưng chưa xử lý xong)
    if (activeRequest.status === "RECEIVED") {
      return (
        <>
          <Text style={styles.header}>Đã nhận thông tin</Text>
          {/* Bạn có thể dùng icon khác nếu muốn */}
          <Ionicons name="person-outline" size={40} color="#0062E0" style={{ marginVertical: 16 }} />
          <Text style={styles.waitText}>
            <Text style={styles.bold}>{staffName}</Text> đã nhận được yêu cầu
            và đang tiến hành kiểm tra phòng <Text style={styles.bold}>{roomNumber}</Text>...
          </Text>
        </>
      );
    }

    // 3. CÓ PHẢN HỒI: NO_ISSUE (Thành công)
    if (activeRequest.status === "NO_ISSUE") {
      return (
        <TouchableOpacity
          style={[styles.resultBox, { borderColor: "green" }]}
          activeOpacity={0.7}
          onPress={() => setShowCostModal(true)}
        >
          <View style={[styles.row, { alignItems: "flex-start" }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color="green" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng <Text style={styles.bold}>{roomNumber}</Text>
              </Text>
              <Text style={[styles.bold, { color: "green", marginTop: 4 }]}>
                Phòng tốt, sẵn sàng check-out
              </Text>
              {/* Bạn có thể dùng thời gian từ activeRequest.reportedAt */}
              <Text style={styles.time}>{new Date(activeRequest.reportedAt).toLocaleTimeString()}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // 4. CÓ PHẢN HỒI: HAS_ISSUE (Thất bại / Có vấn đề)
    if (activeRequest.status === "HAS_ISSUE") {
      // 4.1. Đang tải chi tiết vật dụng hỏng
      if (isLoadingItems) {
        return (
          <>
            <Text style={styles.header}>Phát hiện vấn đề</Text>
            <ActivityIndicator
              size="large"
              color="#cc0000"
              style={{ marginVertical: 16 }}
            />
            <Text style={styles.waitText}>
              Đang tải chi tiết hư hỏng từ {staffName}...
            </Text>
          </>
        );
      }
      
      // 4.2. Đã tải xong chi tiết
      return (
        <TouchableOpacity
          style={[styles.resultBox, { borderColor: "red" }]}
          activeOpacity={0.7}
          onPress={() => setShowDamageModal(true)}
        >
          <View style={[styles.row, { alignItems: "flex-start" }]}>
            <Ionicons name="close-circle-outline" size={22} color="red" />
            <View style={{ marginLeft: 8, flex: 1 }}>
               <Text style={{ flexWrap: "wrap", flexShrink: 1 }}>
                Phản hồi từ <Text style={styles.bold}>{staffName}</Text> về phòng <Text style={styles.bold}>{roomNumber}</Text>
               </Text>
              <Text style={[styles.bold, { color: "red", marginTop: 4 }]}>
                Phòng có vấn đề! Vui lòng xem chi tiết
              </Text>
              {/* Bạn có thể dùng thời gian từ activeRequest.reportedAt */}
              <Text style={styles.time}>{new Date(activeRequest.reportedAt).toLocaleTimeString()}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    // Trường hợp dự phòng (nếu status không khớp)
    return <Text>Trạng thái không xác định: {activeRequest.status}</Text>;
  };

  return (
    <>
      {/* 🔲 Modal chính */}
      <Modal
        visible={shouldShowMainModal}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalBox}>
                {renderModalContent()}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 🧾 Modal chi phí */}
      <CostDetailModal
        visible={showCostModal}
        onClose={() => setShowCostModal(false)}
        costData={tempCostData} 
        onBackToConstdetailmodal={() => {
          // Đóng modal hiện tại (nếu có)
          setShowDamageModal(false);
          setShowCostModal(false);

          // Mở lại CostDetailModal sau 200ms để tránh chồng modal
          setTimeout(() => {
            setShowCostModal(true);
          }, 200);
        }}
      />

      {/* 💥 Modal đền bù */}
      <DamageConfirmModal
        visible={showDamageModal}
        damagedItems={damagedItems} // 👈 TRUYỀN DATA HƯ HỎNG VÀO ĐÂY
        onClose={() => {
          setShowDamageModal(false);
          setShowCostModal(false);
          // setResult(null); // Không còn dùng state này
          // setLoading(false); // Không còn dùng state này
          onClose(); // 🔹 Đóng FeedbackModal
        }}
        onBackToFeedback={() => {
          setShowDamageModal(false);
          // Không cần làm gì phức tạp, vì activeRequest vẫn là "HAS_ISSUE"
          // Logic renderModalContent() sẽ tự động hiển thị lại
        }}
        onBackToConstdetailmodal={(costDataFromDamage) => {
          // 🔹 Đóng toàn bộ FeedbackModal
          onClose();
          onCloseAll?.();
            console.log(costDataFromDamage);
            
            
              setTempCostData(costDataFromDamage);
              
          
          // 🔹 Mở lại CostDetailModal sau khi đóng xong FeedbackModal
          setTimeout(() => {
            setShowCostModal(true);
          }, 200);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  header: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
  },
  waitText: {
    textAlign: "center",
    color: "#333",
  },
  resultBox: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    width: "100%",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start", // Đổi thành flex-start để icon căn lề đúng
    flexWrap: "wrap", 
  },
  bold: {
    fontWeight: "600",
  },
  time: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
  },
});