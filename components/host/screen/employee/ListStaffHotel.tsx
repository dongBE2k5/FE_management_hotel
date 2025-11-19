import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert, // Giữ lại Alert để phòng trường hợp cập nhật UI bị lỗi
} from "react-native";

import ListStaffHotelModal from "./StaffAdd";
import { getEmployeeByHotel } from "@/service/EmpoyeeAPI";
import { useHost } from "@/context/HostContext";



export default function StaffListHotel() {
  const [modalVisible, setModalVisible] = useState(false);
  // ✅ Dữ liệu mẫu đã được thêm
  const [staffList, setStaffList] = useState([
    
    
  ]);
  const { hotelId } = useHost();

  useEffect(() => {
    const fetchStaffList = async () => {
      // Giữ nguyên chỗ này để sau có thể gọi API lấy danh sách nhân viên
      // Ví dụ:
      const data = await getEmployeeByHotel(Number(hotelId));
      console.log("Danh sách nhân viên từ API:", data);
      setStaffList(data);

    };
    
    fetchStaffList();

  }, [hotelId, modalVisible]);


  const handleAddStaff = (newStaffFromServer) => {
    console.log("✅ Dữ liệu nhận từ Modal (đã có ID thật):", newStaffFromServer);
    try {
      
   handleReload();

    } catch (error) {
      console.error("❌ Lỗi khi cập nhật UI danh sách nhân viên:", error);
      Alert.alert("Lỗi Giao Diện", "Không thể cập nhật danh sách nhân viên trên màn hình.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách nhân viên</Text>

      <FlatList
        data={staffList}
       keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.user?.fullName}</Text>
            <Text style={styles.account}>Tài Khoản : {item.user?.username}</Text>
            {/* Mật khẩu thường sẽ không hiển thị ở đây vì lý do bảo mật */}
            {/* <Text style={styles.account}>Mật Khẩu : {item.password}</Text> */}

            <Text style={styles.role}> Chức Vụ : {item.user?.role.name === 'ROLE_EMPLOYEE' ? 'Lễ Tân' : 'Nhân Viên Dọn Dẹp'}</Text>
            <Text style={styles.subText}>📞 {item.user?.phone}</Text>
            <Text style={styles.subText}>✉️ {item.user?.email}</Text>
            <Text style={styles.subText}>CCCD: {item.user?.cccd}</Text>
          </View>
        )}
      />

      {/* Nút "Thêm nhân viên" */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addBtnText}> Thêm nhân viên</Text>
      </TouchableOpacity>

      {
      }



      <ListStaffHotelModal
        visible={modalVisible}
        setVisible={setModalVisible}
        onSubmit={handleAddStaff}
      />
    </View>
  );
}

// --------------------
// ✅ Giữ nguyên CSS
// --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  item: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  account: { fontSize: 14, color: "#333", marginTop: 4 },
  role: { color: "#555", marginTop: 4, marginBottom: 6 },
  subText: { fontSize: 13, color: "#666" },
  addBtn: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },
});