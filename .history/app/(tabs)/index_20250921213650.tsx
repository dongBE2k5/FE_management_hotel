import React from 'react';
import { View, Button, Alert } from 'react-native';

export default function App() {
  const showAlert = () => {
    Alert.alert('Thông báo', 'Bạn vừa nhấn nút!');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Nhấn để hiện thông báo" onPress={showAlert} />
    </View>
  );
}
