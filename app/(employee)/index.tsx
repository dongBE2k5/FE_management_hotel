import ListRoom from "@/components/employee_staff/screen/listRoom";

import BookingDetail from "@/components/employee_staff/screen/bookingDetail";
import checkout from "@/components/employee_staff/screen/checkOut";
import { EmployeeStackParamList } from "@/types/navigation";
import { createStackNavigator } from '@react-navigation/stack';
import { View } from "react-native";
import PaymentWebViewScreen from "@/components/payment/PaymentWebViewScreen";
import PaymentListScreen from "@/components/employee_staff/screen/PaymentListScreen";


const Stack = createStackNavigator<EmployeeStackParamList>();
export default function HomeLayout() {

    return (<>
        <View style={styles.container}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="listRoom" component={ListRoom} />
                <Stack.Screen name="bookingDetail" component={BookingDetail} />
                <Stack.Screen name="checkout" component={checkout} />
                      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
                      <Stack.Screen name="PaymentListScreen" component={PaymentListScreen} />
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
