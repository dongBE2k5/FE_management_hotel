import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function CCCDScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // 1. Yêu cầu quyền truy cập Camera khi component được render
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // 2. Xử lý dữ liệu sau khi quét mã QR thành công
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    // Bạn có thể hiển thị Alert hoặc điều hướng sang màn hình khác với dữ liệu đã quét
    Alert.alert(
        'Quét thành công!', 
        `Dữ liệu thô: ${data}`,
        [{ text: 'OK' }]
    );
  };

  // 3. Render giao diện dựa trên trạng thái quyền
  if (hasPermission === null) {
    return <Text style={styles.infoText}>Đang yêu cầu quyền truy cập camera...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.infoText}>Không có quyền truy cập camera. Vui lòng cấp quyền trong cài đặt.</Text>;
  }

  // Giao diện chính khi đã có quyền
  return (
    <View style={styles.container}>
      {/* Hiển thị Camera View */}
      <Camera
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Lớp phủ mờ và khung quét */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}></View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}></View>
      </View>
      
      <Text style={styles.instructionText}>
        Di chuyển mã QR trên CCCD của bạn vào trong khung
      </Text>

      {/* Nút để quét lại sau khi đã quét thành công */}
      {scanned && (
        <View style={styles.rescanButtonContainer}>
            <Button title={'Nhấn để quét lại'} onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

// 4. StyleSheet để tạo kiểu cho giao diện
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  infoText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 16,
  },
  instructionText: {
    position: 'absolute',
    top: '20%',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  rescanButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
  },
  // CSS cho lớp phủ
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5, // Tăng kích thước khung quét
  },
  focusedContainer: {
    flex: 8, // Chiều rộng của khung quét
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});