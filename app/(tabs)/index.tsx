import Header from '@/components/header';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function App() {
  const [log, setLog] = useState('');

  const handlePress = () => {
    setLog(prev => prev + ' ➡️ Bạn vừa nhấn nút!');
  };

  return (
    <View >
      <Header/>
     
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
