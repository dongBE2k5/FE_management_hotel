import BaseUrl from "@/constants/BaseURL";
import axios from "axios";


async function getHotelPaymentTypesByHotelIdAndTypeOfRoomId(hotelId: number, typeOfRoomId: number) {
    const response = await axios.get(`${BaseUrl}/hotel-payment-type/hotel/${hotelId}/type-of-room/${typeOfRoomId}`);
    if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Hotel payment types by hotel id and type of room id:", response.data);
    return response.data;
}

async function createHotelPaymentType(hotelId: number, paymentTypeId: number, depositPercent: number, selectedRoomType: number[]) {
    try {
      const response = await axios.post(`${BaseUrl}/hotel-payment-type`, {
        hotelId: hotelId,
        paymentTypeId:paymentTypeId,
        depositPercent: depositPercent,
        roomTypeIds: selectedRoomType
      });
  
      // 201 Created hoặc 200 OK đều là hợp lệ
      if (response.status === 200 || response.status === 201) {
        console.log("Hotel payment type created:", response.data);
        return response.data;
      }
  
      throw new Error(`Unexpected status: ${response.status}`);
      
    } catch (err: any) {
      // ✅ Nếu server có trả response (như 409)
      if (err.response) {
        const backendMessage = err.response.data?.message || "Có lỗi xảy ra từ server";
        console.error("API Error:", backendMessage);
        throw new Error(backendMessage);
      }
  
      // ❌ Không có phản hồi từ server
      if (err.request) {
        console.error("No response received from server");
        throw new Error("Không nhận được phản hồi từ server!");
      }
  
      // ⚠ Lỗi khác
      console.error("Error:", err.message);
      throw new Error(err.message);
    }
  }
  async function updateHotelPaymentType(hotelId: number, paymentTypeId: number, depositPercent: number, selectedRoomType: number[]) {
    try {
    const response = await axios.put(`${BaseUrl}/hotel-payment-type`, {
      hotelId: hotelId,
      paymentTypeId: paymentTypeId,
      depositPercent: depositPercent,
      roomTypeIds: selectedRoomType
      });
      if (response.status === 200 || response.status === 201) {
        console.log("Hotel payment type updated:", response.data);
        return response.data;
      }
  
      throw new Error(`Unexpected status: ${response.status}`);
    } catch (err: any) {
      if (err.response) {
        const backendMessage = err.response.data?.message || "Có lỗi xảy ra từ server";
        console.error("API Error:", backendMessage);
        throw new Error(backendMessage);
      }
  
      // ❌ Không có phản hồi từ server
      if (err.request) {
        console.error("No response received from server");
        throw new Error("Không nhận được phản hồi từ server!");
      }
  
      // ⚠ Lỗi khác
      console.error("Error:", err.message);
      throw new Error(err.message);
    }
  }

  async function deleteHotelPaymentType(id: number) {
    try {
    const response = await axios.delete(`${BaseUrl}/hotel-payment-type/${id}`);
    if (response.status === 200 || response.status === 201) {
      console.log("Hotel payment type deleted:", response.data);
      return response.data;
    }
    throw new Error(`Unexpected status: ${response.status}`);
    } catch (err: any) {
      console.error("Error:", err.message);
      throw new Error(err.message);
    }
  }
  

export { createHotelPaymentType, deleteHotelPaymentType, getHotelPaymentTypesByHotelIdAndTypeOfRoomId, updateHotelPaymentType };

