import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#73c5fc',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#fff',    // 👈 nền trắng giống iOS
          borderTopWidth: 0,
          elevation: 0,               // bỏ bóng trên Android
        },
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang Quét Mã',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />


    </Tabs>

    
    </>

  )
}