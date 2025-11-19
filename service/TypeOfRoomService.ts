import axios from 'axios';
import BaseUrl from '../constants/BaseURL';
import TypeOfRoomResponse from '../models/TypeOfRoom/TypeOfRoomResponse';
import { Alert } from 'react-native';

// (Đây là model giả định, bạn nên import từ file model thật)
interface TypeOfRoom {
  id: number;
  room: string;

}


// ----------------------------------------------------------------
// HÀM MỚI BẠN YÊU CẦU: Gọi GET /api/type-rooms
// ----------------------------------------------------------------
/**
 * GET /api/type-rooms
 * Lấy TẤT CẢ các loại phòng trong hệ thống
 */
export const getAllTypeRooms = async (): Promise<TypeOfRoom[]> => {
  try {
    const response = await axios.get(`${BaseUrl}/type-rooms`);
 
    
    // Xử lý ApiResponse wrapper từ backend
    if (response.data && response.data.data) {
      return response.data.data; // Trả về List<TypeOfRoomDTO>
    }
    return [];

  } catch (error) {
    console.error('Lỗi khi tải tất cả loại phòng:', error);
    Alert.alert("Lỗi", "Không thể tải danh sách tất cả loại phòng.");
    throw error;
  }
};







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

async function updateTypeOfRoom(id: number, typeOfRoom: FormData): Promise<any> {

  const res = await axios.put(`${BaseUrl}/type-rooms/${id}`, typeOfRoom, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (res.status !== 200) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.data;
}

async function addTypeOfRoom(typeOfRoom: FormData): Promise<any> {
  const res = await axios.post(`${BaseUrl}/type-rooms`, typeOfRoom, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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

