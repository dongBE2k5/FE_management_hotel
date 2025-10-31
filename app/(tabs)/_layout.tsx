import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
// Cần import CommonActions, NavigationProp, ParamListBase để xử lý điều hướng và kiểu dữ liệu
import { CommonActions, NavigationProp, ParamListBase } from "@react-navigation/native";

// Định nghĩa kiểu dữ liệu cho một Route trong Tab Navigator (chứa Stack)
type TabRouteWithState = {
    name: string;
    key: string;
    // state của Stack Navigator bên trong, chứa index và routes của Stack
    state?: { index: number; routes: { name: string }[] }; 
};

// Định nghĩa kiểu dữ liệu cho State của Tab Navigator
type TabState = {
    routes: TabRouteWithState[];
    index: number;
    // Thêm các thuộc tính khác của State nếu cần
    type: string;
    key: string;
    routeNames: string[];
    history: unknown[];
    stale: boolean;
};


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#73c5fc",
        tabBarInactiveTintColor: "#888888",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      
        listeners={({ navigation }) => ({
          tabPress: (e) => {
           
            const tabState = navigation.getState() as TabState; 

           
            const indexRoute = tabState.routes.find(route => route.name === 'index');

           
            const stackIndex = indexRoute?.state?.index ?? 0;

        
            if (stackIndex > 0) {
              console.log("TabPress: Resetting Home Stack back to 'Home' screen.");
              e.preventDefault(); // Ngăn Tab chuyển đổi mặc định

           
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{
                    name: 'index', // Tên Route Tab
                    state: {
                      routes: [{ name: 'Home' }] // Tên màn hình gốc trong Stack Navigator (App.tsx)
                    }
                  }],
                })
              );
            }
          },
        })}
      />

      {/* Các Tabs.Screen khác giữ nguyên */}
      <Tabs.Screen
        name="saved"
        options={{
          title: "Đã lưu",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Đã đặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="voucher"
        options={{
          title: "Voucher",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          lazy: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            // Lỗi ở đây: state.routes[state.index] là Tab hiện tại.
            // Để kiểm tra màn hình cuối của Stack Profile, cần tìm đúng Stack Profile.
            // Tạm thời giữ nguyên theo code cũ của bạn
            const currentRoute =
              state.routes[state.index].state?.routes?.at(-1)?.name;
            if (currentRoute === "LoggedAccount") e.preventDefault();
          },
        })}
      />
    </Tabs>
  );
}