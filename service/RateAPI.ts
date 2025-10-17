import axios from "axios";
import Rate from "@/models/Rate";
import BaseUrl from "../constants/BaseURL";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Lấy danh sách đánh giá của 1 khách sạn
export const getRatesByHotel = async (hotelId: number): Promise<Rate[]> => {
  const res = await axios.get(`${BaseUrl}/rates/hotel/${hotelId}`); // ✅ thêm "s"
  return res.data;
};

// 🔹 Gửi đánh giá mới
export const createRate = async (data: Rate): Promise<Rate> => {
  const token = await AsyncStorage.getItem("userToken");
  const res = await axios.post(`${BaseUrl}/rates`, data, {  // ✅ đúng endpoint
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// 🔹 Lấy trung bình điểm đánh giá
export const getAverageRate = async (hotelId: number): Promise<number> => {
  const res = await axios.get(`${BaseUrl}/rates/hotel/${hotelId}/average`); // ✅ thêm "s"
  return res.data;
};


// ✅ Dành cho màn hình đánh giá từng phòng
export const getRateByUserAndRoom = async (userId: number, roomId: number): Promise<Rate | null> => {
  try {
    const res = await axios.get(`${BaseUrl}/rates/user/${userId}/room/${roomId}`);
    return res.data;
  } catch (err: any) {
    if (err.response && err.response.status === 404) return null; // chưa đánh giá
    throw err;
  }
};

