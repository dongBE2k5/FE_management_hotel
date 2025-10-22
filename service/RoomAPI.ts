import BaseUrl from "@/constants/BaseURL";
import Room from "@/models/Room";
import axios from "axios";

async function getRoomByHotel(id: number): Promise<Room[]> {
  const res = await fetch(`${BaseUrl}/hotels/${id}/rooms`);
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Room[] = await res.json();
  return data;
}

async function getRoomAvailableByHotel(hotelId: number, checkIn: Date, checkOut: Date): Promise<Room[]> {
  const checkInDate = checkIn.toISOString().split('T')[0];
  const checkOutDate = checkOut.toISOString().split('T')[0];
  const res = await fetch(
    `${BaseUrl}/rooms/available?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
  );  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Room[] = await res.json();
  return data;
}

async function addRoom(rooms: Room[]): Promise<Room[]> {
  try {
    const createdRooms: Room[] = [];

    for (const room of rooms) {
      console.log("📤 Gửi room:", room);
      const response = await axios.post(`${BaseUrl}/rooms`, room);

      console.log("✅ Server trả về:", response.data);

      if (response.status === 200 || response.status === 201) {
        createdRooms.push(response.data as Room);
      } else {
        console.error("⚠️ Lỗi HTTP:", response.status);
      }
    }
    return createdRooms;
  } catch (error: any) {
    console.error("❌ Lỗi trong addRoom:", error);
    throw new Error(`HTTP error! ${error}`);
  }
}

export { addRoom, getRoomAvailableByHotel, getRoomByHotel };

