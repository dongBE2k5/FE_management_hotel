import AddRoomScreen from '@/components/host/modal/room/AddRoomScreen';
import ListStaffHotel from '@/components/host/screen/employee/ListStaffHotel';
import ManageRoomTypesScreen from '@/components/host/screen/room/ManageRoomTypesScreen';
import ManageServicesScreen from '@/components/host/screen/room/ManageServicesScreen';
import RoomDetailScreen from '@/components/host/screen/room/RoomDetailScreen';
import RoomListScreen from '@/components/host/screen/room/RoomListScreen';
import { HostStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';

import { View } from 'react-native';

const Stack = createStackNavigator<HostStackParamList>();


export default function DemoNavigator() {

    return (
        <>
            <View style={styles.container}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="ListStaffHotel" component={ListStaffHotel} />
                        
                                     
                    </Stack.Navigator>
            </View>
        </>


    );
}
const styles = {
    container: {
        flex: 1,
        paddingTop: 50,
        backgroundColor: '#f0f0f0',
    }
}