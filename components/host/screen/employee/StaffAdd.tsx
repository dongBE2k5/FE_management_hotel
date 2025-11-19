import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { registerEmployee } from "@/service/Employee_RegisterAPI"; // import API thật
import { useHost } from "@/context/HostContext";

export default function ListStaffHotelModal({ visible, setVisible, onSubmit }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    phone: "",
    cccd: "",
    roleName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // trạng thái loading
  const { hotelId } = useHost();
  console.log("Hotel Id" + hotelId);

  useEffect(() => {
    if (visible) {
      setForm({
        username: "",
        password: "",
        email: "",
        fullName: "",
        phone: "",
        cccd: "",
        roleName: "",
      });
    }
  }, [visible]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation cơ bản (giữ nguyên)
    if (
      !form.username ||
      !form.password ||
      !form.email ||
      !form.fullName ||
      !form.phone ||
      !form.cccd ||
      !form.roleName
    ) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // --- BẮT ĐẦU CHỈNH SỬA ---
    // Thêm kiểm tra "phòng vệ" để đảm bảo hotelId là một con số hợp lệ
    // Đây chính là nguyên nhân gây ra lỗi 500 khi hotelId là "null"
    if (!hotelId || typeof hotelId !== 'number') {
      Alert.alert(
        "⚠️ Lỗi hệ thống",
        "Không tìm thấy ID khách sạn (hotelId). Vui lòng thử đăng nhập lại hoặc tải lại ứng dụng."
      );
      console.error(
        "❌ Lỗi nghiêm trọng: hotelId từ useHost() không hợp lệ. Giá trị hiện tại:",
        hotelId
      );
      return; // Dừng hàm lại, không cho gọi API
    }
    // --- KẾT THÚC CHỈNH SỬA ---

    try {
      setIsSubmitting(true);

      // const hotelId = 1; // 👈 dòng này không cần thiết vì đã lấy từ useHost()

      // Bây giờ, chúng ta đã chắc chắn `hotelId` là một con số trước khi gửi đi
      const response = await registerEmployee(form, hotelId);

      if (response.data) {
        Alert.alert("✅ Thành công", response.message);
        // Gửi dữ liệu lên component cha nếu onSubmit có
        if (onSubmit) onSubmit(response.data);
        setVisible(false); // đóng modal sau khi thành công
      } else {
        Alert.alert("⚠️ Lỗi", response.message || "Không xác định");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi dữ liệu:", error);
      Alert.alert("❌ Lỗi", "Không thể kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Thêm nhân viên</Text>

          {renderInput("Username", form.username, (v) =>
            handleChange("username", v)
          )}
          {renderInput("Password", form.password, (v) =>
            handleChange("password", v), true
          )}
          {renderInput("Email", form.email, (v) => handleChange("email", v))}
          {renderInput("Họ và tên", form.fullName, (v) =>
            handleChange("fullName", v)
          )}
          {renderInput("Số điện thoại", form.phone, (v) =>
            handleChange("phone", v)
          )}
          {renderInput("CCCD", form.cccd, (v) => handleChange("cccd", v))}

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.roleName}
              onValueChange={(v) => handleChange("roleName", v)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn vai trò" value="" />
              <Picker.Item label="Lễ Tân" value="ROLE_EMPLOYEE" />
              <Picker.Item label="Nhân Viên Dọn Dẹp" value="ROLE_CLEANING" />
            </Picker>
          </View>

          {isSubmitting && (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginBottom: 10 }} />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={() => setVisible(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.saveText}>{isSubmitting ? "Đang gửi..." : "Lưu"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const renderInput = (placeholder, value, onChange, secure) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChange}
    secureTextEntry={secure}
  />
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    height: 50,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: "#3b82f6",
    marginLeft: 8,
  },
  cancelText: {
    fontWeight: "bold",
    color: "#374151",
  },
  saveText: {
    fontWeight: "bold",
    color: "#fff",
  },
});