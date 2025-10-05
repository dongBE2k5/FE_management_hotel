// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  HotelDetail: undefined; // có params thì khai báo ở đây
  RoomCard: undefined;
  FormBooking: { roomPrice: number };   // 👈 thêm roomPrice
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
};


export type ProfileStackParamList = {
  Account: undefined;
  Login: undefined;
  Register: undefined;
  InFormationAccount:undefined;
  LoggedAccount:undefined;
};