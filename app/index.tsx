// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function App() {
    // const [role, setRole] = useState("ROLE_EMPLOYEE");
    const [loading, setLoading] = useState(true);
    // Mặc định là "employee"
    useEffect(() => {

        const checkRole = async () => {

            try {
                await AsyncStorage.setItem("role", "ROLE_USER")
                const role = await AsyncStorage.getItem("role")

                if (!role) {
                    router.replace("/(tabs)");
                    return;
                }

                if (role === "ROLE_EMPLOYEE" || role === "ROLE_ADMIN") {
                    router.replace("/(employee)");
                } else {
                    router.replace("/(tabs)");
                }
            } catch (e) {
                console.error("Error getting role:", e);
                router.replace("/(tabs)");
            } finally {
                setLoading(false);
            }
        };

        checkRole();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return null;
}
