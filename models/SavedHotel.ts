import { Hotel } from "./Hotel";

export interface SavedHotel {
  id: number;          // ID bản ghi trong bảng saved_hotels
  userId: number;      // Người đã lưu
  hotelId: number;     // ID khách sạn đã lưu
  hotel?: Hotel;       // (Optional) Thông tin khách sạn đầy đủ nếu server trả về
  savedAt?: string;    // (Optional) Ngày giờ lưu
}
