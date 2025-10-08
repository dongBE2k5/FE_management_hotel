import Room from "@/models/Room";

// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  HotelDetail: { hotelId: number }; // có params thì khai báo ở đây
 RoomCard: { rooms: Room[]; checkInDate: Date; checkOutDate?: Date | null };
  FormBooking: { room: Room, checkInDate: Date, checkOutDate: Date | null };   // 👈 thêm roomPrice
  ConfirmBooking: {
    hotelName: string;
        hotelImage: string;   
    roomName: string;
    checkIn: Date;
    checkOut: Date | null;
    nights: number;
    roomPrice: number;
    taxFee: number;
    insuranceSelected: boolean;
    insurancePrice: number;
    specialRequests: string[];
    specialRequestPrice: number;
  };
  ReviewBooking: {
    hotelName: string;
        hotelImage: string;   
    roomName: string;
    checkIn: Date;
    checkOut: Date | null;
    nights: number;
    roomPrice: number;
    taxFee: number;
    insuranceSelected: boolean;
    insurancePrice: number;
    specialRequests: string[];
    specialRequestPrice: number;
  };
  Booking: {
    hotelName: string;
        hotelImage: string;   
    roomName: string;
    checkIn: any;
    checkOut: any;
    nights: number;
    roomPrice: number;
    taxFee: number;
    insuranceSelected: boolean;
    insurancePrice: number;
    specialRequests: string[];
    specialRequestPrice: number;
    totalPrice: number;
    isPaid: boolean;
  };
  BookingDetail: {
    hotelName: string;
        hotelImage: string;   
    roomName: string;
    checkIn: any;
    checkOut: any;
    nights: number;
    roomPrice: number;
    taxFee: number;
    insuranceSelected: boolean;
    insurancePrice: number;
    specialRequests: string[];
    specialRequestPrice: number;
    totalPrice: number;
    isPaid: boolean;
  };
  Login: undefined
  Register: undefined
  Account: undefined;
  InFormationAccount:undefined;
  LoggedAccount:undefined;
};


export type ProfileStackParamList = {

  Account: undefined;
  Login: undefined;
  Register: undefined;
  InFormationAccount:undefined;
  LoggedAccount:undefined;
  Home: undefined;
};