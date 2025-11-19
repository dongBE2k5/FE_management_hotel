import BaseUrl from "@/constants/BaseURL";
import { RoomItem } from "@/models/RoomItem";
import axios from "axios";
import { ApiResponse } from "./HostAPI";
import { DamagedItemRequest } from "@/models/DamagedItem/DamagedItemRequest";
import { DamagedItemResponse } from "@/models/DamagedItem/DamagedItemReponse";

export async function getRoomItemsByTypeRoomId(typeOfRoomId: number): Promise<ApiResponse <RoomItem[]>| null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/type-of-room-items/type/${typeOfRoomId}`); 
        console.log(`Lấy danh sách item thành công theo loại phòng id :${typeOfRoomId} `);
        
        return data.data;
        
    } catch (error) {
        return null;
    }
}
export async function createDamagedItem(DamagedItemRequest:DamagedItemRequest):Promise<ApiResponse<null>|null>{
    try {
        const {data} = await axios.post(`${BaseUrl}/damaged-items`,DamagedItemRequest);
        console.log("Tạo mục hỏng hóc thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi tạo mục hỏng hóc:", error);
        return null;
    }
}


export async function getRoomItemsByResquset(requestId: number): Promise<ApiResponse <DamagedItemResponse[]>| null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/damaged-items/request/${requestId}`); 
        console.log(`Lấy danh sách item thành công theo loại phòng id :${requestId} `);
        
        return data.data;
        
    } catch (error) {
        return null;
    }
}

// Lấy tất cả items theo hotelId
export async function getRoomItemsByHotelId(hotelId: number): Promise<RoomItem[] | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/type-of-room-items/hotel/${hotelId}`);
        console.log(`Lấy danh sách items thành công theo hotelId: ${hotelId}`);
        return data.data || data;
    } catch (error) {
        console.error(`❌ Lỗi khi lấy items theo hotelId=${hotelId}:`, error);
        return null;
    }
}

// Tạo item mới cho loại phòng
export async function createRoomItem(itemData: {
    typeOfRoomId: number;
    itemName: string;
    quantity: number;
    price: number;
}): Promise<ApiResponse<RoomItem> | null> {
    try {
        const { data } = await axios.post(`${BaseUrl}/type-of-room-items`, itemData);
        console.log("✅ Tạo item thành công:", data);
        return data;
    } catch (error) {
        console.error("❌ Lỗi khi tạo item:", error);
        return null;
    }
}

// Cập nhật item
export async function updateRoomItem(itemId: number, itemData: {
    itemName?: string;
    quantity?: number;
    price?: number;
}): Promise<ApiResponse<RoomItem> | null> {
    try {
        const { data } = await axios.put(`${BaseUrl}/type-of-room-items/${itemId}`, itemData);
        console.log("✅ Cập nhật item thành công:", data);
        return data;
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật item:", error);
        return null;
    }
}

// Xóa item
export async function deleteRoomItem(itemId: number): Promise<boolean> {
    try {
        const { data } = await axios.delete(`${BaseUrl}/type-of-room-items/${itemId}`);
        console.log("✅ Xóa item thành công");
        return true;
    } catch (error) {
        console.error("❌ Lỗi khi xóa item:", error);
        return false;
    }
}