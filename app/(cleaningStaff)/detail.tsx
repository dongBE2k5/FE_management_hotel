import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  SafeAreaView,
  Alert, // Sử dụng Alert để thông báo lỗi
} from 'react-native';

// Import các hàm và kiểu dữ liệu từ socketAPI
import {
  connectAndSubscribe,
  disconnect,
  fetchInitialRequests,
  sendRequest,
  respondToRequest,
  Request,
  Status,
  RequestPayload,
} from '@/service/WebSocketAPI'; // Import từ file .ts

// -------------------------------------------------------------
// Giả sử bạn đã đăng nhập và có thông tin user
// Đây sẽ là User A (id: 1) hoặc User B (id: 2)
// const currentUser = { id: 1, name: 'User A' };
const currentUser = { id: 2, name: 'User B' };
// -------------------------------------------------------------

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]); // Gõ kiểu cho state

  // Hàm này RẤT QUAN TRỌNG:
  // Dùng để cập nhật state khi có request mới (hoặc update)
  // Bọc trong useCallback để ổn định tham chiếu cho useEffect
  const handleRealtimeRequest = useCallback((newOrUpdatedRequest: Request) => {
    setRequests((prevRequests) => {
      const existingIndex = prevRequests.findIndex(
        (req) => req.id === newOrUpdatedRequest.id
      );

      // Nếu request đã có -> cập nhật nó (đây là 1 bản update status)
      if (existingIndex > -1) {
        const updatedRequests = [...prevRequests];
        updatedRequests[existingIndex] = newOrUpdatedRequest;
        return updatedRequests;
      }

      // Nếu request chưa có -> thêm mới (đây là 1 request mới)
      return [...prevRequests, newOrUpdatedRequest];
    });
  }, []); // Hàm này không có dependency

  // ----- 1. KẾT NỐI WEBSOCKET VÀ TẢI DATA -----
  useEffect(() => {
    // 1. Tải data ban đầu khi mở app
    const loadData = async () => {
      try {
        const initialData = await fetchInitialRequests(currentUser.id);
        setRequests(initialData);
        console.log('Đã tải request ban đầu');
      } catch (e) {
        console.error('Lỗi tải data:', e);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu ban đầu.');
      }
    };

    loadData();

    // 2. Định nghĩa các callback cho websocket
    const callbacks = {
      onConnected: () => {
        setIsConnected(true);
        console.log('App: Đã kết nối WS');
      },
      onDisconnected: () => {
        setIsConnected(false);
        console.log('App: Đã ngắt kết nối WS');
      },
      onMessageReceived: (request: Request) => {
        console.log('App: Nhận được message real-time!');
        handleRealtimeRequest(request);
      },
      onError: (error: string) => {
        console.error('App: Lỗi Socket!', error);
        Alert.alert('Lỗi WebSocket', error);
      },
    };

    // 3. Bắt đầu kết nối
    connectAndSubscribe(currentUser.id, callbacks);

    // 4. Hàm dọn dẹp: Ngắt kết nối khi component unmount
    return () => {
      disconnect();
    };
  }, [currentUser.id, handleRealtimeRequest]); // Chạy lại nếu user thay đổi

  // ----- 2. GỌI REST API (qua các hàm wrapper) -----

  // Chức năng: Gửi 1 request mới
  const handleSendRequest = async (receiverId: number) => {
    const newRequestPayload: RequestPayload = {
      senderId: currentUser.id,
      receiverId: receiverId,
      message: `Lời mời từ ${currentUser.name}`,
      status: 'PENDING',
    };

    try {
      // Gọi hàm sendRequest từ API
      const savedRequest = await sendRequest(newRequestPayload);
      // Thêm ngay vào UI của người gửi
      handleRealtimeRequest(savedRequest);
      console.log('Đã gửi request:', savedRequest);
    } catch (e) {
      console.error('Lỗi gửi request:', e);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu.');
    }
  };

  // Chức năng: Phản hồi 1 request
  const handleRespondToRequest = async (requestId: number, newStatus: Status) => {
    try {
      // Gọi hàm respondToRequest từ API
      const updatedRequest = await respondToRequest(requestId, newStatus);
      // Cập nhật UI của người phản hồi
      handleRealtimeRequest(updatedRequest);
      console.log('Đã phản hồi request:', updatedRequest);
    } catch (e) {
      console.error('Lỗi phản hồi request:', e);
      Alert.alert('Lỗi', 'Không thể phản hồi yêu cầu.');
    }
  };

  // ----- 3. RENDER UI -----
  const renderItem = ({ item }: { item: Request }) => ( // Thêm kiểu cho item
    <View style={styles.requestItem}>
      <Text>ID: {item.id} (Status: {item.status})</Text>
      <Text>From: {item.senderId} | To: {item.receiverId}</Text>
      <Text>Msg: {item.message}</Text>

      {/* Nếu mình là người nhận VÀ nó đang PENDING -> hiển thị nút */}
      {item.receiverId === currentUser.id && item.status === 'PENDING' && (
        <View style={styles.buttonRow}>
          <Button
            title="Accept"
            onPress={() => handleRespondToRequest(item.id, 'ACCEPTED')} // Gọi hàm wrapper
          />
          <Button
            title="Reject"
            onPress={() => handleRespondToRequest(item.id, 'REJECTED')} // Gọi hàm wrapper
            color="red"
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text>Hello, {currentUser.name} (ID: {currentUser.id})</Text>
        <Text>WS Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      </View>

      {/* Nút này chỉ để demo User A gửi cho User 2 */}
      {currentUser.id === 1 && (
        <Button
          title="Gửi Request cho User 2"
          onPress={() => handleSendRequest(2)} // Gọi hàm wrapper
        />
      )}

      <FlatList
        data={requests.sort((a, b) => b.id - a.id)} // Sắp xếp mới nhất lên đầu
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 10, backgroundColor: '#eee', borderBottomWidth: 1 },
  requestItem: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

