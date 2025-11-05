import RegisterResponse from '@/models/RegisterResponse';
import { getEmployeeByUser } from '@/service/EmpoyeeAPI';
import { getUserById } from '@/service/UserAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { ActivityIndicator, View } from 'react-native';

type UserType = RegisterResponse & { role: string };

type UserContextType = {
  user: UserType | null;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: async () => { },
  setUser: () => { },
  isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const refreshUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('role');

      if (role && userId) {
        const [userRes, employeeRes] = await Promise.all([
          getUserById(userId),
          (role === 'ROLE_EMPLOYEE' || role === 'ROLE_CLEANING' || role === 'ROLE_ADMIN')
            ? getEmployeeByUser(Number(userId))
            : Promise.resolve(null),
        ]);

        if (userRes) {
          setUser({ ...userRes, role });
          if (employeeRes?.hotelId) {
            await AsyncStorage.setItem('hotelID', employeeRes.hotelId.toString());
          }
        } else {
          setUser(null);
          await AsyncStorage.multiRemove(['userId', 'role', 'hotelID']);
        }
      }
      else {
        // Không có role hoặc userId trong Storage
        setUser(null);
      }
    } catch (error) {
      // Lỗi nghiêm trọng (ví dụ: API getUserById sập)
      console.error('Lỗi khi làm mới người dùng:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Khi app mount → load user
  useEffect(() => {
    refreshUser();
  }, []);

  // useEffect điều hướng (Giữ nguyên, logic này đúng)
  useEffect(() => {
    if (isLoading) return;
  
    const inGroupLayout = segments[0] ?? null;
    console.log("🧭 inGroupLayout:", inGroupLayout);
    console.log("👤 user:", user);

    if (!user || !user.role) {
      if (inGroupLayout !== '(tabs)') {

        router.replace('/(tabs)');

      }
      return;
    }

    if (user.role === 'ROLE_EMPLOYEE' || user.role === 'ROLE_ADMIN') {
      if (inGroupLayout !== '(employee)') {
        setTimeout(() => {
          router.replace('/(employee)');
        }, 0);
      }
    } else if (user.role === 'ROLE_HOST') {
      if (inGroupLayout !== '(host)') {
        setTimeout(() => {
          router.replace('/(host)');
        }, 0);
      }
    } else if (user.role === 'ROLE_CLEANING') {
      if (inGroupLayout !== '(cleaningStaff)') {
        setTimeout(() => {
          router.replace('/(cleaningStaff)');
        }, 0);
      }
    } else {
      if (inGroupLayout !== '(tabs)') {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

