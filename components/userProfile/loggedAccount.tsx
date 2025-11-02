import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import HeaderProfile from './headerProfile';
import type { ProfileStackParamList } from '@/types/navigation';
import { logoutFunction } from '@/service/UserAPI';
import { useUser } from '@/context/UserContext';

const Notification = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { user } = useUser(); // lấy user từ context luôn

  const handleLogout = async () => {
    const result = await logoutFunction();
    if (result.success) {
      alert(result.message);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Account' }], // route màn hình login
      });
    } else {
      alert('Đăng xuất thất bại: ' + result.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Box 1: Avatar + thông tin + Đăng xuất + nút chỉnh sửa */}
      <View style={[styles.box, { height: 120 }]}>
        <View style={styles.row}>
          <View style={styles.avatar} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 12, marginTop: 2, color: '#666' }}>
              {user?.data?.username || "Chưa có tên"}
            </Text>
            <Text style={styles.status}>Đã đăng nhập</Text>
          </View>
          <View>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
            <View style={{ alignItems: "flex-end", marginRight: 20 }}>
              <TouchableOpacity onPress={() => navigation.navigate("ChangePassword")}>
                <Text style={{ color: "#007BFF", fontWeight: "600", marginTop: 5 }}>
                  Đổi mật khẩu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('InFormationAccount')}>
          <View style={styles.editBtn}>
            <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Box 2: Thông tin cá nhân */}
      <View style={styles.box}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.item}>Họ và tên: {user?.data?.fullName || "-"}</Text>
        <Text style={styles.item}>
          Ngày sinh: {user?.data?.birthDate ? new Date(user.data.birthDate).toLocaleDateString("vi-VN") : "-"}
        </Text>
        <Text style={styles.item}>Giới tính: {user?.data?.gender || "-"}</Text>
        <Text style={styles.item}>Địa chỉ: {user?.data?.address || "-"}</Text>
      </View>

      {/* Box 3: Email */}
      <View style={styles.box}>
        <Text style={styles.title}>Địa chỉ email</Text>
        <View style={styles.row}>
          <MaterialIcons name="email" size={20} color="#333" />
          <Text style={[styles.item, { marginLeft: 8 }]}>{user?.data?.email || "-"}</Text>
        </View>
      </View>

      {/* Box 4: Số điện thoại */}
      <View style={styles.box}>
        <Text style={styles.title}>Số điện thoại</Text>
        <View style={styles.row}>
          <FontAwesome name="phone" size={20} color="#333" />
          <Text style={[styles.item, { marginLeft: 8 }]}>{user?.data?.phone || "-"}</Text>
        </View>
      </View>
    </View>
  );
};

export default function LoginAccount() {
  return (
    <View style={{ flex: 1, backgroundColor: '#ddd' }}>
      <HeaderProfile />
      <Notification />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 20,
    transform: [{ translateY: -50 }],
  },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  logoutText: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  item: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
});
