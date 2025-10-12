import React from 'react';
import BannerAccount from '@/components/accountBanner';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const Notification = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Tiêu đề của phần thông báo */}
      <Text style={styles.label}>Tính năng dành cho thành viên</Text>

      {/* Các ô trắng (box). 
          Sau này bạn có thể thêm icon + text vào bên trong */}
      <View style={styles.box}></View>
      <View style={styles.box}></View>
      <View style={styles.box}></View>
      <View style={styles.box}></View>
    </ScrollView>
  );
};

export default function LoginAccount() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ddd' }}>
      {/* Banner trên cùng */}
      <BannerAccount 
        title="Đăng nhập  /   Đăng ký"
        subtitle="Đăng ký thành viên, hưởng nhiều ưu đãi" 
      />

      {/* Khối notification với các box trắng */}
      <Notification /> 
    </View>
  );
}

const styles = StyleSheet.create({
  // Container chính chứa label + các box
  container: {
    marginVertical: 10,     // khoảng cách trên/dưới với phần khác
    paddingHorizontal: 20,  // cách lề trái/phải
    marginTop: 30,          // đẩy cả container xuống dưới
  },

  // Label tiêu đề ("Tính năng dành cho thành viên")
  label: {
    fontWeight: 'bold',     // chữ đậm
    marginBottom: 15,       // khoảng cách dưới label với box đầu tiên
  },

  // Style chung cho mỗi box trắng
  box: {
    width: '100%',           // chiếm toàn bộ chiều ngang
    height: 52,              // chiều cao box
    backgroundColor: '#fff', // nền trắng
    borderRadius: 12,        // bo góc
    marginBottom: 15,        // khoảng cách giữa các box

    // căn giữa nội dung trong box
    justifyContent: 'center',
    paddingHorizontal: 15,   // padding trái/phải

    // bóng đổ (iOS + Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android
  },
});
