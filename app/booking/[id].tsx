import BookingDetailScreen from '@/components/userBooking/BookedDetail';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function BookingDetail() {
  const { id } = useLocalSearchParams();
  const bookingId = Number(id);
  console.log("bookingId", bookingId);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView>
        <BookingDetailScreen bookingId={bookingId} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

export const options = {
  headerShown: false,
};
