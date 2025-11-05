// components/HeaderProfile.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HeaderProfile = () => (
  <View style={styles.headerContainer}>
    <View style={styles.profileSection}>
      <Image 
        source={{ uri: 'https://i.pravatar.cc/150?u=admin' }} 
        style={styles.avatar} 
      />
      <View>
        <Text style={styles.greeting}>Xin chào,</Text>
        <Text style={styles.adminName}></Text>
      </View>
    </View>
    <TouchableOpacity style={styles.notificationBell}>
      <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0062E0', // Nền xanh dương chính
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20, // Thêm một chút bo góc
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#0062E0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Viền trắng
  },
  greeting: {
    fontSize: 16,
    color: '#E0F0FF', // Màu trắng xanh nhạt
    fontWeight: '300',
  },
  adminName: {
    fontSize: 22,
    color: '#FFFFFF', // Màu trắng
    fontWeight: 'bold',
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Nền trong suốt
  },
});

export default HeaderProfile;