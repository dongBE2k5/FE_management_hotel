import React from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '@/components/header';
import BookingDetail from '@/components/bookingDetail';
import { useLocalSearchParams } from 'expo-router';

export default function Booking() {
  const params = useLocalSearchParams<{
    hotelName?: string;
    checkIn?: string;
    checkOut?: string;
    nights?: string;
    roomPrice?: string;
    taxFee?: string;
    insuranceSelected?: string;
    insurancePrice?: string;
    specialRequests?: string;
    specialRequestPrice?: string;
    totalPrice?: string;
    isPaid?: string;
  }>();

  return (
    <View style={{ flex: 1,backgroundColor:'#fff' }}>
      <Header />
      <BookingDetail routeParams={params} />
    </View>
  );
}

const styles = StyleSheet.create({});
