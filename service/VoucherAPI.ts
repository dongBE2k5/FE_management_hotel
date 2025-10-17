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
