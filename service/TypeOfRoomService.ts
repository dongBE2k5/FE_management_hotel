import BaseUrl from '../constants/BaseURL';
import TypeOfRoomResponse from '../models/TypeOfRoom/TypeOfRoomResponse';

async function getTypeOfRoomByHotel(id: number): Promise<TypeOfRoomResponse> {
  const res = await fetch(`${BaseUrl}/type-rooms/by-hotel/${id}`);
  
  if (!res.ok) {
    return {
      status: res.status,
      message: res.statusText,
      data: []
    };
  }


  // ép kiểu dữ liệu trả về
  const data: TypeOfRoomResponse = await res.json();
  
  return data;
}


export { getTypeOfRoomByHotel };
