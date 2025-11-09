import { useUser } from '@/context/UserContext';
import UserLogin from '@/models/UserLogin';
import { loginFunction } from '@/service/UserAPI';
import { ProfileStackParamList } from '@/types/navigation';
import Ionicons from '@expo/vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LoginBanner from './bannerLogin';
type LoginScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'Login'
>;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2. Lấy hàm setUser từ Context
  const { setUser } = useUser();
  const router = useRouter(); // Vẫn giữ router nếu cần cho các việc khác
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    const loginPayload: UserLogin = {
      username: username,
      password: password,
    };

    try {
      const res = await loginFunction(loginPayload);
      console.log('login res', res);

      if (res != null) {
        console.log('login res 2', res);
    
        await AsyncStorage.multiRemove(['userId', 'role', 'userToken']);

        // Alert.alert('Thành công', 'Đăng nhập thành công!', [
        //   {
        //     text: 'OK',
        //     onPress: async () => {
              // 3. Lưu thông tin vào bộ nhớ
              await AsyncStorage.multiSet([
                ['userId', res.id.toString()],
                ['userToken', res.accessToken],
                ['role', res.role.name],
              ]);
              // 4. Cập nhật state global
              // UserContext sẽ tự động lắng nghe thay đổi này và điều hướng
              setUser(res);

              // 5. XÓA điều hướng tại đây. UserContext sẽ xử lý.
              router.replace('/');
        //     },
        //   },
        // ]);
      } else {
        Alert.alert(
          'Lỗi đăng nhập',
          'Tên đăng nhập hoặc mật khẩu không chính xác!',
          [{ text: 'OK' }]
        );
      }
    }
    catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Lỗi kết nối đến máy chủ!');
    }
  };

  // Nút đăng nhập
  const LoginButton = () => (
    <TouchableOpacity style={styles.button} onPress={handleLogin}>
      <Text style={styles.buttonText}>Đăng nhập</Text>
    </TouchableOpacity>
  );

  // Phần đăng ký (nếu chưa có tài khoản)
  const RegisterSection = () => (
    <View style={styles.registerContainer}>
      <Text style={styles.registerText}>
        Nếu chưa có tài khoản vui lòng ấn{' '}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text
            style={{
              color: 'blue',
              transform: [{ translateY: 5 }],
              fontWeight: 'bold',
            }}
          >
            Đăng ký
          </Text>
        </TouchableOpacity>
      </Text>
      <Text style={styles.infoText}>
        Chúng tôi sẽ bảo vệ dữ liệu của bạn để ngăn ngừa rủi ro bảo mật.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
          autoCapitalize="none"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Mật Khẩu:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#555"
            />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'flex-end', marginRight: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={{ color: '#007BFF', fontWeight: '600', marginTop: 5 }}>
              Quên mật khẩu?
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <LoginButton />
      <RegisterSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#aaa',
    paddingVertical: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
});
