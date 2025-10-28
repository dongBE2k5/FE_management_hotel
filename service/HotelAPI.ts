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

//lấy tên ks
export async function getHotelById(hotelId: number): Promise<Hotel | null> {
  const res = await fetch(`${BaseUrl}/hotels/${hotelId}`);
  if (!res.ok) return null;
  return await res.json();
}
// Gọi API lấy danh sách đã xem gần đây
// 🔹 Thêm option reverseOrder
export const getRecentlyViewedHotels = async (
  userId: number,
  options?: { reverseOrder?: boolean } // nếu true => đảo ngược
): Promise<Hotel[]> => {
  try {
    const res = await fetch(`${BaseUrl}/viewed-hotels/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch recently viewed hotels");

    let hotels: Hotel[] = await res.json();

    // Nếu muốn đảo ngược thứ tự
    if (options?.reverseOrder) {
      hotels = hotels.reverse();
    }

    return hotels;
  } catch (err) {
    console.error("Error fetching recently viewed hotels:", err);
    return [];
  }
};
// Lấy danh sách khách sạn đã xem theo user + location
export const getRecentlyViewedHotelsByLocation = async (
  userId: number,
  locationId?: number
): Promise<Hotel[]> => {
  try {
    let url = `${BaseUrl}/viewed-hotels/recently-viewed?userId=${userId}`;
    if (locationId) {
      url += `&locationId=${locationId}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch recently viewed hotels by location`);
    }

    const data: Hotel[] = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching viewed hotels by location:", err);
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

//  Hàm tìm kiếm khách sạn theo nhiều tiêu chí
export async function searchHotels(
  name?: string,
  city?: string,
  status?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<Hotel[]> {
  try {
    const params = new URLSearchParams();
    // Chỉ append khi có giá trị thực
    if (name && name.trim() !== "") params.append("name", name);
    if (city && city.trim() !== "") params.append("city", city);
    if (status && status.trim() !== "") params.append("status", status);

    if (minPrice != null) params.append("minPrice", minPrice.toString());
    if (maxPrice != null) params.append("maxPrice", maxPrice.toString());

    const url = `${BaseUrl}/hotels/search?${params.toString()}`;
    console.log("🔍 Search URL:", url);

    const res = await fetch(url);
    console.log("API status:", res.status);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data: Hotel[] = await res.json();
    console.log("✅ Search result:", data);

    return data;
  } catch (error) {
    console.error("❌ Error fetching search hotels:", error);
    return [];
  }
}
export { find, getAllHotel, getHotelByLocation };

