import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import Header from '@/components/userHome/header';
import { getSavedHotels, getSavedHotelsByLocation, removeSavedHotel } from '@/service/SavedHotelAPI';
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
  const [hasAnySaved, setHasAnySaved] = useState<boolean>(false);

  // Hàm load lại danh sách khách sạn đã lưu
  const loadSavedHotels = async (userId: number, locationId: number | null = selectedLocationId) => {
    setLoading(true);
    try {
      let hotels: Hotel[] = [];
      if (!locationId || locationId === 0) {
        hotels = await getSavedHotels(userId);
      } else {
        hotels = await getSavedHotelsByLocation(userId, locationId);
      }
      setSavedHotels(hotels);
      if (hotels.length > 0) setHasAnySaved(true);
    } catch (err) {
      console.error('❌ Lỗi khi load lại khách sạn:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) return;
        const id = Number(storedUserId);
        setUserId(id);
        await loadSavedHotels(id);

        const locs = await getAllLocation();
        setLocations([{ id: 0, name: 'Tất cả' } as LocationModel, ...locs]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Hủy lưu khách sạn
  const handleUnsave = async (hotelId: number) => {
    if (!userId) return;
    try {
      await removeSavedHotel(userId, hotelId);
      await loadSavedHotels(userId); // reload danh sách
    } catch (err) {
      console.error(' Lỗi khi hủy lưu khách sạn:', err);
    }
  };

//ghaweawwt auuhawrjbtg hjt
  // Filter theo location
  const handleLocationChange = async (locationId: number | null) => {
    if (!userId) return;
    setSelectedLocationId(locationId);
    await loadSavedHotels(userId, locationId);
  };

  const handleNavigation = (hotelId: number) => {
    navigation.navigate('HotelDetail', { hotelId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <Text style={{ margin: 10, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
        Khách sạn đã lưu
      </Text>

      {hasAnySaved && (
        <LocationSelector locations={locations} changeLocation={handleLocationChange} />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          {savedHotels.length > 0 ? (
            savedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                data={hotel}
                handleNavigations={handleNavigation}
                handleUnsave={handleUnsave}
              />
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
