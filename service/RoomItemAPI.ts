import BaseUrl from "@/constants/BaseURL";
import { DamagedItemResponse } from "@/models/DamagedItem/DamagedItemReponse";
import { DamagedItemRequest } from "@/models/DamagedItem/DamagedItemRequest";
import { RoomItem } from "@/models/RoomItem";
import axios from "axios";
import { ApiResponse } from "./HostAPI";

export async function getRoomItemsByTypeRoomId(typeOfRoomId: number,hotelId:number): Promise<ApiResponse<RoomItem[]> | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/type-of-room-items/type/${typeOfRoomId}/${hotelId}`);
        console.log(`Lấy danh sách item thành công theo loại phòng id :${typeOfRoomId} `);

        return data.data;

    } catch (error) {
        return null;
    }
}
export async function createDamagedItem(damagedItemRequest: DamagedItemRequest, image: String | null): Promise<ApiResponse<null> | null> {
    try {
        const formData = new FormData();
        formData.append("data", {
            uri: "data:application/json;base64," + btoa(JSON.stringify(damagedItemRequest)),
            name: "data.json",
            type: "application/json"
        });
        if (image) formData.append("image", {
            uri: image,
            name: "damaged_item.jpg",
            type: "image/jpeg"
        } as any
        );
        const { data } = await axios.post(`${BaseUrl}/damaged-items`, formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            });
        console.log("Tạo mục hỏng hóc thành công:", data);
        return data;
    } catch (error) {
        console.error("Lỗi khi tạo mục hỏng hóc:", error);
        return null;
    }
}


export async function getRoomItemsByResquset(requestId: number): Promise<ApiResponse<DamagedItemResponse[]> | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/damaged-items/request/${requestId}`);
        console.log(`Lấy danh sách item thành công theo loại phòng id :${requestId} `);

        return data.data;

    } catch (error) {
        return null;
    }
}


export async function getRoomItemsByBooking(bookingId: number): Promise<ApiResponse<DamagedItemResponse[]> | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/damaged-items/booking/${bookingId}`);
        console.log(`Lấy danh sách item thành công theo loại phòng id :${bookingId} `);

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