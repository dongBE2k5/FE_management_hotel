interface DamagedItemRequest {
    roomId: number;
    itemId: number;
    quantityAffected: number;
    status: string;
    image: null | string;
    reportedBy: number;
    requestStaffId: number;
    bookingId: number;
}
export { DamagedItemRequest };

