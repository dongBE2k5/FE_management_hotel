import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import Header from '@/components/userHome/header';
import { getSavedHotels, getSavedHotelsByLocation } from '@/service/SavedHotelAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hotel } from '@/models/Hotel';
import HotelCard from '@/components/userHome/hotelCard';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';
import HotelDetail from '@/components/screens/home/hotelDetail';
import LocationSelector from '@/components/userHome/location';
import { getAllLocation } from '@/service/LocationAPI'; // ✅ API lấy danh sách địa điểm
import type LocationModel from '@/models/Location';

const Stack = createStackNavigator();
type SavedNavigationProp = StackNavigationProp<RootStackParamList, 'Saved'>;

function Saved() {
  const navigation = useNavigation<SavedNavigationProp>();
  const [savedHotels, setSavedHotels] = useState<Hotel[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [hasAnySaved, setHasAnySaved] = useState<boolean>(false); // ✅ Thêm state này

  //  Lấy danh sách khách sạn đã lưu ban đầu + danh sách địa điểm
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = Number(storedUserId);
          setUserId(id);

          // Lấy danh sách khách sạn đã lưu ban đầu
          const hotels = await getSavedHotels(id);
          setSavedHotels(hotels);
          if (hotels && hotels.length > 0) setHasAnySaved(true); // ✅ Ghi nhớ người dùng có KS đã lưu
        }

        // Lấy danh sách địa điểm
        const locs = await getAllLocation();
        const allLocations = [
          { id: 0, name: 'Tất cả' } as LocationModel,
          ...locs,
        ];
        setLocations(allLocations);
      } catch (err) {
        console.error('Lỗi khi load dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Khi chọn địa điểm => lọc danh sách khách sạn đã lưu
  const handleLocationChange = async (locationId: number | null) => {
    if (!userId) return;
    setLoading(true);
    try {
      let hotels: Hotel[] = [];

      if (locationId === null || locationId === 0) {
        hotels = await getSavedHotels(userId);
      } else {
        hotels = await getSavedHotelsByLocation(userId, locationId);
      }

      setSavedHotels(hotels);
      setSelectedLocationId(locationId);

      // 🧠 Nếu user chọn location khác mà không có KS, hasAnySaved vẫn TRUE (vì đã từng có)
      if (hotels.length > 0) setHasAnySaved(true);
    } catch (err) {
      console.error('Lỗi khi lọc khách sạn theo địa điểm:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (hotelId: number) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Text
        style={{
          margin: 10,
          fontSize: 18,
          fontWeight: 'bold',
          color: '#333',
        }}
      >
        Khách sạn đã lưu
      </Text>

      {/* ✅ Bộ lọc theo địa điểm — chỉ hiện khi người dùng đã từng lưu ít nhất 1 khách sạn */}
      {hasAnySaved && (
        <LocationSelector
          locations={locations}
          changeLocation={handleLocationChange}
        />
      )}

      {/* Hiển thị danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {savedHotels.length > 0 ? (
            savedHotels.map((hotel) => (
              <HotelCard key={hotel.id} data={hotel} handleNavigations={handleNavigation} />
            ))
          ) : (
            <Text style={{ margin: 20, color: '#888' }}>
              Bạn chưa lưu khách sạn nào ở địa điểm này.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

export default function SavedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Saved" component={Saved} />
      <Stack.Screen name="HotelDetail" component={HotelDetail} />
    </Stack.Navigator>
  );
}
