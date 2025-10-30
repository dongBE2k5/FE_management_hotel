
import { createStackNavigator } from '@react-navigation/stack';
import { View } from "react-native";

import CameraCaptureScreen from "@/components/host/screen/CameraCaptureView";
import CCCDScannerScreen from "@/components/host/screen/CCCDScannerScreen";
import { HostStack } from "@/types/navigation";


// const Stack = createStackNavigator<EmployeeStackParamList>();
// export default function HomeLayout() {

//     return (<>
//         <View style={styles.container}>

//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name="hotelList" component={HotelList} />
//                 <Stack.Screen name="hostBookings" component={HostBookings} />
//                 <Stack.Screen name="hotelEdit" component={EditHotel} />
//                 <Stack.Screen name="CreateHotel" component={CreateHotel} />
//                 <Stack.Screen name="bookingDetail" component={BookingDetail} />
//                 <Stack.Screen name="checkout" component={checkout} />
//             </Stack.Navigator>

//         </View>
//     </>

//     )
// }




const Stack = createStackNavigator<HostStack>();
export default function HomeLayout() {

    return (<>
        <View style={styles.container}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* <Stack.Screen name="CCCDScanner" component={CCCDScanner} /> */}
                <Stack.Screen name="CCCDScannerScreen" component={CCCDScannerScreen} />
                <Stack.Screen name="CameraCaptureView" component={CameraCaptureScreen} />
                {/* <Stack.Screen name="KycFormScreen" component={KycFormScreen} /> */}
            </Stack.Navigator>
        </View>
    </>

    )
}

const styles = {
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#f0f0f0',
    }
}
