import BookedList from '@/components/userBooking/BookedList';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';


const Stack = createStackNavigator();

export default function BookingNavigator() {
  return (
    //a
    <BookedList />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
