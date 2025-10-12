interface Payment {
    id:number
    method: string;
    total: number;
    status: string;
    bookingId: number;
    transactionStatus: string;
}
export default Payment;

