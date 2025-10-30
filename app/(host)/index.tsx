
import CCCDScanner from "@/components/host/CCCDScanner";
import CameraCaptureScreen from "@/components/host/screen/CameraCaptureView";
import KycFormScreen from "@/components/host/screen/CCCDScannerScreen";
import CCCDScannerScreen from "@/components/host/screen/CCCDScannerScreen";
import { HostStack } from "@/types/navigation";
import { createStackNavigator } from '@react-navigation/stack';
import { View } from "react-native";


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
