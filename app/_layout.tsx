import { UserProvider, useUser } from '@/context/UserContext';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

// --- BẮT ĐẦU SỬA ---
// 1. Import 2 thứ bị thiếu
import { HostProvider } from '@/context/HostContext';
import HostIdLoader from '@/context/HostLoader';
// --- KẾT THÚC SỬA ---


// Component con để truy cập context (Giữ nguyên)
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
      {/* --- BẮT ĐẦU SỬA --- */}
      {/* 2. Bọc HostProvider bên trong UserProvider */}
      <HostProvider>
        {/* 3. Gắn HostIdLoader vào đây để nó chạy
           Nó sẽ lấy 'user' từ UserProvider (ở trên)
           và cập nhật 'hotelId' vào HostProvider (ở trên)
        */}
        <HostIdLoader />

        {/* Component điều hướng của bạn bây giờ
           đã nằm trong cả 2 provider
        */}
        <RootLayoutNav />

      </HostProvider>
      {/* --- KẾT THÚC SỬA --- */}
    </UserProvider>
  );
}