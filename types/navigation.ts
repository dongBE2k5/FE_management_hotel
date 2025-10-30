import Room from "@/models/Room";
import CCCDScannerScreen from '../components/host/screen/CCCDScannerScreen';
import { CameraCaptureView } from '../components/host/screen/CameraCaptureView';

// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  HotelDetail: { hotelId: number }; // có params thì khai báo ở đây
  Saved: undefined;
  RoomCard: { rooms: Room[]; checkInDate: Date; checkOutDate?: Date | null };
  FormBooking: { room: Room, checkInDate: Date, checkOutDate: Date | null };   // 👈 thêm roomPrice
  ConfirmBooking: {
    room: Room;
    checkInDate: string;
    checkOutDate: string;
    nights: number;

  };
  ReviewBooking: {
    room: Room,
    checkInDate: Date,
    checkOutDate: Date | null,
    nights: number,
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
  InFormationAccount: undefined;
  LoggedAccount: undefined;
};


export type ProfileStackParamList = {
  Profile: undefined; //
  Account: undefined;
  Login: undefined;
  Register: undefined;
  InFormationAccount: undefined;
  LoggedAccount: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
    ChangePassword: undefined;
};

export type EmployeeStackParamList = {
  listRoom: undefined;
  bookingDetail: { bookingId: number }; // có params thì khai báo ở đây
  checkout: undefined; // có params thì khai báo ở đây
}
export type HostStack ={
  // CCCDScanner: undefined;
  CCCDScannerScreen : undefined;
  CameraCaptureView: { onCapture: (imageUri: string) => void }; 
  

}
