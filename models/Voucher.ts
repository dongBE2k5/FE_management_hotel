interface Voucher {
    id?: number;
    code: string;
    description: string;
    priceCondition: number;
    initialQuantity:number;
    hotelId?: number | null; 
    quantity: number;  // Tổng số voucher
    percent: number;
    used?: number;     // Số voucher đã dùng
     name: string;
     
}
export default Voucher;
