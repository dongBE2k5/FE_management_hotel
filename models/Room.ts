import ImageRoom from './ImageRoom'
interface Room {
  id: number;
  roomNumber: string;
  description: string;
  status: string;
  hotel?: {
    id: number;
    name: string;
  };
  hotelId?: number; // vẫn giữ lại nếu backend có lúc trả field này
  typeRoom: string;
  hotelName?: string;
  imageRoom: ImageRoom[];
  price: bigint;
  typeOfRoomId: number;
    id: number,
    roomNumber: string,
    description: string,
    status: string,
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