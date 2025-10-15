import Room from "../Room";
import UserResponse from "../UserResponse";

interface BookingResponse {
    id: number;
    user: UserResponse;
    room: Room;
    checkInDate: Date;
    checkOutDate: Date;
    status: string;
    totalPrice: number;
    imageHotel: string;
}
export default BookingResponse;