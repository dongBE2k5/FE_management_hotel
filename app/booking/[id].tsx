import BookingDetailScreen from '@/components/userBooking/BookedDetail';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';

export default function bookingdetail() {
  const { id } = useLocalSearchParams();
  const bookingId = Number(id);
  console.log(bookingId);
  
  return (
    <ScrollView>
      <BookingDetailScreen bookingId={bookingId}/>
    </ScrollView>
  )
}
export const options = {
    headerShown: false,
  };