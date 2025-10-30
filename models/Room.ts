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
}

export default Room