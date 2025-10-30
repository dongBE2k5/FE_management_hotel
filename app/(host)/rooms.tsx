import AddRoomScreen from '@/components/host/modal/room/AddRoomScreen';
import ManageRoomTypesScreen from '@/components/host/screen/room/ManageRoomTypesScreen';
import ManageServicesScreen from '@/components/host/screen/room/ManageServicesScreen';
import RoomDetailScreen from '@/components/host/screen/room/RoomDetailScreen';
import RoomListScreen from '@/components/host/screen/room/RoomListScreen';
import { HostStackParamList } from '@/types/navigation';
import { createStackNavigator } from '@react-navigation/stack';

import { View } from 'react-native';

const Stack = createStackNavigator<HostStackParamList>();


export default function RoomNavigator() {

    return (
        <>
            <View style={styles.container}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="RoomList" component={RoomListScreen} />
                        <Stack.Screen name="AddRoom" component={AddRoomScreen} />
                        <Stack.Screen name="ManageRoomTypes" component={ManageRoomTypesScreen} />
                        <Stack.Screen name="ManageServices" component={ManageServicesScreen} />
                        <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
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