interface Booking {
    userId: number;
    roomId: number;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
      voucherId?: number;
}
export default Booking;