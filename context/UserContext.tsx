import RegisterResponse from '@/models/RegisterResponse';
import { getUserById } from '@/service/UserAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

type UserType = RegisterResponse & { role: string };

type UserContextType = {
  user: UserType | null;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  // Thêm isLoading để các component khác có thể sử dụng
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: async () => { },
  setUser: () => { },
  // Thêm giá trị mặc định
  isLoading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  // Thêm state isLoading, mặc định là true khi app vừa khởi động
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    // Không cần setIsLoading(true) ở đây vì nó đã là true từ đầu
    try {
      await AsyncStorage.setItem("userId", "3");
      const userId = await AsyncStorage.getItem('userId');

      // const role = await AsyncStorage.getItem("role");

      await AsyncStorage.setItem("role", "ROLE_HOST")
      const role = await AsyncStorage.getItem("role");

      if (role) {

        const res = await getUserById(userId);

        if (res) { // Kiểm tra nếu API trả về dữ liệu hợp lệ
          setUser({ ...res, role });
        } else { // Xử lý trường hợp API không tìm thấy user
          setUser(null);
          // Xóa storage nếu thông tin không còn hợp lệ
          await AsyncStorage.removeItem('userId');
          await AsyncStorage.removeItem('role');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // Nếu có bất kỳ lỗi nào (mất mạng, server lỗi), set user về null để đăng xuất
      console.error("Lỗi khi làm mới người dùng:", error);
      setUser(null);
    } finally {
      // Luôn set isLoading về false sau khi hoàn tất (dù thành công hay thất bại)
      setIsLoading(false);
    }
  };

  // Khi app mount → load user từ storage
  useEffect(() => {
    refreshUser();
  }, []);

  // Khi user thay đổi → redirect tự động. Logic này vẫn giữ nguyên và rất tốt.
  useEffect(() => {
    // console.log(user?.role);


    // Không cần điều hướng khi đang trong quá trình tải ban đầu
    if (isLoading || !user || !user.role) return;

    // if (role == 'ROLE_EMPLOYEE' || role == 'ROLE_ADMIN') {
    //   router.replace('/(employee)');
    // } else if (role === 'ROLE_HOST') {
    //   router.replace('/(host)');
    // } else if (role === 'ROLE_CLEANINGSTAFF') {
    //   router.replace('/(cleaningStaff)');
    // }

    if (user?.role === 'ROLE_EMPLOYEE' || user?.role === 'ROLE_ADMIN') {
      router.replace('/(employee)');
    } else if (user?.role === 'ROLE_HOST') {
      router.replace('/(host)');
    } else if (user?.role === 'ROLE_CLEANINGSTAFF') {
      router.replace('/(cleaningStaff)');
    }

    else {
      router.replace('/(tabs)');
    }
  }, [user, isLoading]); // Thêm isLoading vào dependency

  return (
    <UserContext.Provider value={{ user, refreshUser, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);