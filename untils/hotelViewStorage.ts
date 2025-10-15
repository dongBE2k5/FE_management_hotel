// utils/hotelViewStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIEWED_HOTELS_KEY = 'viewed_hotels';

export const saveViewedHotel = async (hotel: any) => {
  try {
    const jsonValue = await AsyncStorage.getItem(VIEWED_HOTELS_KEY);
    let viewedHotels = jsonValue ? JSON.parse(jsonValue) : [];

    // Kiểm tra trùng id
    const exists = viewedHotels.some((h: any) => h.id === hotel.id);
    if (!exists) {
      viewedHotels.unshift(hotel); // thêm mới lên đầu
      // Giới hạn tối đa 10 khách sạn đã xem
      if (viewedHotels.length > 10) viewedHotels.pop();
      await AsyncStorage.setItem(VIEWED_HOTELS_KEY, JSON.stringify(viewedHotels));
    }
  } catch (e) {
    console.error('Lỗi lưu khách sạn đã xem:', e);
  }
};

export const getViewedHotels = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(VIEWED_HOTELS_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Lỗi lấy danh sách khách sạn đã xem:', e);
    return [];
  }
};
