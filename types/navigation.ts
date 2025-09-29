// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  HotelDetail: undefined; // có params thì khai báo ở đây
  RoomCard: undefined;
  FormBooking: { roomPrice: number };   // 👈 thêm roomPrice
  ConfirmBooking: {
    hotelName: string;
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
};
