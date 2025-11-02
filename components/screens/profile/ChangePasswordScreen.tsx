import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal, // Thêm import Modal
} from "react-native";
import BannerLogin from "../../userProfile/bannerLogin";
import { useUser } from '@/context/UserContext';
import { changePassword } from '@/service/UserAPI';

export default function ChangePasswordScreen({ navigation }: any) {
  // ✅ State cho Modal, bắt chước Register.tsx
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user } = useUser();
  const userId = user?.data?.id;

  // ✅ Hàm hiển thị Modal
  const showModal = (message: string, type: 'success' | 'error', autoClose: boolean = true, navigateBack: boolean = false) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);

    if (autoClose) {
      setTimeout(() => {
        setModalVisible(false);
        if (navigateBack) {
          navigation.goBack();
        }
      }, 1500); // 1.5 giây như trong Register.tsx
    }
  };

  const handleChangePassword = async () => {
    // 1. Kiểm tra đầu vào
    if (!oldPassword || !newPassword || !confirmPassword) {
      showModal("Vui lòng nhập đầy đủ thông tin!", 'error', true, false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal("Mật khẩu xác nhận không khớp!", 'error', true, false);
      return;
    }

    if (!userId) {
      showModal("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.", 'error', true, false);
      return;
    }

    // 2. Gọi API
    try {
      const response = await changePassword(userId, oldPassword, newPassword);

      if (response.success) {
        // ✅ THÀNH CÔNG: Sử dụng Modal và tự động chuyển trang
        showModal(response.message || "Đổi mật khẩu thành công!", 'success', true, true);
      } else {
        // ✅ THẤT BẠI: Sử dụng Modal
        showModal(response.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.", 'error', true, false);
      }

    } catch (error: any) {
      // ✅ LỖI KẾT NỐI/SERVER: Sử dụng Modal
      const errorMessage = error.response?.data?.message || "Lỗi kết nối đến máy chủ hoặc mật khẩu cũ không đúng!";
      showModal(errorMessage, 'error', true, false);
      console.error("Change password error:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Banner trên cùng */}
      <BannerLogin
        title="Đổi mật khẩu"
        subtitle="Hãy nhập mật khẩu cũ và mới để cập nhật"
      />

      {/* Các input được chỉnh sửa style theo register.tsx */}
      <View style={styles.container}>
        <Text style={styles.label}>Mật khẩu cũ:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu cũ"
          placeholderTextColor="#999"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Mật khẩu mới:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          placeholderTextColor="#999"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Xác nhận mật khẩu mới:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu mới"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Nút cập nhật */}
      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Cập nhật</Text>
      </TouchableOpacity>

      {/* Modal thông báo */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              // Màu border theo loại thông báo
              { borderColor: modalType === 'success' ? '#28a745' : '#dc3545' },
            ]}
          >
            <Text
              style={[
                styles.modalText,
                // Màu text theo loại thông báo
                { color: modalType === 'success' ? '#28a745' : '#dc3545' },
              ]}
            >
              {modalMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ Container cho mỗi input, bắt chước register.tsx
  container: {
    marginVertical: 10,
    paddingHorizontal: 20
  },
  // ✅ Label trên mỗi input, bắt chước register.tsx
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // ✅ Input gạch chân, bắt chước register.tsx
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 5,
    fontSize: 16,
    fontWeight: "bold",
    // Bỏ border cũ
    // borderWidth: 0,
    // borderRadius: 0,
    // marginBottom: 0,
  },
  // ✅ Nút cập nhật, bắt chước register.tsx
  button: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#2400eeff', // Xanh tím đậm (màu của register.tsx)
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Styles cho Modal (Copy từ register.tsx)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '75%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
});