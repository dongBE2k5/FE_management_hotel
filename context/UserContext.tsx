import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserById } from '@/service/UserAPI';
import RegisterResponse from '@/models/RegisterResponse';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type UserContextType = {
  user: RegisterResponse | null;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<RegisterResponse | null>(null);

  const refreshUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      const res = await getUserById(userId);
      setUser(res);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser(); // tải user 1 lần khi app khởi động
  }, []);

  return (
    <UserContext.Provider value={{ user, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook tiện dùng
export const useUser = () => useContext(UserContext);
