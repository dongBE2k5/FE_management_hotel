// service/BankAPI.ts
import axios from 'axios';

export interface Bank {
  id: number;
  name: string;        // Tên đầy đủ (Ngân hàng TMCP Ngoại Thương...)
  code: string;        // Mã code (VCB, MB, TECHCOMBANK...)
  bin: string;         // Mã BIN (970436...)
  shortName: string;   // Tên ngắn (Vietcombank, MBBank...)
  logo: string;        // Link ảnh logo
  transferSupported: number;
  lookupSupported: number;
}

interface VietQRResponse {
  code: string;
  desc: string;
  data: Bank[];
}

export const getListBanks = async (): Promise<Bank[]> => {
  try {
    // Gọi API VietQR
    const response = await axios.get<VietQRResponse>('https://api.vietqr.io/v2/banks');
    
    if (response.data.code === "00") {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách ngân hàng:", error);
    return [];
  }
};