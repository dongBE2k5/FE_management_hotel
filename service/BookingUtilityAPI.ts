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

const geyBookingUtilityByBookingId = async (bookingId: number):Promise<BookingUtilityResponse> => {
    const res = await axios.get(`${BaseUrl}/booking-utility/${bookingId}/booking`);
    if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.data;
}
export { createBookingUtility,
    geyBookingUtilityByBookingId
 };
