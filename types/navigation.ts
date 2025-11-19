import Room from "@/models/Room";
import { UtilityItem } from "@/models/Utility/Utility";
import ItemListHotel from '../components/host/screen/employee/itemListHotel';
import Voucher from "@/models/Voucher";

// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  BookedList: undefined;
  BookedDetail: { id: number };
  HotelDetail: { hotelId: number }; // có params thì khai báo ở đây
  Saved: undefined;
  RoomCard: { rooms: Room[]; checkInDate: Date; checkOutDate?: Date | null };
  FormBooking: { room: Room, checkInDate: Date, checkOutDate: Date | null };   // 👈 thêm roomPrice
  PaymentWebView: undefined;
  ConfirmBooking: {
    room: Room;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    specialRequests: UtilityItem[],
    price: number,


  };
  ReviewBooking: {
    room: Room,
    checkInDate: Date,
    checkOutDate: Date | null,
    nights: number,
    specialRequests: UtilityItem[],
    price: number,
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
  hotelEdit: { id: number },
  CreateHotel: undefined,
  hotelList: undefined,
  hostBookings: undefined;
  listRoom: undefined;
  bookingDetail: { bookingId: number }; // có params thì khai báo ở đây
  checkout: undefined; // có params thì khai báo ở đây
  PaymentWebView: undefined;

}

export type HostStackParamList = {
  hostBookings: undefined;
  bookingDetail: { bookingId: number }; // có params thì khai báo ở đây
  checkout: undefined; // có params thì khai báo ở đây
  RoomList: undefined;
  AddRoom: undefined;
  ManageRoomTypes: undefined;
  ManageServices: undefined;
  // RoomDetail:{roomId:number};

 ListStaffHotel:undefined;
  ItemListHotel:undefined;
  RoomDetail: undefined;
}
export type HostStack = {
  VoucherList: undefined;
  FormVoucher: { isEdit: boolean, voucher: Voucher | null };
  // CCCDScanner: undefined;
  CCCDScannerScreen: undefined;
  CameraCaptureView: { onCapture: (imageUri: string) => void };
  hostBookings: undefined;
  bookingDetail: { bookingId: number }; // có params thì khai báo ở đây
  checkout: undefined; // có params thì khai báo ở đây
  RoomList: undefined;
  AddRoom: undefined;
  ManageRoomTypes: undefined;
  ManageServices: undefined;
  // RoomDetail:{roomId:number};
  RoomDetail: undefined;
  hotelEdit: { id: number },
  CreateHotel: undefined,
  HotelList: undefined,
  StaffListHotel:undefined,
  ItemListHotel:undefined;

  listRoom: undefined;



}
export type CleningEmployee = {
  CleaningStaffScreen: undefined
  CheckRoomScreen: { id: number, priority: String, status: String }
}
