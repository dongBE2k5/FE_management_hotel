import axios, { AxiosError } from 'axios';
import BaseUrl from "@/constants/BaseURL";
// Giả sử bạn có file này
import { Alert } from 'react-native';

//----------------------------------------------------------------
// 1. ĐỊNH NGHĨA MODELS (INTERFACES)
//----------------------------------------------------------------

// Model cho đường dẫn: tdc.vn.managementhotel.dto.RoomItemDTO.RoomItemResponseDTO
// Dùng cho các hàm GET, đây là dữ liệu nhận về
export interface RoomItemResponseDTO {
    typeOfRoomId: number;
    itemId: number;
    quantity: number;
    // Backend có thể trả về thêm các trường này, bạn có thể uncomment nếu cần
    // itemName?: string;
    // itemUnit?: string;
    // itemIcon?: string;
}

// Model cho các item con bên trong request
export interface ItemDetail {
    itemId: number;
    quantity: number;
}

// Model cho đường dẫn: tdc.vn.managementhotel.dto.RoomItemDTO.RoomItemRequestDTO
// Dùng cho body của POST và PUT
export interface RoomItemRequestDTO {
    typeOfRoomId: number;
    itemId: number;
    quantity: number;
}

// Model cho cấu trúc ApiResponse chuẩn từ backend của bạn
interface ApiResponse<T> {
    status: string; // "success" hoặc "error"
    message: string;
    data: T;
}

// Định nghĩa URL cơ sở cho controller này
const API_URL = `${BaseUrl}/type-of-room-items`;

// Hàm xử lý lỗi chung
const handleError = (error: any, operation: string) => {
    console.error(`Lỗi trong khi ${operation}:`, error);
    let errorMessage = `Không thể ${operation}.`;
    if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
    }
    Alert.alert("Lỗi", errorMessage);
    throw error;
};

//----------------------------------------------------------------
// 2. CÁC HÀM API TƯƠNG ỨNG VỚI CONTROLLER
//----------------------------------------------------------------

/**
 * 📥 POST /api/type-of-room-items
 * Thêm hoặc cập nhật danh sách tiện ích cho loại phòng.
 * Yêu cầu requestBody phải chứa `typeOfRoomId` và `items`.
 */
export const createOrUpdateRoomItems = async (dto: RoomItemRequestDTO): Promise<RoomItemRequestDTO> => {
    try {

        // Gọi API giống createItem
        const response = await axios.post(`${BaseUrl}/type-of-room-items`, dto);

        // Xử lý ApiResponse wrapper từ backend
        if (response.data?.data) {
            return response.data.data; // Trả về "Thành công"
        }

       
    } catch (error) {
        console.error("Lỗi khi thêm/cập nhật tiện ích:", error);
        Alert.alert("Lỗi", "Không thể thêm/cập nhật tiện ích.");
        throw error;
    }
};

/**
 * 🔍 GET /api/type-of-room-items/type/{typeOfRoomId}
 * Lấy danh sách tiện ích theo ID loại phòng
 */
export const getItemsByTypeOfRoomId = async (typeOfRoomId: number): Promise<RoomItemResponseDTO[]> => {
    try {
        const response = await axios.get<ApiResponse<RoomItemResponseDTO[]>>(`${API_URL}/type/${typeOfRoomId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        handleError(error, `tải tiện ích cho loại phòng ${typeOfRoomId}`);
        return []; // Trả về mảng rỗng khi có lỗi
    }
};

/**
 * 🔍 GET /api/type-of-room-items/type/{typeOfRoomId}/{hotelId}
 * Lấy danh sách tiện ích theo ID loại phòng VÀ ID khách sạn
 */
export const getItemsByTypeOfRoomAndHotel = async (typeOfRoomId: number, hotelId: number): Promise<RoomItemResponseDTO[]> => {
    try {
        const response = await axios.get<ApiResponse<RoomItemResponseDTO[]>>(`${API_URL}/type/${typeOfRoomId}/${hotelId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        handleError(error, `tải tiện ích cho loại phòng ${typeOfRoomId} và khách sạn ${hotelId}`);
        return [];
    }
};

/**
 * 🔍 GET /api/type-of-room-items/hotel/{hotelId}
 * Lấy danh sách tiện ích theo ID khách sạn
 */
export const getItemsByHotelId = async (hotelId: number): Promise<RoomItemResponseDTO[]> => {
    try {
        const response = await axios.get<ApiResponse<RoomItemResponseDTO[]>>(`${API_URL}/hotel/${hotelId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        handleError(error, `tải tiện ích cho khách sạn ${hotelId}`);
        return [];
    }
};

/**
 * 🔍 GET /api/type-of-room-items/room/{roomId}
 * Lấy danh sách tiện ích theo ID phòng cụ thể (room instance)
 */
export const getItemsByRoomId = async (roomId: number): Promise<RoomItemResponseDTO[]> => {
    try {
        const response = await axios.get<ApiResponse<RoomItemResponseDTO[]>>(`${API_URL}/room/${roomId}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        handleError(error, `tải tiện ích cho phòng ${roomId}`);
        return [];
    }
};

/**
 * 🛠️ PUT /api/type-of-room-items/type/{typeOfRoomId}
 * Cập nhật (ghi đè) danh sách tiện ích theo ID loại phòng
 */
export const updateRoomItemsByTypeId = async (typeOfRoomId: number, requestBody: RoomItemRequestDTO): Promise<string> => {
    try {
        // requestBody ở đây chỉ cần chứa list 'items'
        // 'typeOfRoomId' sẽ được lấy từ URL
        const response = await axios.put<ApiResponse<string>>(`${API_URL}/type/${typeOfRoomId}`, requestBody);
        return response.data.data; // Trả về message "Update thành công"
    } catch (error) {
        handleError(error, `cập nhật tiện ích cho loại phòng ${typeOfRoomId}`);
        throw error;
    }
};