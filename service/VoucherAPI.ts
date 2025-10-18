import BaseUrl from '../constants/BaseURL';
import Voucher from '../models/Voucher';


// Lấy tất cả voucher
export const getAllVouchers = async (): Promise<Voucher[]> => {
    try {
        const res = await fetch(`${BaseUrl}/vouchers`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Voucher[] = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching vouchers:', err);
        return [];
    }
};

// Lấy voucher theo hotelId
export const getVouchersByHotel = async (hotelId: number): Promise<Voucher[]> => {
    try {
        const res = await fetch(`${BaseUrl}/vouchers/hotel/${hotelId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Voucher[] = await res.json();
        return data;
    } catch (err) {
        console.error(`Error fetching vouchers for hotel ${hotelId}:`, err);
        return [];
    }
};

// Tạo voucher mới
export const createVoucher = async (voucher: Voucher): Promise<Voucher | null> => {
    try {
        const res = await fetch(`${BaseUrl}/vouchers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucher),
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Voucher = await res.json();
        return data;
    } catch (err) {
        console.error('Error creating voucher:', err);
        return null;
    }
};

//gọi hàm tăng used giảm sl khi dùng voucher
export async function useVoucher(voucherId: number, originalPrice: number) {
  const res = await fetch(`${BaseUrl}/vouchers/use/${voucherId}?originalPrice=${originalPrice}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  const text = await res.text(); // lấy nội dung gốc

  if (!res.ok) throw new Error(text);

  // Nếu trả về JSON thật thì parse, còn không thì trả text
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
