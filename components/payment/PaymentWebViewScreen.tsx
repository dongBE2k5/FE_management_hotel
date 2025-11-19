import { router } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PaymentWebViewScreen({ route, navigation }) {
    const { url } = route.params;
    console.log("url", url);
    useEffect(() => {
        // Ẩn tab bar khi vào màn hình
        navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });

        return () => {
            // Hiện tab lại khi thoát
            navigation.getParent()?.setOptions({ tabBarStyle: undefined });
        };
    }, []);
    return (
        <View style={{ flex: 1 }}>

            {/* Nút đóng */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                    position: "absolute",
                    top: 40,
                    right: 20,
                    zIndex: 10,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 30,
                }}
            >
                <Text style={{ color: "#fff", fontSize: 14 }}>Đóng</Text>
            </TouchableOpacity>

            {/* Khung WebView */}
            <View
                style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: "white",
                    overflow: "hidden",
                    elevation: 5,
                    padding:20
                }}
            >
                <WebView
                    source={{ uri: url }}
                    onNavigationStateChange={(navState) => {
                        console.log("URL thay đổi:", navState.url);

                        if (navState.url.startsWith("exp://")) {
                            console.log("Đã bắt được deep link VNPAY:", navState.url);

                            router.replace("/(tabs)/booking");
                        }
                    }}
                />

            </View>
        </View>
    );
}
