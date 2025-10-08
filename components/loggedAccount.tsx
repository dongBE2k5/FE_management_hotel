import HeaderProfile from '@/components/headerProfile';
import type { RootStackParamList } from '@/types/navigation';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';


const Notification = () => {
 const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView style={styles.container}>
      {/* Box 1: Avatar + thông tin + Đăng xuất + nút chỉnh sửa */}
      <View style={[styles.box, { height: 120 }]}>
        <View style={styles.row}>
          {/* Avatar tròn (tạm thời là màu xám placeholder) */}
          <View style={styles.avatar} />

          {/* Tên + trạng thái đăng nhập */}
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.name}>Thuan nguyen</Text>
            <Text style={styles.status}>Đã đăng nhập</Text>
          </View>

          {/* Nút đăng xuất */}
          <TouchableOpacity  onPress={() => navigation.navigate('Account')}>
            <View style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Nút chỉnh sửa hồ sơ */}
        <TouchableOpacity onPress={() => navigation.navigate('InFormationAccount')}>
          <View  style={styles.editBtn}>
            <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Box 2: Thông tin cá nhân */}
      <View style={styles.box}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.item}>Họ và tên: Nguyễn Phan Huy Thuận</Text>
        <Text style={styles.item}>Ngày sinh: 01/01/2000</Text>
        <Text style={styles.item}>Giới tính: Nam</Text>
        <Text style={styles.item}>Địa chỉ: Thành phố Thủ Đức</Text>
      </View>

      {/* Box 3: Email */}
      <View style={styles.box}>
        <Text style={styles.title}>Địa chỉ email</Text>
        <View style={styles.row}>
          <MaterialIcons name="email" size={20} color="#333" />
          <Text style={[styles.item, { marginLeft: 8 }]}>Thuan@gmail.com</Text>
        </View>
      </View>

      {/* Box 4: Số điện thoại */}
      <View style={styles.box}>
        <Text style={styles.title}>Số điện thoại</Text>
        <View style={styles.row}>
          <FontAwesome name="phone" size={20} color="#333" />
          <Text style={[styles.item, { marginLeft: 8 }]}>09481231423</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default function LoginAccount() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ddd' }}>
      {/* Banner trên cùng (có thể hiển thị tiêu đề/subtitle) */}
      <HeaderProfile />
      
      {/* Danh sách các box hiển thị thông tin */}
      <Notification /> 
    </View>
  );
}

const styles = StyleSheet.create({
  // Container bọc tất cả box
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
        transform: [{ translateY: -50 }],
  },
  // Box trắng bo góc có bóng đổ
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    // bóng đổ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Hàng ngang (dùng cho avatar + text + nút)
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  // Avatar tròn
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc', // placeholder
  },
  // Tên user
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Trạng thái (chữ nhỏ, màu xám)
  status: {
    fontSize: 12,
    color: '#666',
  },
  // Nút đăng xuất (màu đỏ)
  logoutBtn: {
    backgroundColor: 'red',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Nút chỉnh sửa hồ sơ (bo tròn xanh dương)
  editBtn: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Tiêu đề box
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  // Text hiển thị thông tin
  item: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
});
