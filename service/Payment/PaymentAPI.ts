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

export default {
  createPayment,
};
