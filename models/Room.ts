import ImageRoom from './ImageRoom'
interface Room {
  id: number;
  roomNumber: string;
  description: string;
  status: string;
  hotelId?: number; // vẫn giữ lại nếu backend có lúc trả field này
  hotelName?: string;
  typeOfRoomId: number;
    typeRoom: string,
    hotel: HotelItem,
    imageRoom: ImageRoom[],
    price: BigInt

}

interface HotelItem {
    id: number,
    name: string,
}

export default Room