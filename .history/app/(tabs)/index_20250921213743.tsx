import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [message, setMessage] = useState('');

  const handlePress = () => {
    const name = 'Khách sạn ABC';
    const city = 'Hà Nội';
    setMessage('Tên: ' + name + ', Thành phố: ' + city);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Ghép chữ</Text>
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
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
