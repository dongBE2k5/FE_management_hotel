import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type HostContextType = {
  hotelId: number | null;
  setHotelId: (id: number | null) => void;
  //   adminName: string;
  //   setAdminName: (name: string) => void;
};

const HostContext = createContext<HostContextType | undefined>(undefined);

export const HostProvider = ({ children }: { children: React.ReactNode }) => {
  const [hotelId, setHotelId] = useState<number | null>(null);
  //   const [adminName, setAdminName] = useState<string>('');
  useEffect(() => {
    const fetchRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      console.log("HOst context");
      console.log(role);
      
      if (!role) {
        router.push('/(tabs)');
        return;
      }

      switch (role) {
        case 'ROLE_EMPLOYEE':
        case 'ROLE_ADMIN':
          router.push('/(employee)');
          break;

        case 'ROLE_HOST':
          router.push('/(host)');
          break;

        case 'ROLE_CLEANING':
          router.push('/(cleaningStaff)');
          break;

        default:
          router.push('/(tabs)');
          break;
      }
    } catch (error) {
      console.error("Lỗi khi lấy role:", error);
    }
  }
  fetchRole();
}, []);


return (
  <HostContext.Provider value={{ hotelId, setHotelId }}>
    {children}
  </HostContext.Provider>
);
};

export const useHost = () => {
  const context = useContext(HostContext);
  if (!context) {
    throw new Error("useHost must be used within a HostProvider");
  }
  return context;
};
