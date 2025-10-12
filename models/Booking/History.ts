
interface History {
    id: number;
    bookingId: number;
    oldStatus: string;
    newStatus: string;
    changedBy?: number;
    createdAt: Date;
}   
export default History;