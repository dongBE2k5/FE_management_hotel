// @/models/Item.ts

/**
 * Model Item (Khớp với ItemResponseDTO từ backend)
 * Dùng để hiển thị trong state của React
 */
export interface Item {
    id: number;
    name: string;
    price: number | null;
    hotelId: number; 
}

/**
 * DTO (Data Transfer Object) dùng khi gọi API TẠO MỚI.
 * Khớp 100% với ItemRequestDTO của backend.
 */
export interface ItemCreateDTO {
    name: string;
    price: number;
    hotelId: number;   // !!! Backend của bạn dùng 'hotelId' trong DTO hay 'HotelId'?
                       // Code trước của bạn là 'HotelId' (viết hoa)
}
// export interface ItemUpdateDTO {
//     name: string;
//     price: number;
// }