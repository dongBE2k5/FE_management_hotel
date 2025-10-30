import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios'; // Thêm import axios
import { urlIP } from '@/constants/BaseURL';
// -------------------------------------------------------------
// !! THAY ĐỔI IP NÀY !!

const BASE_URL = `${urlIP}/api/requests`;
const WS_URL = `${urlIP}/ws`;
// -------------------------------------------------------------

// Định nghĩa các kiểu dữ liệu (Types)


export interface Request {
  message: string;

}

export interface RequestPayload {
  message: string;

}

// Các hàm callback để App component cập nhật state
export interface ConnectCallbacks {
  onConnected: () => void;
  onDisconnected: () => void;
  onMessageReceived: (request: Request) => void;
  onError: (error: string) => void;
}

// Giữ client bên ngoài để có thể truy cập ở mọi nơi trong module
let stompClient: Client | null = null;

/**
 * Khởi tạo kết nối WebSocket và đăng ký kênh
 */
export const connectAndSubscribeBooking = (
  callbacks: ConnectCallbacks
) => {
  if (stompClient) {
    console.log('STOMP client đã tồn tại. Hủy kích hoạt client cũ...');
    stompClient.deactivate();
  }

  try {
    stompClient = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(new Date(), str); // Thêm log chi tiết
      },
    });

    stompClient.onConnect = (frame) => {
      callbacks.onConnected();
      

      // Lắng nghe kênh của chính mình
    
      stompClient?.subscribe('/topic/booking', (message) => {
        console.log('Nhận được booking message real-time!');
        const newRequest = JSON.parse(message.body) as Request;
        callbacks.onMessageReceived(newRequest);
      });
    };

    stompClient.onStompError = (frame) => {
      const errorMsg = 'Lỗi Stomp: ' + frame.body;
      console.error(errorMsg);
      callbacks.onError(errorMsg);
    };

    stompClient.onDisconnect = () => {
      console.log('Đã ngắt kết nối WebSocket.');
      callbacks.onDisconnected();
    };

    stompClient.activate();
  } catch (error) {
    const errorMsg = 'Lỗi kết nối WS: ' + (error as Error).message;
    console.error(errorMsg);
    callbacks.onError(errorMsg);
  }
};

/**
 * Ngắt kết nối WebSocket
 */
export const disconnect = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('Đã ngắt kết nối WebSocket (chủ động).');
  }
};

