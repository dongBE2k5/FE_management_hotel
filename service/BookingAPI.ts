import BookingResponse from '@/models/Booking/BookingResponse';
import  BookingStatus from '@/enums/BookingStatus';
import BaseUrl from '../constants/BaseURL';
import Booking from '../models/Booking/Booking';
import History from '@/models/Booking/History';


interface HistoryStatus {
    bookingId: number;
    newStatus: string;
    changedBy?: Number;
}


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

const getAllBookingsByHotelId = async (hotelId: number): Promise<BookingResponse[]> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/hotel/${hotelId}`);
        return response.json();
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách đặt phòng:", error);
        return [];
    }
}

const updateBookingStatus = async (bookingId: number, status: number,
    changedBy?: Number): Promise<HistoryStatus | null> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId: bookingId,
                newStatus: BookingStatus(status), // ✅ key đúng với DTO Java
                changedBy: changedBy // nếu backend có field này
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái đặt phòng:", error);
        return null;
    }
}

const getHistoryBookingsByBookingId = async (bookingId: number): Promise<History[]> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/history/${bookingId}`);
        return response.json();
    } catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử đặt phòng:", error);
        return [];
    }
}
export {
    createBooking,
    getAllBookingsByHotelId,
    getBookingById,
    getBookings,
    getBookingsByUserId, 
    getHistoryBookingsByBookingId, 
    updateBookingStatus
};

