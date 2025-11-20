import ImageRoom from "../ImageRoom";
interface TypeOfRoomResponse {
    status: number;
    message: string;
    data: TypeOfRoom[];
}

interface TypeOfRoom {
    id: number;
    room: string;
    imageRooms: ImageRoom[];
}


export default TypeOfRoomResponse