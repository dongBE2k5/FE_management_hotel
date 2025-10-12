import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Text, View } from "react-native";
import Logo from "../../assets/images/logo.png";
import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '@/context/UserContext';

export default function Header() {
  const { user, refreshUser } = useUser();

  // Làm mới user mỗi khi Header được focus
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  return (
    <View style={styles.header}>
      {/* Logo + tên app */}
      <View style={styles.wrapper}>
        <Text style={styles.title}>TravelokaTDC</Text>
        <Image style={{ marginLeft: 5 }} source={Logo} />
      </View>

      {/* Thông tin người dùng */}
      <View style={styles.profile}>
        <Image style={styles.avatar} source={Logo} />
        <View>
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Xin chào: {user?.data?.username || 'Bạn mới'}
          </Text>

          <View style={styles.tell}>
            <Text style={{ color: '#999494', fontWeight: '700' }}>
              {user?.data?.phone ? `84+ ${user.data.phone}` : 'Chưa có số điện thoại'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#009EDE',
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    paddingVertical: 50,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '700',
  },
  profile: {
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  tell: {
    backgroundColor: 'white',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: 'red',
    marginRight: 10,
  },
});
