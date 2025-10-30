interface Utility {
    status: number;
    message: string;    
    data: UtilityItem[];
    timestamp: Date;
}
interface UtilityItem { 
    id: number;
    name: string;
    image: string;
    type: string;
    isUsed: string;
    price: number;
    quantity: number;
}

export { Utility, UtilityItem };
