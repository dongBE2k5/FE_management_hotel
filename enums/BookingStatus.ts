const BookingStatus = (num: number): string => {
    switch (num) {
        case 0:
            return 'CHUA_THANH_TOAN';
        case 1:
            return 'DA_THANH_TOAN';
        case 2:
            return 'DA_COC';
        case 3:
            return 'CHECK_IN';
        case 4:
            return 'CHECK_OUT';
        case 5:
            return 'DA_HUY';
        default:
            return 'KHONG_XAC_DINH';
    }
};

export default BookingStatus;
