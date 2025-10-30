import AsyncStorage from '@react-native-async-storage/async-storage';
import BookingStatus from '@/enums/BookingStatus';
import BookingResponse from '@/models/Booking/BookingResponse';
import History from '@/models/Booking/History';
import BaseUrl from '../constants/BaseURL';
import Booking from '../models/Booking/Booking';
import { Hotel } from '@/models/Hotel';

interface HistoryStatus {
    bookingId: number;
    newStatus: string;
    changedBy?: Number;
}

//  Create booking
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
//best choice

export async function getBestChoiceHotels(locationId?: number) {
    const url = locationId
        ? `${BaseUrl}/bookings/best-choice?locationId=${locationId}`
        : `${BaseUrl}/bookings/best-choice`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
}


//  Get all bookings
const getBookings = async (): Promise<BookingResponse[]> => {
    const response = await fetch(`${BaseUrl}/bookings`);
    return response.json();
};

//  Get booking by ID
const getBookingById = async (id: number): Promise<BookingResponse | null> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/${id}`);
        return response.json();
    } catch (error) {
        console.error(" Lỗi khi lấy thông tin đặt phòng:", error);
        return null;
    }
};

//  Get bookings by user
const getBookingsByUserId = async (userId: number): Promise<BookingResponse[]> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/user/${userId}`);
        return response.json();
    } catch (error) {
        console.error(" Lỗi khi lấy danh sách đặt phòng:", error);
        return [];
    }
};

//  Get all bookings by hotel
const getAllBookingsByHotelId = async (hotelId: number): Promise<BookingResponse[]> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/hotel/${hotelId}`);
        return response.json();
    } catch (error) {
        console.error(" Lỗi khi lấy danh sách đặt phòng:", error);
        return [];
    }
};



//  Update booking status (API mới, có token)
const updateBookingStatus = async (
    bookingId: number,
    newStatus: string,
    changedBy?: number
): Promise<BookingResponse> => {
    try {
        const token = await AsyncStorage.getItem('jwtToken');

        const response = await fetch(`${BaseUrl}/bookings/update-status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                bookingId,
                newStatus,
                changedBy: changedBy ?? null,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("❌ Lỗi server:", response.status, text);
            throw new Error(`Cập nhật trạng thái thất bại (${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái booking (phiên bản mới):", error);
        throw error;
    }
};

// 🧩 Get booking history
const getHistoryBookingsByBookingId = async (bookingId: number): Promise<History[]> => {
    try {
        const response = await fetch(`${BaseUrl}/bookings/history/${bookingId}`);
        return response.json();
    } catch (error) {
        console.error("❌ Lỗi khi lấy lịch sử đặt phòng:", error);
        return [];
    }
};

export {
    createBooking,
    getAllBookingsByHotelId,
    getBookingById,
    getBookings,
    getBookingsByUserId,
    updateBookingStatus,       
    getHistoryBookingsByBookingId
};
