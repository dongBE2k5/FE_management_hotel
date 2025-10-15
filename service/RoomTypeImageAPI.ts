import BaseUrl from "@/constants/BaseURL";
import RoomTypeImage from "@/models/RoomTypeImage";

async function getRoomTypeImageByHotel(id: number): Promise<RoomTypeImage[]> {
    const res = await fetch(`${BaseUrl}/type-rooms/hotel/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  
    // ép kiểu dữ liệu trả về
    const data: RoomTypeImage[] = await res.json();
    return data;
  }
  
  export { getRoomTypeImageByHotel };
  