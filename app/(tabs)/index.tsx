// App.tsx
import ConfirmBooking from '@/components/ConfirmBooking';
import Header from '@/components/header';
import FormBooking from '@/components/screens/home/formBooking';
import HotelDetail from '@/components/screens/home/hotelDetail';
import ReviewBooking from '@/components/screens/home/reviewBooking';
import VoucherZone from '@/components/voucherzone';
import ZoneHotel from '@/components/zoneHotel';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Login from '@/components/Login';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();


export function HomeScreen() {
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
        
        <View style={styles.search}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Bạn muốn tìm khách sạn?"
              placeholderTextColor="#000000"
            />
            <Ionicons name="search" size={20} color="#0077c7ff" />

          </View>
          <View style={styles.searchOptions}>
            <View style={styles.optionContainer}>
              <View style={[styles.ItemSearch, { backgroundColor: colors.khachsan }]}>
                <Ionicons name="bed" size={24} color="#000" />
              </View>
              <Text style={styles.itemText}>Khách sạn</Text>
            </View>

            <View style={styles.optionContainer}>
              <View style={[styles.ItemSearch, { backgroundColor: colors.tienich }]}>
                <Ionicons name="settings" size={24} color="#000" />
              </View>
              <Text style={styles.itemText}>Tiện ích</Text>
            </View>

            <View style={styles.optionContainer}>
              <View style={[styles.ItemSearch, { backgroundColor: colors.khuyenmai }]}>
                <Ionicons name="pricetag" size={24} color="#000" />
              </View>
              <Text style={styles.itemText}>Khuyến mãi</Text>
            </View>

            <View style={styles.optionContainer}>
              <View style={[styles.ItemSearch, { backgroundColor: colors.noibat }]}>
                <Ionicons name="star" size={24} color="#000" />
              </View>
              <Text style={styles.itemText}>Nổi bật</Text>
            </View>
          </View>

        </View>

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
      {/* <Stack.Screen name="RoomCard" component={RoomCard} /> */}
      <Stack.Screen name="FormBooking" component={FormBooking} />
      <Stack.Screen name="ConfirmBooking" component={ConfirmBooking} />
      <Stack.Screen name="ReviewBooking" component={ReviewBooking} />
      <Stack.Screen name="Login" component={Login} />

    </Stack.Navigator>
  );
}

const colors = {
  khachsan: '#4CAF50',
  noibat: '#2196F3',
  khuyenmai: '#FF9800',
  tienich: '#E91E63',
};

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
  search: {
    borderRadius: 40,
    backgroundColor: 'white',
    paddingBottom: 40,
    marginLeft: 15,
    marginRight: 15,
    transform: [{ translateY: -40 }],

    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,

    // Elevation cho Android
    elevation: 8,
  }

  ,
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d0d0d0ff',
    borderRadius: 50,
    marginTop: 30,
    marginHorizontal: 50,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#000',
    paddingVertical: 0,
  },
  searchOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 35,
  },

  optionContainer: {
    alignItems: 'center',
    width: 65,          // độ rộng cố định để các ô đều nhau
  },

  ItemSearch: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
  },

  itemText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    color: '#000',
  }

});
