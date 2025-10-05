import ConfirmBooking from '@/components/ConfirmBooking';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

export default function HotelDetail() {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ReviewBooking'>>();

  // 👇 Lấy dữ liệu từ FormBooking (đã navigate sang ReviewBooking)
  const {
    hotelName,
    roomName,
    checkIn,
    checkOut,
    nights,
    roomPrice,
    taxFee,
    insuranceSelected,
    insurancePrice,
    specialRequests,
    specialRequestPrice,
  } = route.params;

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(scrollY > 100);
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: '#009EDE', marginBottom: 10 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            top: 40,
            left: 15,
            zIndex: 2,
          }}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </Pressable>
        <Text style={styles.stickyText}>Xem lại đơn đặt phòng</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        {/* ✅ Truyền toàn bộ dữ liệu xuống ConfirmBooking qua props */}
       <ConfirmBooking />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeededff',
  },
  scrollView: {
    flex: 1,
  },
  stickyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 40,
    paddingBottom: 10,
    textAlign: 'center',
  },
});
