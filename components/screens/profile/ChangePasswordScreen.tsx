import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import BannerLogin from "../../userProfile/bannerLogin"; // đường dẫn có thể khác tuỳ bạn

export default function ChangePasswordScreen({ navigation }: any) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    // TODO: gọi API đổi mật khẩu
    Alert.alert("Thành công", "Đổi mật khẩu thành công!");
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <BannerLogin
        title="Đổi mật khẩu"
        subtitle="Hãy nhập mật khẩu cũ và mới để cập nhật"
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu cũ"
           placeholderTextColor="#333"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
           placeholderTextColor="#333"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu mới"
           placeholderTextColor="#333"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
