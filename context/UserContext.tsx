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
  refreshUser: async () => {},
  setUser: () => {},
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
        // SỬA LỖI: Bước 1. Luôn lấy thông tin User làm cốt lõi
        const res = await getUserById(userId);

        if (res) {
          // Lấy user thành công -> set user
          setUser({ ...res, role });

          // SỬA LỖI: Bước 2. Tác vụ phụ: Lấy hotelID (chỉ sau khi đã lấy user thành công)
          // Bọc trong try...catch riêng để nếu lỗi thì không ảnh hưởng đến việc login
          if (
            role === 'ROLE_EMPLOYEE' ||
            role === 'ROLE_CLEANING' ||
            role === 'ROLE_ADMIN'
          ) {
            try {
              const employee = await getEmployeeByUser(Number(userId)); // Giờ ta chắc chắn userId có giá trị
              if (employee) {
                await AsyncStorage.setItem(
                  'hotelID',
                  employee.hotelId.toString()
                );
              }
            } catch (employeeError) {
              console.error(
                'Lỗi khi lấy thông tin hotel của nhân viên:',
                employeeError
              );
              // Không làm gì cả, user vẫn được đăng nhập
            }
          }
        } else {
          // API getUserById thất bại (ví dụ: user bị xóa)
          setUser(null);
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('role');
          await AsyncStorage.removeItem('hotelID'); // Xóa luôn hotelID
        }
      } else {
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
    if (isLoading) {
      return;
    }
    const inGroupLayout = segments[0] ?? null;

    if (!user || !user.role) {
      if (inGroupLayout !== '(tabs)') {
        router.replace('/(tabs)');
      }
      return;
    }

    if (user.role === 'ROLE_EMPLOYEE' || user.role === 'ROLE_ADMIN') {
      if (inGroupLayout !== '(employee)') {
        router.replace('/(employee)');
      }
    } else if (user.role === 'ROLE_HOST') {
      if (inGroupLayout !== '(host)') {
        router.replace('/(host)');
      }
    } else if (user.role === 'ROLE_CLEANING') {
      if (inGroupLayout !== '(cleaningStaff)') {
        router.replace('/(cleaningStaff)');
      }
    } else {
      if (inGroupLayout !== '(tabs)') {
        router.replace('/(tabs)');
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

