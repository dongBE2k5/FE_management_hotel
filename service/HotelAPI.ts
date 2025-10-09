import BaseUrl from '../constants/BaseURL';
import { Hotel } from '../models/Hotel';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEWED_HOTELS_KEY = 'viewed_hotels';

async function getAllHotel(): Promise<Hotel[]> {
  const res = await fetch(`${BaseUrl}/hotels`);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Hotel[] = await res.json();
  return data;
}


// Gọi API lấy danh sách đã xem gần đây
export const getRecentlyViewedHotels = async (userId: number): Promise<Hotel[]> => {
  try {
    const res = await fetch(`${BaseUrl}/viewed-hotels/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch recently viewed hotels");
    return await res.json();
  } catch (err) {
    console.error("Error fetching recently viewed hotels:", err);
    return [];
  }
};

export const saveViewedHotelAPI = async (userId: number, hotelId: number) => {
  try {
    await fetch(`${BaseUrl}/viewed-hotels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hotelId }),
    });
    console.log("✅ Đã gửi API lưu đã xem:", userId, hotelId);
  } catch (err) {
    console.error("Error saving viewed hotel:", err);
  }
};


async function getHotelByLocation(id: Number): Promise<Hotel[]> {
  const res = await fetch(`${BaseUrl}/hotels/location/${id}`);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Hotel[] = await res.json();
  return data;
}

async function find(id: Number): Promise<Hotel> {
  const res = await fetch(`${BaseUrl}/hotels/${id}`);

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Hotel = await res.json();
  return data;
}

export { find, getAllHotel, getHotelByLocation };

