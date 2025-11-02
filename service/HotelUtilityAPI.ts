import BaseUrl from "@/constants/BaseURL";
import { Utility } from "@/models/Utility/Utility";
import axios from "axios";

// async function getUtilityByHotel(id: number): Promise<HotelUtilityResquest> {
//     // Dùng axios để gọi API
//     console.log(`${BaseUrl}/hotel-utility/hotel/${id}/utility/OUTROOM`);
    
//     const res = await axios.get(`${BaseUrl}/hotel-utility/hotel/${id}/utility/OUTROOM`);

//     // if (res.status !== 200) {
//     //     throw new Error(`HTTP error! status: ${res.status}`);
//     // }
//     console.log(res.data);
//     const data: HotelUtilityResquest = res.data;
//     console.log(data);
//     return data;
//   }
  async function getUtilityByHotel(id: number): Promise<Utility> {
    const res = await fetch(`${BaseUrl}/utility/hotel/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  
    // ép kiểu dữ liệu trả về
    const data: Utility = await res.json();
    console.log(data);
    return data;
  } 

  async function getAllUtilityByType(type: string): Promise<Utility> {
    console.log(`${BaseUrl}/utility/type/${type}`);
    const res = await fetch(`${BaseUrl}/utility/type/${type}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: Utility = await res.json();
    console.log(data);
    return data;
  }

  async function updateUtilityOfHotel(id: number, formData: FormData) {

    const response = await axios.put(
      `${BaseUrl}/utility/${id}`, // ⚠️ sửa URL backend của bạn
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("response", response);
  
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    console.log("HotelUtility gửi thành công:", response.data);
    return response.data;
  }

  async function createUtilityOfHotel(formData: FormData) {

    const response = await axios.post(
      `${BaseUrl}/utility`, // ⚠️ sửa URL backend của bạn
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("response", response);
  
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    console.log("HotelUtility gửi thành công:", response.data);
    return response.data;
  }

  async function getUtilityOfHotel(hotelId: number): Promise<Utility> {
    const res = await fetch(`${BaseUrl}/hotel-utility/hotel/${hotelId}/utility/OUTROOM`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: Utility = await res.json();
    console.log(data);
    return data;
  }

  async function deleteUtilityOfHotel(id: number) {
    const response = await axios.delete(`${BaseUrl}/utility/${id}`);
    console.log("response", response);
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.data;
  }

  async function getUtilityOfHotelById(id: number) {
    const response = await axios.get(`${BaseUrl}/type-of-room-utility/utility/${id}`);
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Utility of hotel by id:", response.data);
    return response.data;
  }

  async function updateUtilityOfHotelById(id: number, typeOfRoom: { typeOfRoomId: number, utilityId: number }[]) {
    const response = await axios.put(`${BaseUrl}/type-of-room-utility/${id}`, typeOfRoom);
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("response", response);
    return response.data;
  }

  async function getTypeOfRoomUtilityOfHotelByHotelIdAndType(hotelId: number, type: string) {
    const response = await axios.get(`${BaseUrl}/type-of-room-utility/hotel/${hotelId}/type/${type}`);
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Utility of hotel by hotel id and type:", response.data);
    return response.data;
  }

  async function getUtilityOfHotelByHotelIdAndType(hotelId: number, type: string) {
    const response = await axios.get(`${BaseUrl}/utility/hotel/${hotelId}/type/${type}`);
    if (!response.status) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("Utility of hotel by hotel id and type:", response.data);
    return response.data;
  }
  
  
  export { createUtilityOfHotel, deleteUtilityOfHotel, getAllUtilityByType, getTypeOfRoomUtilityOfHotelByHotelIdAndType, getUtilityByHotel, getUtilityOfHotelByHotelIdAndType, getUtilityOfHotelById, updateUtilityOfHotel, updateUtilityOfHotelById };

