
import BookingDetail from "@/components/employee_staff/screen/bookingDetail";
import checkout from "@/components/employee_staff/screen/checkOut";
import HostBookings from "@/components/host/screen/bookings/HostBookings";
import CreateHotel from "@/components/host/screen/hotel/CreateHotel";
import EditHotel from "@/components/host/screen/hotel/EditHotel";
import HotelList from "@/components/host/screen/hotel/HotelList";
import { EmployeeStackParamList } from "@/types/navigation";
import { createStackNavigator } from '@react-navigation/stack';
import { View } from "react-native";



const Stack = createStackNavigator<EmployeeStackParamList>();
export default function HomeLayout() {

    return (<>
        <View style={styles.container}>

                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="hotelList" component={HotelList} />
                    <Stack.Screen name="hostBookings" component={HostBookings} />
                    <Stack.Screen name="hotelEdit" component={EditHotel} />
                    <Stack.Screen name="CreateHotel" component={CreateHotel} />
                    <Stack.Screen name="bookingDetail" component={BookingDetail} />
                    <Stack.Screen name="checkout" component={checkout} />
                </Stack.Navigator>

        </View>
    </>

    )
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    }
}
