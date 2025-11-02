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