interface Booking {
  userId: number;
  roomId: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  voucherIds?: number[]; 
}
export default Booking;