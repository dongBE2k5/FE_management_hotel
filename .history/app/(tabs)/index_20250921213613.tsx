import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function H() {
  const [message, setMessage] = useState('Chưa có gì');

  const changeMessage = () => {
    const texts = [
      'Xin chào 👋',
      'Chào mừng bạn đến với React Native!',
      'Bạn vừa nhấn nút!',
    ];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setMessage(randomText);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={changeMessage}>
        <Text style={styles.buttonText}>Thay đổi chữ</Text>
      </TouchableOpacity>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff5722',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});
