interface HotelUtilityResquest {
    hotelId: number;
    utilities: UtilityItem[];
}

interface UtilityItem {
    utilityId: number;
    price: number;
}

export default HotelUtilityResquest;