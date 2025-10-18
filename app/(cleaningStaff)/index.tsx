// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CleaningStaffScreen from '@/components/cleaningStaff/screen/CleaningStaffScreen';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Cần làm') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Đang làm') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Hoàn thành') {
              iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
            } else if (route.name === 'Thêm') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#16C0C0',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 5,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
              fontSize: 12,
          }
        })}
      >
        <Tab.Screen name="Cần làm" component={CleaningStaffScreen} />
        <Tab.Screen name="Đang làm" component={CleaningStaffScreen} />
        <Tab.Screen name="Hoàn thành" component={CleaningStaffScreen} />
        <Tab.Screen name="Thêm" component={CleaningStaffScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}