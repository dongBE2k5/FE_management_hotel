import ImageRoom from './ImageRoom'
interface Room {
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