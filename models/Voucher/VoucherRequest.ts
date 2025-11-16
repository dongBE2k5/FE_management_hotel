interface VoucherRequest {
    code: string;
    name: string;
    description: string;
    priceCondition: number;
    hotelId: number;
    quantity: number;
    percent: number;
    initialQuantity: number;
    active: boolean;
}

export default VoucherRequest;
