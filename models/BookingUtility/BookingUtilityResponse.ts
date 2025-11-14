export interface BookingUtilityResponse {
  bookingId: number;
  utilityItemBookingResponse: UtilityItemBookingResponse[];
}

export interface UtilityItemBookingResponse {
  utilityName: string;
  quantity: number;
  price: number;
}
