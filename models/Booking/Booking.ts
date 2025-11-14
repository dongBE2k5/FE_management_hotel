interface Booking {
  userId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  voucherIds?: number[];
  hotelPaymentTypeId?: number;
  paidPrice?: number | null;
  paymentMethod?: string;
}
export default Booking;