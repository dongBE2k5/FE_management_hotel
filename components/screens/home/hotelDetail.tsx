import HeaderHotelDetail from '@/components/userHotelDetail/headerHotelDetail';
import MidHotelDetail from '@/components/userHotelDetail/midHotelDetail';
import { Hotel } from '@/models/Hotel';
import RoomTypeImage from '@/models/RoomTypeImage';
import { findHotelById } from '@/service/HotelAPI';
import { getRoomTypeImageByHotel } from '@/service/RoomTypeImageAPI';
import { RootStackParamList } from '@/types/navigation';
import Ionicons from "@expo/vector-icons/Ionicons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';


type HotelDetailRouteProp = RouteProp<RootStackParamList, 'HotelDetail'>;

export default function HotelDetail() {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [hotel, sethotel] = useState<Hotel>();
  const [roomTypeImage, setRoomTypeImage] = useState<RoomTypeImage[]>([]);

  //Route
  const route = useRoute<HotelDetailRouteProp>();
    const { hotelId } = route.params;
    // console.log(`KS ${hotelId}`);
    useEffect(() => {
        
        const getHotelById = async (id: number) => {
            try {
                const data = await findHotelById(id);
                console.log(data);
                sethotel(data);
            } catch (err) {
                console.error(err);
            }
        };
        const getRoomTypeImage = async (id: number) => {
            try {
                const data = await getRoomTypeImageByHotel(id);

                setRoomTypeImage(data);
            } catch (err) {
                console.error(err);
            }
        };

        getHotelById(hotelId)
        getRoomTypeImage(hotelId)
    }, [])

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(scrollY > 100); // Thay đổi giá trị nếu cần điều chỉnh
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      {showStickyHeader && (
        <View style={styles.stickyHeader}>
          <Pressable
            onPress={() => navigation.goBack()}     // ⬅️ quay lại màn trước (HomeScreen)
            style={{
              position: "absolute",
              top: 35,
              left: 15,
              zIndex: 2,
            }}
            hitSlop={10}                            // vùng bấm rộng hơn
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </Pressable>
          <Text style={styles.stickyText}>Traveloka TDC</Text>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}             // tắt hiệu ứng bounce trên iOS
        overScrollMode="never"     // tắt hiệu ứng overscroll trên Android
      >
        {hotel && 
        <>        
        <HeaderHotelDetail hotel={hotel}/>
        <MidHotelDetail roomTypeImage={roomTypeImage} hotelId={hotelId} /> 
        </>
}
        {/* <HeaderHotelDetail hotel={hotel}/> */}
        

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconTop: { marginTop: 10 },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#009EDE',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stickyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 30
  },
});

