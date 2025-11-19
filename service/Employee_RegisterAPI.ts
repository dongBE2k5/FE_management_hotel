import BaseUrl from "@/constants/BaseURL";
import { Employee } from "@/models/Employee";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterEmployee } from "@/models/RegisterEmployee";

// ... (Các hàm getEmployeeByUser, getEmployeeByHotel...) ...

/**
 * Hàm đăng ký nhân viên, không cần token
 * @param employeeData Dữ liệu nhân viên (tương ứng @RequestBody)
 * @param hotelId ID của khách sạn (tương ứng @RequestParam)
 */
export async function registerEmployee(
  employeeData: RegisterEmployee,
  hotelId: number
): Promise<{ data: any | null; message: string }> {
  
  const API_URL = `${BaseUrl}/auth/register-employee`;

  try {
    console.log("📤 Đang gửi request:", employeeData, "cho hotelId:", hotelId);

    // Gửi request với config "params" rõ ràng
    const { data } = await axios.post(
      API_URL,      // 1. URL
      employeeData, // 2. Body (@RequestBody)
      {
        // 3. Config (@RequestParam)
        params: {
          hotelId: hotelId 
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Tạo nhân viên thành công cho hotelId=${hotelId}:`, data);
    return { data, message: "Tạo nhân viên thành công!" };

  } catch (error: any) {
    console.error(`❌ Lỗi khi tạo nhân viên cho hotelId=${hotelId}:`, error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("❌ Status:", error.response.status, "Data:", error.response.data);
        return {
          data: null,
          message: error.response.data?.message || error.response.data || "Server phản hồi lỗi.",
        };
      }
      if (error.request) {
        return { data: null, message: "Không thể kết nối đến máy chủ." };
      }
    }
    return { data: null, message: error.message || "Lỗi không xác định." };
  }
}