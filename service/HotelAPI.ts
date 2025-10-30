import { HotelRequest } from '@/models/Hotel/HotelRequest';
import axios from 'axios';
import BaseUrl from '../constants/BaseURL';
import { Hotel } from '../models/Hotel';

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

async function findHotelById(id: Number): Promise<Hotel> {
  console.log(`${BaseUrl}/hotels/${id}`);
  const res = await fetch(`${BaseUrl}/hotels/${id}`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Hotel = await res.json();
  return data;
}

async function getAllHotelsByUser(userId: number): Promise<Hotel[]> {
  const res = await axios.get(`${BaseUrl}/hotels/user/${userId}`);
  if (res.status !== 201) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  console.log(res.data);
  return res.data;
}

async function updateHotel(id: number, hotel: HotelRequest): Promise<Hotel> {
  const res = await axios.put(`${BaseUrl}/hotels/${id}`, hotel);
  console.log(res.data);
  if (res.status !== 201) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  console.log(res.data);
  return res.data;
}

async function createHotel(hotel: HotelRequest): Promise<Hotel> {
  const res = await axios.post(`${BaseUrl}/hotels`, hotel);
  console.log(res.data);
  if (res.status !== 200) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.data;
}

export { createHotel, findHotelById, getAllHotel, getAllHotelsByUser, getHotelByLocation, updateHotel };

