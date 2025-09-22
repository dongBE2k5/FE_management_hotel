import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  const [log, setLog] = useState('');

  const handlePress = () => {
    setLog(prev => prev + ' ➡️ Bạn vừa nhấn nút!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Nhấn để nối chữ</Text>
      </TouchableOpacity>
      <Text style={styles.message}>{log}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
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
    textAlign: 'center',
  },
});
