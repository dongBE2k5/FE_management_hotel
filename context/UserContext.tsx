import RegisterResponse from '@/models/RegisterResponse';
import { getUserById } from '@/service/UserAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Import thêm ActivityIndicator và View
import { ActivityIndicator, View } from 'react-native';

// ... (Giữ nguyên type, UserContextType, và createContext)
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
      const role = await AsyncStorage.getItem("role");

      if (role && userId) {
        const res = await getUserById(userId);
        if (res) {
          setUser({ ...res, role });
        } else {
          setUser(null);
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('role');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi làm mới người dùng:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Khi app mount → load user
  useEffect(() => {
    refreshUser();
  }, []);

  // useEffect điều hướng (ĐÃ SỬA ĐỔI)
  useEffect(() => {
    // 1. Không làm gì nếu đang tải
    if (isLoading) {
      return;
    }

    const inGroupLayout = segments[0] ?? null;

    // 2. Đã tải xong, NHƯNG KHÔNG CÓ USER
    // Đây là "default return" (trạng thái mặc định) -> về (tabs)
    // Rất quan trọng khi user logout
    if (!user || !user.role) {
      if (inGroupLayout !== '(tabs)') {
        router.replace('/(tabs)');
      }
      return; // Dừng ở đây
    }
    
    // 3. Đã tải xong VÀ CÓ USER -> Điều hướng theo role
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
    }
    else {
      // Các role mặc định khác (ví dụ ROLE_USER) cũng về (tabs)
      if (inGroupLayout !== '(tabs)') {
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, segments]);

  // 2. Thêm màn hình Loading tại đây
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 3. Chỉ render app khi đã hết loading
  return (
    <UserContext.Provider value={{ user, refreshUser, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
