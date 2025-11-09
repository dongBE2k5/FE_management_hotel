import BaseUrl from "@/constants/BaseURL";
import { DamagedItemResponse } from "@/models/DamagedItem/DamagedItemReponse";
import { DamagedItemRequest } from "@/models/DamagedItem/DamagedItemRequest";
import { RoomItem } from "@/models/RoomItem";
import axios from "axios";
import { ApiResponse } from "./HostAPI";

export async function getRoomItemsByTypeRoomId(typeOfRoomId: number): Promise<ApiResponse<RoomItem[]> | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/type-of-room-items/type/${typeOfRoomId}`);
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