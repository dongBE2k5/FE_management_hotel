import BookedList from '@/components/userBooking/BookedList';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';


const Stack = createStackNavigator();

// export default function Booking() {
//   const [showStickyHeader, setShowStickyHeader] = useState(false);

//   const params = useLocalSearchParams<{
//     hotelName?: string;
//     checkIn?: string;
//     checkOut?: string;
//     nights?: string;
//     roomPrice?: string;
//     taxFee?: string;
//     insuranceSelected?: string;
//     insurancePrice?: string;
//     specialRequests?: string;
//     specialRequestPrice?: string;
//     totalPrice?: string;
//     isPaid?: string;
//   }>();

//   // Khi cuộn vượt quá 100px thì hiển thị header
//   const handleScroll = (event: any) => {
//     const scrollY = event.nativeEvent.contentOffset.y;
//     setShowStickyHeader(scrollY > 10);
//   };

//   return (
//     <View style={styles.container}>
//       {/* Sticky Header (hiện khi scroll xuống) */}
//       {showStickyHeader && (
//         <View style={styles.stickyHeader}>
//           <Text style={styles.stickyText}>Traveloka TDC</Text>
//         </View>
//       )}

//       {/* Nội dung cuộn */}
//       <ScrollView
//         style={styles.scrollView}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//         bounces={false}
//         overScrollMode="never"
//       >
//         <Header />
//         <BookedList />
//         {/* <BookingDetail routeParams={params} /> */}
//       </ScrollView>
//     </View>
//   );
// }
export default function BookingNavigator() {
  return (
    // <Stack.Navigator screenOptions={{ headerShown: false }}>
    //   <Stack.Screen name="index" component={BookedList} />
    //   <Stack.Screen name="bookingdetail" component={BookingDetailScreen} />
    // </Stack.Navigator>
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
