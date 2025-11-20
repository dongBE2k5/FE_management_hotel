import { UserProvider, useUser } from '@/context/UserContext';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Component con để truy cập context
function RootLayoutNav() {
  const { isLoading } = useUser();

  // Trong khi đang kiểm tra thông tin đăng nhập, hiển thị màn hình chờ
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Sau khi kiểm tra xong, hiển thị trang hiện tại
  return <Slot />;
}

export default function RootLayout() {
  return (
    <UserProvider>

      <RootLayoutNav />
      <Toast />
    </UserProvider>
  );
}