import React, { useCallback, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🧩 Import các màn hình
import CameraCaptureScreen from "@/components/host/screen/CameraCaptureView";
import CCCDScannerScreen from "@/components/host/screen/CCCDScannerScreen";


import { getHostByUser } from "@/service/HostAPI"; // 🧠 API lấy host theo userId
import { HostStack } from "@/types/navigation";
import HotelList from "@/components/host/screen/hotel/HotelList";
import HostBookings from "@/components/host/screen/bookings/HostBookings";
import EditHotel from "@/components/host/screen/hotel/EditHotel";
import CreateHotel from "@/components/host/screen/hotel/CreateHotel";

import Checkout from "@/components/employee_staff/screen/checkOut";
import BookingDetail from "@/components/employee_staff/screen/bookingDetail";
import KycFormScreen from "@/components/host/screen/CCCDScannerScreen";
import { useFocusEffect } from "expo-router";

const Stack = createStackNavigator<HostStack>();

export default function HomeLayout() {
  const [isHost, setIsHost] = useState<boolean | null>(null); // null: chưa xác định
  const [loading, setLoading] = useState(true);
// app/(host)/index.tsx
useFocusEffect(
  useCallback(() => {
    const fetchHostStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          setIsHost(false);
          setLoading(false);
          return;
        }

        const response = await getHostByUser(Number(userId));
        console.log("📡 getHostByUser response:", response.data);

        if (response?.data) {
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      } catch (error) {
        console.error("❌ Lỗi khi gọi getHostByUser:", error);
        setIsHost(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHostStatus();
  }, [])
);



  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isHost ? (
          // 🏨 Nếu là host => hiển thị các màn hình quản lý khách sạn
          <>
            <Stack.Screen name="HotelList" component={HotelList} />
            <Stack.Screen name="hostBookings" component={HostBookings} />
            <Stack.Screen name="hotelEdit" component={EditHotel} />
            <Stack.Screen name="CreateHotel" component={CreateHotel} />
            <Stack.Screen name="bookingDetail" component={BookingDetail} />
            <Stack.Screen name="checkout" component={Checkout} />
          </>
        ) : (
          // 🧾 Nếu chưa là host => hiển thị quy trình KYC
          <>
            <Stack.Screen name="CCCDScannerScreen" component={CCCDScannerScreen} />
            <Stack.Screen name="CameraCaptureView" component={CameraCaptureScreen} />
            <Stack.Screen name="KycFormScreen" component={KycFormScreen} />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#f0f0f0",
  },
};
