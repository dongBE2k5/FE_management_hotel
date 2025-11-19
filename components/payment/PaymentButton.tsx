// Trong file service, ví dụ: src/service/Payment/PaymentService.js

import PaymentAPI from '@/service/Payment/PaymentAPI';
import { Alert } from 'react-native';

/**
 * Hàm khởi tạo quá trình thanh toán và mở link.
 * @param amount Số tiền
 * @param method Phương thức ('VNPAY' | 'BANK')
 * @param bookingId ID của booking
 */
export const initiatePayment = async (amount: number, method: 'VNPAY' | 'BANK', bookingId: number, hotelId: number) => {
  try {
    if (method === 'VNPAY') {
      const paymentUrl = await PaymentAPI.createPayment(amount, method, bookingId);
      if (paymentUrl) {

        return paymentUrl;

      } else {
        Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán.");
      }
    }else if(method==='BANK'){
       const paymentUrl = await PaymentAPI.createPaymentBank(amount, method, bookingId,hotelId);
      if (paymentUrl) {

        return paymentUrl;

      } else {
        Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán.");
      }
    }


  } catch (error) {
    console.error("❌ Lỗi khi khởi tạo thanh toán:", error);
    Alert.alert("Lỗi", "Đã có lỗi xảy ra khi tạo đơn thanh toán.");
  }
};