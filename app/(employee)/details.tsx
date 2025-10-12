import * as Linking from 'expo-linking';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import PaymentAPI from '../../service/Payment/PaymentAPI';
export default function PaymentScreen() {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý khi người dùng nhấn nút thanh toán
  const handlePayment = async () => {

    setIsLoading(true);
    try {
      const paymentUrl = await PaymentAPI.createPayment(5000000, 'vnpay', 2);
      if (paymentUrl) {
        // Mở URL thanh toán VNPay
        await Linking.openURL(paymentUrl);
      } else {
        Alert.alert("Lỗi", "Không thể tạo đơn thanh toán");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  // Lắng nghe deep link trả về từ server
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      const data = Linking.parse(url);
      console.log(data);
      const ipv4 = await Network.getIpAddressAsync();
      console.log(ipv4);
      if (data) {
        const status = data.queryParams?.status ?? 'unknown';
        setPaymentStatus(status);

        console.log('Payment status from deep link:', status);
        Alert.alert('Thanh toán', `Trạng thái: ${status}`);
        // TODO: Quay về màn hình trước đó hoặc cập nhật UI khác
      }
    };

    // Đăng ký listener
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Xử lý app được mở từ deep link khi chưa chạy
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // Tạo deep link URL chuẩn (nếu cần tạo từ app)
  const createAppLink = (path: string, params?: Record<string, string>) => {
    return Linking.createURL(path, { queryParams: params });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Demo Thanh Toán VNPay</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Thanh toán 5.000.000" onPress={handlePayment} />
      )}

      {paymentStatus && (
        <Text style={styles.status}>Trạng thái cuối cùng: {paymentStatus}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    marginTop: 20,
    fontSize: 18,
    color: 'green',
  },
});
