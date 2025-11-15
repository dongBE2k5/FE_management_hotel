interface Voucher {
    id?: number;
    code: string;
    name: string;
    description: string;
    priceCondition: number;
    hotelId?: number | null; 
    quantity: number;  // Tổng số voucher
    percent: number;
    used?: number;     // Số voucher đã dùng
    initialQuantity:number;
    active: boolean;
     
}
export default Voucher;
