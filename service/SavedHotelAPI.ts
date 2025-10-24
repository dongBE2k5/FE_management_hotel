import BaseUrl from "../constants/BaseURL";
import { SavedHotel } from "../models/SavedHotel";
import { Hotel } from "../models/Hotel";


//  Lấy danh sách khách sạn đã lưu theo userId
export const getSavedHotels = async (userId: number): Promise<Hotel[]> => {
  try {
    const res = await fetch(`${BaseUrl}/saved-hotels/${userId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: Hotel[] = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error fetching saved hotels:", err);
    return [];
  }
};
//  Lưu khách sạn vào danh sách yêu thích
export const saveHotel = async (userId: number, hotelId: number): Promise<void> => {
  try {
    const res = await fetch(`${BaseUrl}/saved-hotels?userId=${userId}&hotelId=${hotelId}`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    console.log("✅ Đã lưu khách sạn:", userId, hotelId);
  } catch (err) {
    console.error("❌ Error saving hotel:", err);
  }
};

//  Xoá khách sạn khỏi danh sách yêu thích
export const removeSavedHotel = async (userId: number, hotelId: number): Promise<void> => {
  try {
    const res = await fetch(`${BaseUrl}/saved-hotels/${userId}/${hotelId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    console.log("🗑️ Đã xoá khách sạn đã lưu:", hotelId);
  } catch (err) {
    console.error("❌ Error removing saved hotel:", err);
  }
};

//  Kiểm tra 1 khách sạn đã được lưu hay chưa
export const isHotelSaved = async (userId: number, hotelId: number): Promise<boolean> => {
  try {
    const res = await fetch(`${BaseUrl}/saved-hotels/check?userId=${userId}&hotelId=${hotelId}`);
    if (!res.ok) return false;
    const result = await res.json();
    return Boolean(result);
  } catch (err) {
    console.error("❌ Error checking saved hotel:", err);
    return false;
  }
};

//  Lọc khách sạn đã lưu theo locationId
export const getSavedHotelsByLocation = async (
  userId: number,
  locationId: number
): Promise<Hotel[]> => {
  try {
    const res = await fetch(`${BaseUrl}/saved-hotels/${userId}/by-location/${locationId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: Hotel[] = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Error fetching saved hotels by location:", err);
    return [];
  }
};
