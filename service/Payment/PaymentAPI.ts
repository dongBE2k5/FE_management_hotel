import Payment from '@/models/Payment';
import axios from 'axios';
import BaseUrl from '../../constants/BaseURL';
// const { BaseUrl, getBaseUrl } = BaseURLObj;


interface PaymentResponse {
  status: string;
  message?: string;
  data?: any;
}

async function createPayment(
  orderTotal: number,
  method: string,
  bookingId: number,

): Promise<PaymentResponse | undefined> {
  try {
    const parsed = new URL(BaseUrl);
    const ip = parsed.hostname;
    const params = new URLSearchParams();
    params.append('amount', orderTotal.toString());
    params.append('orderInfo', bookingId.toString());
    params.append('method', method);
    params.append('ip', ip);
    console.log("ip", ip);


    const response = await axios.post(`${BaseUrl}/pay/createpay`, params);

    console.log('✅ Đã lấy được link thanh toán:');
    // console.log(response.data);

    return response.data?.paymentUrl;
  } catch (error) {
    console.log('❌ Link thanh toán bị lỗi:');
    if (axios.isAxiosError(error)) {
      console.log('Message:', error.message);
      console.log('Response:', error.response?.data);
    } else {
      console.log(error);
    }
  }
}


/**
 * Lấy payment theo ID
 */
async function getPaymentById(id: number): Promise<Payment | null> {
  try {
    const response = await axios.get(`${BaseUrl}/pay/${id}`);
    console.log(`📦 Payment id=${id}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy payment id=${id}:`, error);
    return null;
  }
}

/**
 * Lấy tất cả payment của 1 booking
 */
 export async function getPaymentsByBookingId(bookingId: number): Promise<Payment[]> {
  try {
    const response = await axios.get(`${BaseUrl}/pay/booking/${bookingId}`);
    console.log(`📦 Payment theo bookingId=${bookingId}:`, response.data);
    return response.data  || [];
  } catch (error) {
    console.error(`❌ Lỗi khi lấy payment theo bookingId=${bookingId}:`, error);
     throw error;
  }
}
async function getAllPayments(): Promise<Payment[] | null> {
  try {
    const response = await axios.get(`${BaseUrl}/pay`);
    console.log('📦 Tất cả payment:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách payment:', error);
    return null;
  }
}
export default {
  createPayment,
  getAllPayments,
  getPaymentById,
};
