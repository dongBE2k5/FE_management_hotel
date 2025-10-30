// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
export default function App() {
    // const [role, setRole] = useState("ROLE_EMPLOYEE");
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    console.log("router tổng ", router);
    // Mặc định là "employee"
    useEffect(() => {

        const checkRole = async () => {

            try {
                await AsyncStorage.setItem("role", "ROLE_HOST");
                const role = await AsyncStorage.getItem("role")
                console.log(role);

                //                 if (!role) {
                //                     router.replace("/(tabs)");
                //                     return;
                //                 }

                if (role === "ROLE_EMPLOYEE" || role === "ROLE_ADMIN") {
                    router.replace("/(employee)");
                } else if (role === "ROLE_HOST") {
                    router.replace("/(host)");
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



    return null;
}