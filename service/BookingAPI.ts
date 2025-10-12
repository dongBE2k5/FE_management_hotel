import BookingResponse from '@/models/Booking/BookingResponse';
import BaseUrl from '../constants/BaseURL';
import Booking from '../models/Booking/Booking';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

const updateBookingStatus = async (
    bookingId: number,
    newStatus: string,
    changedBy?: number
): Promise<BookingResponse> => {
    try {
        // 🔹 Lấy token từ AsyncStorage (đã lưu sau khi login)
        const token = await AsyncStorage.getItem('jwtToken');

        const response = await fetch(`${BaseUrl}/bookings/update-status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // ✅ thêm dòng này
            },
            body: JSON.stringify({
                bookingId: bookingId,
                newStatus: newStatus,
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
        console.error("❌ Lỗi khi cập nhật trạng thái booking:", error);
        throw error;
    }
};


export { createBooking, getAllBookingsByHotelId, getBookingById, getBookings, getBookingsByUserId, updateBookingStatus };