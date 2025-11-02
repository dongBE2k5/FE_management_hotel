import BaseUrl from "@/constants/BaseURL";
import { BookingUtilityRequest } from "@/models/BookingUtility/BookingUtilityRequest";
import axios from "axios";

const createBookingUtility = async (bookingUtilityRequest: BookingUtilityRequest) => {
    const res = await axios.post(`${BaseUrl}/booking-utility`, bookingUtilityRequest);
    if (res.status !== 200) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.data;
}
export { createBookingUtility };
