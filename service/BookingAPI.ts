import BookingResponse from '@/models/Booking/BookingResponse';
import BaseUrl from '../constants/BaseURL';
import Booking from '../models/Booking/Booking';
const createBooking = async (booking: Booking): Promise<BookingResponse> => {
    const response = await fetch(`${BaseUrl}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
    });
    return response.json();
}

const getBookings = async (): Promise<BookingResponse[]> => {
    const response = await fetch(`${BaseUrl}/bookings`);
    return response.json();
}

const getBookingById = async (id: number): Promise<BookingResponse | null> => {
   try {
    const response = await fetch(`${BaseUrl}/bookings/${id}`);
    return response.json();
   } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin đặt phòng:", error);
    return null;
   }
}

const getBookingsByUserId = async (userId: number): Promise<BookingResponse[]> => {
    try {
    const response = await fetch(`${BaseUrl}/bookings/user/${userId}`);
    return response.json();
   } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đặt phòng:", error);
    return [];
   }
}

export { createBooking, getBookingById, getBookings, getBookingsByUserId };

