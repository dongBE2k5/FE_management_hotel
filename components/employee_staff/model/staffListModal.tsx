import { connectAndSubscribe, disconnect, fetchInitialRequests, sendRequest } from "@/service/Realtime/WebSocketAPI";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FeedbackModal from "./feedbackmodal"; // 👈 import modal mới


export default function StaffListModal({ visible, onClose, staffList = [], roomId }) {

  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [requests, setRequests] = useState([]);

  const handleCall = async (staff) => {
    try {
      const userIdStr = await AsyncStorage.getItem("userId");
      if (!userIdStr) {
        console.warn("⚠️ Không tìm thấy userId trong AsyncStorage");
        return;
      }

      const userId = Number(userIdStr);

      const requestPayload = {
        senderId: userId,
        receiverId: staff.id,
        content: "Yêu cầu kiểm tra phòng",

      };
      console.log(staff);
      sendRequest(requestPayload, roomId);
      setSelectedStaff(staff);
      setShowFeedback(true); // 👈 mở modal feedback
    } catch (error) {

    }



  };

  useEffect(() => {
    let isMounted = true;

    const setupWebSocket = async () => {
      if (!visible) {
        disconnect();
        return;
      }

      try {
        const userIdStr = await AsyncStorage.getItem("userId");
        if (!userIdStr) {
          console.warn("⚠️ Không tìm thấy userId trong AsyncStorage");
          return;
        }
        const userId = Number(userIdStr);

        // 1. Lấy dữ liệu ban đầu
        const initialRequests = await fetchInitialRequests(userId);
        if (isMounted) setRequests(initialRequests);
        
        // 2. Thiết lập WebSocket
        connectAndSubscribe(userId, {
          onConnected: () => console.log("✅ WebSocket connected from StaffListModal"),
          onDisconnected: () => console.log("❌ WebSocket disconnected from StaffListModal"),
          onError: (error) => console.error("⚠️ WebSocket error:", error),
          onMessageReceived: (newRequest) => {
            console.log("📩 Nhận request realtime:", newRequest);
            if (isMounted) {
              setRequests((prev) => [newRequest, ...prev]);
            }
          },
        });
      } catch (error) {
        console.error("Lỗi thiết lập WebSocket:", error);
      }
    };

    setupWebSocket();

    // Cleanup khi modal đóng hoặc component unmount
    return () => {
      isMounted = false;
      disconnect();
    };
  }, [visible]);

  const renderItem = ({ item }) => {
    // let statusColor = "#000";
    // if (item.status.includes("kiểm tra")) statusColor = "green";
    // else if (item.status.includes("dọn dẹp")) statusColor = "orange";
    // else if (item.status.includes("Hết giờ")) statusColor = "red";
    // else if (item.status.includes("chờ")) statusColor = "blue";

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={18} color="#333" />
          <Text style={styles.label}>Chức vụ </Text>
          <Text style={styles.value}>{item.role}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tên </Text>
          <Text style={[styles.value, { fontWeight: "700" }]}>{item.name}</Text>
        </View>
        {/* 
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái </Text>
          <Text style={[styles.value, { color: statusColor }]}>{item.status}</Text>
        </View> */}

        <View style={styles.row}>
          <Text style={styles.label}>SĐT </Text>
          <Text style={styles.value}>{item.phone}</Text>
        </View>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => handleCall(item)} // 👈 mở feedback modal
        >
          <Ionicons name="call" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Chọn nhân viên kiểm tra phòng</Text>

            <FlatList
              data={staffList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Feedback */}
      <FeedbackModal
        visible={showFeedback}
        staffName={selectedStaff?.name}
        onClose={() => setShowFeedback(false)}
        onCloseAll={() => {
          // 🔹 Đóng luôn cả Feedback và StaffList
          setShowFeedback(false);
          onClose(); // đóng StaffListModal cha
        }}
      />
    </>
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
    maxHeight: "80%",
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    position: "relative",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  label: {
    fontWeight: "500",
    color: "#333",
    width: 90,
  },
  value: {
    flex: 1,
    color: "#000",
  },
  callBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "green",
    padding: 10,
    borderRadius: 50,
    elevation: 3,
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
