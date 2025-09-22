import { Image } from 'expo-image';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';


export default function HomeScreen() {
    const [message, setMessage] = useState(''); // state lưu nội dung sẽ hiển thị

  const handlePress = () => {
    setMessage(...'Xin chào! Bạn vừa nhấn nút.');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Nhấn vào đây</Text>
      </TouchableOpacity>

      {/* Hiển thị chữ khi state thay đổi */}
      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});