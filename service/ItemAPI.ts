// @/service/ItemAPI.ts

import { Alert } from 'react-native';
import { Item, ItemCreateDTO, ItemUpdateDTO } from '@/models/Item'; 
import axios from 'axios'; // Import axios trực tiếp
import BaseUrl from '@/constants/BaseURL'; // Import BaseUrl

export interface typeOffRoomItem  {
 
     typeOfRoomId: number;
      typeOfRoomName: string;
      itemId: number;
      itemName: string;
      quantity: number;

}


// get api item theo type of room
export const getTypeOffRoomItem = async (hotelId: number): Promise<typeOffRoomItem[]> => {
    try {
        const response = await axios.get(`${BaseUrl}/type-of-room-items/hotel/${hotelId}`);

        // Xử lý ApiResponse wrapper từ backend
        if (response.data && response.data.data) {
            return response.data.data; // Trả về List<ItemResponseDTO>
        }
    }   catch (error) {
        console.error('Lỗi khi tải vật dụng theo loại phòng:', error);
        Alert.alert("Lỗi", "Không thể tải danh sách vật dụng theo loại phòng.");
        throw error;
    }
} 


/**
 * GET /api/item/{hotelId}/hotel
 * Lấy danh sách vật dụng theo khách sạn
 */
        export const getAllItemsByHotel = async (hotelId: number): Promise<Item[]> => {
    try {
        // Gọi API dùng axios.get với BaseUrl
        const response = await axios.get(`${BaseUrl}/item/${hotelId}/hotel`);

        // Xử lý ApiResponse wrapper từ backend
        if (response.data && response.data.data) {
            return response.data.data; // Trả về List<ItemResponseDTO>
        }

        return [];
    } catch (error) {
        console.error('Lỗi khi tải danh sách vật dụng:', error);
        Alert.alert("Lỗi", "Không thể tải danh sách vật dụng.");
        throw error;
    }
};

/**
 * POST /api/item
 * Tạo một vật dụng mới
 */
export const createItem = async (dto: ItemCreateDTO): Promise<Item | null> => {
    try {
        // Gọi API dùng axios.post với BaseUrl
        const response = await axios.post(`${BaseUrl}/item`, dto);

        // Xử lý ApiResponse wrapper từ backend
        if (response.data?.data) {
            return response.data.data; // Trả về ItemResponseDTO
        }
        return null;

    } catch (error) {
        console.error("Lỗi khi tạo vật dụng:", error);
        Alert.alert("Lỗi", "Không thể tạo vật dụng.");
        throw error;
    }
};

// export const updateItem = async (itemId: number, payload: ItemUpdateDTO): Promise<Item | null> => {
//     try {
//         // Giả định endpoint là 'items/{id}'
//         const response = await axios.put<Item>(`/items/${itemId}`, payload);
//         return response.data;
//     } catch (error) {
//         Alert.alert("Lỗi", "Không thể tạo vật dụng.");
//         return null;
//     }
// };

// // --- THÊM CẢ HÀM NÀY ---
// /**
//  * Xóa một vật dụng bằng ID
//  */
// export const deleteItem = async (itemId: number): Promise<boolean> => {
//     try {
//         // Giả định endpoint là 'items/{id}'
//         await axios.delete(`/items/${itemId}`);
//         return true; // Trả về true nếu thành công
//     } catch (error) {
//         Alert.alert("Lỗi", "Không thể tạo vật dụng.");
//         return false; // Trả về false nếu có lỗi
//     }
// };