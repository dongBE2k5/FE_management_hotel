interface HotelPaymentTypeResponse {
    id: number;
    hotelId: number;
    paymentType: string;
    depositPercent: number;
    roomTypeIds: number | null;
}

export default HotelPaymentTypeResponse;