import TypeOfRoomRequest from '@/models/TypeOfRoom/TypeOfRoomRequest';
import axios from 'axios';
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

async function updateTypeOfRoom(id: number, typeOfRoom: TypeOfRoomRequest): Promise<any> {

  const res = await axios.put(`${BaseUrl}/type-rooms/${id}`, typeOfRoom);
  if (res.status !== 200) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.data;
}

async function addTypeOfRoom(typeOfRoom: TypeOfRoomRequest): Promise<any> {
  const res = await axios.post(`${BaseUrl}/type-rooms`, typeOfRoom);
  if (res.status !== 201) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.data;
}

async function deleteTypeOfRoom(typeId: number, hotelId: number): Promise<any> {
  const res = await axios.delete(`${BaseUrl}/type-rooms/${typeId}/hotel/${hotelId}`);
  if (res.status !== 200) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.data;
}

export { addTypeOfRoom, deleteTypeOfRoom, getTypeOfRoomByHotel, updateTypeOfRoom };

