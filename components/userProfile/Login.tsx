import LoginBanner from './bannerLogin';
import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProfileStackParamList } from '@/types/navigation';

export default function Login() {

  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();


  // Ô nhập tên đăng nhập
  const LoginInput = () => {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Tên Đăng Nhập:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập"
          placeholderTextColor="#999"
        />
      </ScrollView>
    );
  };

  // Ô nhập mật khẩu
  const PassInput = () => {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Mật Khẩu:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={true}   // ẩn ký tự mật khẩu
        />
      </ScrollView>
    );
  };

  // Nút đăng nhập
  const LoginButton = () => (
    <TouchableOpacity style={styles.button}>
      <TouchableOpacity onPress={() => navigation.navigate('LoggedAccount')}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Phần đăng ký (nếu chưa có tài khoản)
  const RegisterSection = () => (
    <ScrollView style={styles.registerContainer}>
      <Text style={styles.registerText}>
        Nếu chưa có tài khoản vui lòng ấn{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={{
            color: 'blue',
            transform: [{ translateY: 5 }],
            fontWeight: 'bold',
          }}>Đăng ký</Text>
        </TouchableOpacity>
      </Text>
      <Text style={styles.infoText}>
        Chúng tôi sẽ bảo vệ dữ liệu của bạn để ngăn ngừa rủi ro bảo mật.
      </Text>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Banner trên cùng */}
      <LoginBanner
        title="Đăng Nhập"
        subtitle="Tận hưởng các tính năng hoàn chỉnh của travelokaTDC"
      />

      {/* Form đăng nhập */}
      <LoginInput />
      <PassInput />

      {/* Nút login */}
      <LoginButton />

      {/* Phần hướng dẫn đăng ký */}
      <RegisterSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20
  },
  // Label cho mỗi input
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // Input gạch chân
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  // Nút đăng nhập
  button: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#ddd',   // màu xám nhạt
    paddingVertical: 12,
    borderRadius: 8,           // bo góc
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Phần dưới cùng (đăng ký + thông báo bảo mật)
  registerContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#333',
  },

  infoText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});
