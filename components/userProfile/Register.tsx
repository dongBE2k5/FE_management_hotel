import LoginBanner from './bannerLogin';
import UserRegister from '@/models/UserRegister';
import { register, sendRegisterOtp, verifyRegisterOtp } from '@/service/UserAPI';
import { RootStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Checkbox from 'expo-checkbox';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">;

export default function Register() {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');

  const [agree, setAgree] = useState(false);
  const [userRegister, setUserRegister] = useState<UserRegister>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: ""
  });

  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!userRegister.email) {
      Alert.alert("Lỗi", "Vui lòng nhập email trước!");
      return;
    }
    const res = await sendRegisterOtp(userRegister.email);
    Alert.alert(res.success ? "Thành công" : "Lỗi", res.message);
    if (res.success) setOtpSent(true);
  };

  // Xác thực OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Lỗi", "Vui lòng nhập OTP!");
      return;
    }
    const res = await verifyRegisterOtp(userRegister.email, otp);
    Alert.alert(res.success ? "Thành công" : "Lỗi", res.message);
    if (res.success) setOtpVerified(true);
  };

  // Đăng ký
  const handleRegister = async () => {
    if (!otpSent) {
      Alert.alert("Lỗi", "Vui lòng gửi OTP trước khi đăng ký!");
      return;
    }
    if (!otpVerified) {
      Alert.alert("Lỗi", "Vui lòng xác thực OTP trước khi đăng ký!");
      return;
    }
    if (!agree) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản trước khi đăng ký!");
      return;
    }

    try {
      const res = await register(userRegister);
      if (res.data) {
        Alert.alert("Thành công", "Đăng ký thành công!", [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]);
      } else {
        Alert.alert("Lỗi", res.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Kết nối đến máy chủ thất bại!");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginBanner title="Đăng Ký" subtitle="Tận hưởng các tính năng hoàn chỉnh của travelokaTDC" />

      {/* Form đăng ký */}
      <View style={styles.container}>
        {/* Họ và tên */}
        <View style={styles.label}>
          <Text style={styles.label}>Họ và tên:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#999"
            value={userRegister.fullName}
            onChangeText={text => setUserRegister({ ...userRegister, fullName: text })}
          />
        </View>

        {/* Tên đăng nhập */}
        <View style={styles.label}>
          <Text style={styles.label}>Tên Đăng Nhập:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên đăng nhập"
            placeholderTextColor="#999"
            value={userRegister.username}
            onChangeText={text => setUserRegister({ ...userRegister, username: text })}
          />
        </View>

        {/* Email + OTP */}
        <Text style={styles.label}>Email:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Nhập Email"
            placeholderTextColor="#999"
            value={userRegister.email}
            editable={!otpSent}
            onChangeText={text => setUserRegister({ ...userRegister, email: text })}
            keyboardType="email-address"
          />
          {otpVerified ? (
            <Text style={{ marginLeft: 10, color: 'green', fontWeight: 'bold', fontSize: 18 }}>✔</Text>
          ) : (
            <TouchableOpacity
              style={[styles.otpButton, otpSent && { backgroundColor: '#aaa' }]}
              onPress={handleSendOtp}
              disabled={otpSent}
            >
              <Text style={styles.buttonText}>Gửi OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Nhập OTP nếu đã gửi nhưng chưa xác thực */}
        {otpSent && !otpVerified && (
          <>
            <Text style={styles.label}>OTP:</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
              <Text style={styles.buttonText}>Xác thực OTP</Text>
            </TouchableOpacity>
          </>
        )}

        {/* SĐT */}
        <View style={styles.label}>
          <Text style={styles.label}>SĐT:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#999"
            value={userRegister.phone}
            onChangeText={text => setUserRegister({ ...userRegister, phone: text })}
            keyboardType="phone-pad"
          />
        </View>

        {/* Mật khẩu */}
        <View style={styles.label}>
          <Text style={styles.label}>Mật Khẩu:</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry
            value={userRegister.password}
            onChangeText={text => setUserRegister({ ...userRegister, password: text })}
          />
        </View>

        {/* Checkbox */}
        <View style={styles.agreeContainer}>
          <Checkbox value={agree} onValueChange={setAgree} color={agree ? "#133dc5ff" : undefined} />
          <Text style={styles.agreeText}>Tôi đồng ý với Điều khoản và Chính sách</Text>
        </View>

        {/* Nút đăng ký */}
        <TouchableOpacity
          style={[styles.button, (!agree || !otpVerified) && { backgroundColor: "#aaa" }]}
          disabled={!agree || !otpVerified}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>Đăng Ký</Text>
        </TouchableOpacity>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10, paddingHorizontal: 20 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { borderBottomWidth: 1, borderBottomColor: '#aaa', paddingVertical: 5, fontSize: 16, fontWeight: "bold" },
  button: { marginTop: 10, backgroundColor: '#2400eeff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  agreeContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 10 },
  agreeText: { marginLeft: 8, fontSize: 13, color: "#333" },
  otpButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#2400eeff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

});
