import ListRoom from "@/components/employee_staff/screen/listRoom";

import BookingDetail from "@/components/employee_staff/screen/bookingDetail";
import checkout from "@/components/employee_staff/screen/checkOut";
import { CleningEmployee, EmployeeStackParamList } from "@/types/navigation";
import { createStackNavigator } from '@react-navigation/stack';
import { View } from "react-native";
import CleaningStaffScreen from "@/components/cleaningStaff/screen/CleaningStaffScreen";
import CheckRoomScreen from "@/components/cleaningStaff/screen/CheckRoomScreen";


const Stack = createStackNavigator<CleningEmployee>();
export default function HomeLayout() {

    return (<>
        <View style={styles.container}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="CleaningStaffScreen" component={CleaningStaffScreen} />
                <Stack.Screen name="CheckRoomScreen" component={CheckRoomScreen} />
                
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
