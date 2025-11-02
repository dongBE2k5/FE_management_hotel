interface DamagedItemResponse {
    requestStaffId: number;
    id: number;
    roomId: number;
    roomNumber: number;
    itemId: number;
    itemName: number;
    quantityAffected: number;
    status: string;
    image: string;
    reportedBy: number;
    reportedAt: number;
    price:number;
}
export { DamagedItemResponse };