interface BookingUtilityRequest {
    bookingId: number;
    utilityItemBooking: UtilityItemBooking[];
}

interface UtilityItemBooking {
    utilityId: number;
    quantity: number;
}

export { BookingUtilityRequest };
