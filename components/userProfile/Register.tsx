import LoginBanner from './bannerLogin';
import UserRegister from '@/models/UserRegister';
import { register } from '@/service/UserAPI';
import { RootStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Checkbox from 'expo-checkbox';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

export default function Register() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [agree, setAgree] = useState(false); // ✅ state lưu trạng thái tick vào checkbox
  const [userRegister, setUserRegister] = useState<UserRegister>({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: ""
  });
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    if (!agree) {
      alert("Vui lòng đồng ý với điều khoản trước khi đăng ký!");
      return;
    }
  
    try {
      const res = await register(userRegister);
      console.log(res);
      if(res.data !== null){
        setModalType('success');
        setModalMessage('Đăng ký thành công!');
        setModalVisible(true);

        // Tự động chuyển sau 1.5s
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('Login');
        }, 1500);
      }else {
        setModalType('error');
        setModalMessage(res.message);
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
      onPress={handleRegister}
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
      <View style={styles.container}>
      <Text style={styles.label}>Họ và tên</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập họ và tên"
        placeholderTextColor="#999"
        value={userRegister.fullName}
        onChangeText={(text) =>
          setUserRegister({ ...userRegister, fullName: text })
        }
      />
    </View>
    <View style={styles.container}>
      <Text style={styles.label}>Tên Đăng Nhập:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên đăng nhập"
        placeholderTextColor="#999"
        value={userRegister.username}
        onChangeText={(text) =>
          setUserRegister({ ...userRegister, username: text })
        }
      />
    </View>    
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập Email"
        placeholderTextColor="#999"
        value={userRegister.email}
        onChangeText={(text) =>
          setUserRegister({ ...userRegister, email: text })
        }
      />
    </View>
    <View style={styles.container}>
      <Text style={styles.label}>SĐT:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại"
        placeholderTextColor="#999"
        value={userRegister.phone}
        onChangeText={(text) =>
          setUserRegister({ ...userRegister, phone: text })
        }
      />
    </View>
    <View style={styles.container}>
      <Text style={styles.label}>Mật Khẩu:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        placeholderTextColor="#999"
        secureTextEntry={true} // ✅ ẩn ký tự khi nhập mật khẩu
        value={userRegister.password}
        onChangeText={(text) =>
          setUserRegister({ ...userRegister, password: text })
        }
      />
    </View>
    <View style={styles.container}>
      <Text style={styles.label}>Nhập Lại Mật Khẩu:</Text>
      <TextInput
        style={styles.input}
        placeholder=" Vui lòng nhập lại mật khẩu"
        placeholderTextColor="#999"
        secureTextEntry={true}
      />
    </View>  

      {/* Checkbox + nút đăng ký */}
      <AgreeButton />
      <RegisterButton />

      {/* Text nhỏ cuối trang */}
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
    paddingHorizontal: 20,
  },
  infoText: {
    marginTop: 5,
    fontSize: 11,
    color: '#666',
    fontWeight: 'bold',
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
});
