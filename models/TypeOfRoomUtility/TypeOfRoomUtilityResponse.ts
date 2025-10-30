interface TypeOfRoomUtilityResponse {
    status: number;
    message: string;
    data: TypeOfRoomUtility[];
    timestamp: Date;
}
interface TypeOfRoomUtility {
    id: number;
    utilityName: string;
    imageUrl: string;
    price: string;
    typeOfRoomId: number;
    typeOfRoom: string;
}

export { TypeOfRoomUtility, TypeOfRoomUtilityResponse };

