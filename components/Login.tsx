
import UserLogin from '@/models/UserLogin';
import { loginFunction } from '@/service/UserAPI';
import { ProfileStackParamList } from '@/types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LoginBanner from './userProfile/bannerLogin';
import Ionicons from '@expo/vector-icons/Ionicons';

type LoginScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  "Login"
>;
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [userLogin, setUserLogin] = useState<UserLogin>({

    username: '',
    password: ''
  });
 
  const router = useRouter();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const handleLogin = async () => {
    try {
      userLogin.username = username;
      userLogin.password = password;
      const res = await loginFunction(userLogin);
      if(res !== null){
        setModalType('success');
        setModalMessage('Đăng nhập thành công!');
        setModalVisible(true);
        await AsyncStorage.setItem('userId', res.id.toString());
        // Tự động chuyển sau 1.5s
        setTimeout(() => {
          setModalVisible(false);
          router.replace('/');
        }, 1500);
      }else {
        setModalType('error');
        setModalMessage('Tên đăng nhập hoặc mật khẩu không chính xác!');
        setModalVisible(true);

        // Tự động chuyển sau 1.5s
        setTimeout(() => {
          setModalVisible(false);
        }, 1500);
      }
      
      
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối đến máy chủ!");
    }
  };


  // Ô nhập tên đăng nhập
  const LoginInput = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Tên Đăng Nhập:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
      </View>
    );
  };

  // Ô nhập mật khẩu
 <View style={styles.container}>
  <Text style={styles.label}>Mật Khẩu:</Text>
  <View style={styles.passwordContainer}>
    <TextInput
      style={[styles.input, { flex: 1 }]}
      placeholder="Nhập mật khẩu"
      placeholderTextColor="#999"
      secureTextEntry={!showPassword}   // 👈 đổi theo state
      value={password}
      onChangeText={setPassword}
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={22}
        color="#666"
        style={{ marginLeft: 8 }}
      />
    </TouchableOpacity>
  </View>
</View>


  // Nút đăng nhập
  const LoginButton = () => (
    <TouchableOpacity style={styles.button}>
      <TouchableOpacity onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Phần đăng ký (nếu chưa có tài khoản)
  const RegisterSection = () => (
    <View style={styles.registerContainer}>
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
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Banner trên cùng */}
      <LoginBanner
        title="Đăng Nhập"
        subtitle="Tận hưởng các tính năng hoàn chỉnh của travelokaTDC"
      />

      {/* Form đăng nhập */}
      <View style={styles.container}>
        <Text style={styles.label}>Tên Đăng Nhập:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên đăng nhập"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Mật Khẩu:</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={true}   // ẩn ký tự mật khẩu
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Nút login */}
      <LoginButton />

      {/* Phần hướng dẫn đăng ký */}
      <RegisterSection />

      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { borderColor: modalType === 'success' ? '#28a745' : '#dc3545' },
            ]}
          >
            <Text
              style={[
                styles.modalText,
                { color: modalType === 'success' ? '#28a745' : '#dc3545' },
              ]}
            >
              {modalMessage}
            </Text>
            {/* <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: modalType === 'success' ? '#28a745' : '#dc3545' },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đóng</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>
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
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
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
  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#aaa',
  paddingVertical: 5,
},

});
