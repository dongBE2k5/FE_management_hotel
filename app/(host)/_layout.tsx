import { HostProvider } from '@/context/HostContext';
import HostIdLoader from '@/context/HostLoader';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <>
      <HostProvider>
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
              title: 'Trang chủ',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="rooms"
            options={{
              title: 'phòng',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="service"
            options={{
              title: 'Dịch vụ',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="voucher"
            options={{
              title: 'Voucher',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="ticket" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Thông tin',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
              ),
            }}  
          />
          <Tabs.Screen
            name="payment"
            options={{
              title: 'Thanh toán',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="cash" size={size} color={color} />
              ),
            }}
          />


        </Tabs>
      </HostProvider>


    </>

  )
}