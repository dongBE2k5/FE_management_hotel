import BaseUrl from "@/constants/BaseURL";
import { Employee } from "@/models/Employee";
import axios from "axios";



export async function getEmployeeByUser(
    userID: number
): Promise<Employee | null>  {
    try {
        const response = await axios.get(`${BaseUrl}/employee/${userID}/user`)
        console.log(`Employee id = ${userID} :`, response.data);
        return response.data
    } catch (error) {
        console.error(`❌ Lỗi khi lấy employee id=${userID}:`, error);
        return null;
    }

}
export async function getEmployeeByHotel(hotelId: number): Promise<Employee[] | null> {
    try {
        const { data } = await axios.get(`${BaseUrl}/employee/${hotelId}/hotel`);
        console.log(`✅ Lấy employee theo hotelId=${hotelId}:`, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error(`❌ Lỗi lấy employee theo hotelId=${hotelId}:`, error);
        return null;
    }
}