import LoginBanner from '@/components/bannerLogin';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';


export default function Register() {
  const [agree, setAgree] = useState(false); // ✅ state lưu trạng thái tick vào checkbox

  // Ô nhập tên đăng nhập
  const RegisterInput = () => (
    <View style={styles.container}>
      <Text style={styles.label}>Tên Đăng Nhập:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên đăng nhập"
        placeholderTextColor="#999"
      />
    </View>
  );

  // Ô nhập email
  const EmailInput = () => (
    <View style={styles.container}>
      <Text style={styles.label}>Nhập Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập Email"
        placeholderTextColor="#999"
      />
    </View>
  );

  // Ô nhập mật khẩu
  const PassInput = () => (
    <View style={styles.container}>
      <Text style={styles.label}>Mật Khẩu:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        placeholderTextColor="#999"
        secureTextEntry={true} // ✅ ẩn ký tự khi nhập mật khẩu
      />
    </View>
  );

  // Ô nhập lại mật khẩu + text chính sách
  const PassInputAgain = () => (
    <View style={styles.container}>
      <Text style={styles.label}> Nhập Lại Mật Khẩu:</Text>
      <TextInput
        style={styles.input}
        placeholder=" Vui lòng nhập lại mật khẩu"
        placeholderTextColor="#999"
        secureTextEntry={true}
      />
      <Text style={styles.infoText}>
        Bằng cách tiếp tục, bạn đồng ý với Điều khoản và Điều kiện này và bạn đã được thông báo về Chính sách bảo vệ dữ liệu của chúng tôi
      </Text>
    </View>
  );

  // ✅ Checkbox điều khoản
  const AgreeButton = () => (
    <View style={styles.agreeContainer}>
      {/* Khi tick thì setAgree(true) */}
      <Checkbox 
        value={agree} 
        onValueChange={setAgree} 
        color={agree ? "#133dc5ff" : undefined} 
      />
      <Text style={styles.agreeText}>Tôi đồng ý với Điều khoản và Chính sách</Text>
    </View>
  );

  // ✅ Nút đăng ký (chỉ bật khi đã tick checkbox)
  const RegisterButton = () => (
    <TouchableOpacity
      style={[styles.button, !agree && { backgroundColor: '#aaa' }]} // nếu chưa tick thì đổi màu xám
      disabled={!agree} // chưa tick thì disable button
      onPress={() => alert("Đăng ký thành công!")}
    >
      <Text style={styles.buttonText}>Đăng Ký</Text>
    </TouchableOpacity>
  );

  // Phần text nhỏ bên dưới
  const RegisterSection = () => (
    <View style={styles.registerContainer}>
      <Text style={styles.infoText}>
        Chúng tôi sẽ bảo vệ dữ liệu của bạn để ngăn ngừa rủi ro bảo mật.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Banner trên cùng */}
      <LoginBanner 
        title="Đăng Ký" 
        subtitle="Tận hưởng các tính năng hoàn chỉnh của travelokaTDC"
      />  

      {/* Các input */}
      <RegisterInput />
      <EmailInput />
      <PassInput />  
      <PassInputAgain />

      {/* Checkbox + nút đăng ký */}
      <AgreeButton />   
      <RegisterButton />  

      {/* Text nhỏ cuối trang */}
      <RegisterSection />  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20
  },
  // label trên mỗi input
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // input gạch chân
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  // nút đăng ký
  button: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#2400eeff', // xanh tím đậm
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // container phần text nhỏ
  registerContainer: {
    marginTop: 20,
    paddingHorizontal:20,
  },
  infoText: {
    marginTop: 5,
    fontSize: 11,
    color: '#666',
    fontWeight:'bold',
  },
  // checkbox + text
  agreeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  agreeText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#333",
  }
});
