import BaseUrl from "@/constants/BaseURL";
import Room from "@/models/Room";

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
    `http://localhost:8080/api/rooms/available?hotelId=${hotelId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
  );  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  // ép kiểu dữ liệu trả về
  const data: Room[] = await res.json();
  return data;
}

export { getRoomAvailableByHotel, getRoomByHotel };

