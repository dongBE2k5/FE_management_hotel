import ImageRoom from './ImageRoom'
interface Room {
    id: number,
    roomNumber: string,
    description: string,
    status: string,
    typeRoom: string,
    hotelName: string,
    imageRoom: ImageRoom[],
    price: BigInt

}

export default Room