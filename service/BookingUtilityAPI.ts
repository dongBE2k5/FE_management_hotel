import BaseUrl from "@/constants/BaseURL";
import { BookingUtilityRequest } from "@/models/BookingUtility/BookingUtilityRequest";
import { BookingUtilityResponse } from "@/models/BookingUtility/BookingUtilityResponse";
import axios from "axios";

const createBookingUtility = async (bookingUtilityRequest: BookingUtilityRequest) => {
    const res = await axios.post(`${BaseUrl}/booking-utility`, bookingUtilityRequest);
    if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.data;
}

const getBookingUtilityByBookingId = async (
    bookingId: number
): Promise<BookingUtilityResponse> => {
    try {
        const res = await axios.get(`${BaseUrl}/booking-utility/${bookingId}/booking`);
        return res.data.data;
    } catch (error: any) {
        // Nếu server trả về lỗi 404 → trả về dữ liệu rỗng
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return {
                bookingId,
                utilityItemBookingResponse: []  // 👈 trả về mảng rỗng thay vì throw
            };
        }
        // Nếu lỗi khác → ném lại để xử lý ở nơi gọi
        throw error;
    }
};
export {
    createBookingUtility,
    getBookingUtilityByBookingId
};

