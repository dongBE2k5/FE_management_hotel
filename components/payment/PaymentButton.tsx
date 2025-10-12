// Trong file service, ví dụ: src/service/Payment/PaymentService.js

import PaymentAPI from '@/service/Payment/PaymentAPI';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';


/**
 * Hàm khởi tạo quá trình thanh toán và mở link.
 * @param amount Số tiền
 * @param method Phương thức ('vnpay' | 'momo')
 * @param bookingId ID của booking
 */
export const initiatePayment = async (amount: number, method: 'vnpay' | 'momo', bookingId: number) => {
  try {
    const paymentUrl = await PaymentAPI.createPayment(amount, method, bookingId);
    if (paymentUrl) {
      await Linking.openURL(paymentUrl.toString());
    } else {
      Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán.");
    }
  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo thanh toán:", error);
    Alert.alert("Lỗi", "Đã có lỗi xảy ra khi tạo đơn thanh toán.");
  }
};