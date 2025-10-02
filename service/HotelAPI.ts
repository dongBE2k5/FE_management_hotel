import BaseUrl from '../constants/BaseURL';
import { Hotel } from '../models/Hotel';
async function getAllHotel(): Promise<Hotel[]> {
  const res = await fetch(`${BaseUrl}/hotels`);
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Hotel[] = await res.json();
  return data;
}


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

