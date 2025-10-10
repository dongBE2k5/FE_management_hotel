import BaseUrl from '../constants/BaseURL';
import axios from 'axios';

async function createPayment(orderTotal:number,method:string,bookingId:number): Promise<any> {
    try {
          const response  = await axios.post(`${BaseUrl}/payments/createpay/${orderTotal}/${bookingId}/${method}`);
          console.log("đã lấy được link thanh toán:");
          
            return response.data;
    } catch (error) {
        console.log("link thanh toán bị lỗi :");
    }

    
  }
export default {
    createPayment,
  };