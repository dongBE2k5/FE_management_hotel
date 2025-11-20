import Payment from '@/models/Payment';
import axios from 'axios';
import BaseUrl, { BaseUrl2 } from '../../constants/BaseURL';
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
    const parsed = new URL(BaseUrl2);
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
async function createPaymentMumanual (
  orderTotal: number,
  method: string,
  bookingId: number,

): Promise<PaymentResponse | undefined> {
  try {
 
    const params = new URLSearchParams();
    params.append('amount', orderTotal.toString());
    params.append('orderInfo', bookingId.toString());
    params.append('method', method);
  


    const response = await axios.post(`${BaseUrl}/pay/createpaymanual`, params);

    console.log('✅ Đã thanh toán thành công ');
    // console.log(response.data);

    return response.data;
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


async function createPaymentBank (
  orderTotal: number,
  method: string,
  bookingId: number,
  hotelId:number,
): Promise<PaymentResponse | undefined> {
  try {
 
    const params = new URLSearchParams();
    params.append('amount', orderTotal.toString());
    params.append('orderInfo', bookingId.toString());
    params.append('method', method);
    params.append("hotelId",hotelId)


    const response = await axios.post(`${BaseUrl}/pay/createpayqr`, params);

    console.log('✅ Đã thanh toán thành công ');
    // console.log(response.data);

    return response.data;
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
async function getAllPayByHotel(hotelId:number): Promise<Payment[] | null> {
  try {
    const response = await axios.get(`${BaseUrl}/pay/${hotelId}/hotel`);
    console.log('📦 Tất cả payment theo hotel:'+hotelId, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách payment:', error);
    return null;
  }
}


/**
 * Cập nhật trạng thái của giao dịch thanh toán bằng ID.
 * * @param id ID của giao dịch thanh toán.
 * @param status Trạng thái mới (ví dụ: 'SUCCESS', 'CANCELLED', 'WAITING').
 * @returns Promise<Payment|null> Trả về đối tượng Payment đã cập nhật hoặc null nếu lỗi.
 */
async function updateStatusPayById(id: number, status: string): Promise<Payment | null> {
    // 1. Đóng gói trạng thái vào một đối tượng JSON


    try {
        const response = await axios.put<Payment>(
            `${BaseUrl}/pay/${id}/status?status=${status}`
           
        );
        
        // Axios trả về response.data là dữ liệu từ server
        return response.data;

    } catch (error) {
        // Log lỗi chi tiết hơn (ví dụ: response status)
        if (axios.isAxiosError(error) && error.response) {
            console.error('❌ Lỗi API khi cập nhật payment:', error.response.status, error.response.data);
        } else {
            console.error('❌ Lỗi khi cập nhật payment:', error);
        }
        return null;
    }
}




export default {
  createPayment,
  createPaymentBank,
  createPaymentMumanual,
  getAllPayments,
  getAllPayByHotel,
  getPaymentById,updateStatusPayById,
};
