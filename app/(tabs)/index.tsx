// App.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import Header from '@/components/header';
import VoucherZone from '@/components/voucherzone';
import ZoneHotel from '@/components/zoneHotel';
import ConfirmBooking from '@/components/ConfirmBooking';
import RoomCard from '@/components/roomCard';
import HotelDetail from '@/components/screens/hotelDetail';
import FormBooking from '@/components/screens/formBooking';
import ReviewBooking from '@/components/screens/reviewBooking';

import { createStackNavigator } from '@react-navigation/stack';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

function HomeScreen() {
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(scrollY > 100);
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      {showStickyHeader && (
        <View style={styles.stickyHeader}>
          <Text style={styles.stickyText}>Traveloka TDC</Text>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        overScrollMode="never"
      >
        <Header />
        <VoucherZone />
        <ZoneHotel />
      </ScrollView>
    </View>
  );
}

// ❗️Không bọc NavigationContainer ở đây nữa
export default function App() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetail} />
      <Stack.Screen name="RoomCard" component={RoomCard} />
      <Stack.Screen name="FormBooking" component={FormBooking} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBooking} />
      <Stack.Screen name="ReviewBooking" component={ReviewBooking} />

    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollView: { flex: 1 },
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stickyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 30,
  },
});
