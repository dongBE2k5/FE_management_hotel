import { urlIP } from '@/constants/BaseURL';
import { RoomAssignment } from '@/models/RoomAssignment';
import { Client } from '@stomp/stompjs';
import axios from 'axios'; // Thêm import axios
import SockJS from 'sockjs-client';
// -------------------------------------------------------------
// !! THAY ĐỔI IP NÀY !!

const BASE_URL = `${urlIP}/api/requests`;
const BASE_URL_2 = `${urlIP}/api/assignment`;
const WS_URL = `${urlIP}/ws`;
// -------------------------------------------------------------

// Định nghĩa các kiểu dữ liệu (Types)
// export type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Request {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  status: Status;
}

export interface RequestPayload {
  senderId: number;
  receiverId: number;
  message: string;
  status: string;
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
export const connectAndSubscribe = (
  userId: number,
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
      console.log(`Đã kết nối với tư cách user: ${userId}`);

      // Lắng nghe kênh của chính mình
      stompClient?.subscribe(`/topic/user.${userId}`, (message) => {
        console.log('Nhận được message real-time!');
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
export const disconnect = async () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('Đã ngắt kết nối WebSocket (chủ động).');
  }
};

/**
 * Tải danh sách request ban đầu (sent và received)
 * Đã cập nhật sang axios
 */
export const fetchInitialRequests = async (
  userId: number
): Promise<Request[]> => {
  try {
    // Sử dụng axios.get
    const sentPromise = axios.get<Request[]>(`${BASE_URL}/sent/${userId}`);
    const receivedPromise = axios.get<Request[]>(`${BASE_URL}/received/${userId}`);

    const [sentResponse, receivedResponse] = await Promise.all([
      sentPromise,
      receivedPromise,
    ]);

    // axios trả về data trong thuộc tính .data
    const sentJson = sentResponse.data;
    const receivedJson = receivedResponse.data;

    return [...sentJson, ...receivedJson];
  } catch (e) {
    console.error('Lỗi tải data:', e);
    return []; // Trả về mảng rỗng nếu lỗi
  }
};

/**
 * Gửi một request mới qua REST API
 * Đã cập nhật sang axios
 */
export const sendRequest = async (
  payload: RequestPayload,
  roomId?: number,
  bookingId?: number

) => {
  try {
    const response = await axios.post<Request>(BASE_URL, payload, roomId && bookingId ? { params: { roomId ,bookingId}, } : undefined);
    console.log("📤 Gửi yêu cầu thành công:", response.data);
    return response.data; // Trả về response.data
  } catch (error) {
    console.error("❌ Lỗi khi gửi yêu cầu kiểm tra phòng:", error.response?.data || error.message);
    throw error;
  }

  // Sử dụng axios.post
  // axios tự động throw error nếu status không phải 2xx


};

/**
 * Phản hồi một request qua REST API
 * Đã cập nhật sang axios
 */
export const respondToRequest = async (
  requestId: number,
  newStatus: Status
): Promise<Request> => {
  // Sử dụng axios.put
  const response = await axios.put<Request>(
    `${BASE_URL}/${requestId}/status?status=${newStatus}`
  );

  return response.data; // Trả về response.data
};


export const updateStatusRequest = async (
  id: number,
  newStatus: string,
  roomId: number,
  assignmentId?: number // có thể null
): Promise<Request> => {
  const params = new URLSearchParams({
    status: newStatus,
    roomId: roomId.toString(),
  });

  if (assignmentId) {
    params.append("assignmentId", assignmentId.toString());
  }

  const response = await axios.put<Request>(
    `${BASE_URL}/${id}/status?${params.toString()}`
  );

  return response.data;
};


export const fetchReceivedRequests = async (
  userId: number
): Promise<RoomAssignment[]> => {
  try {
    const response = await axios.get<RoomAssignment[]>(`${BASE_URL_2}/${userId}/user`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi tải dữ liệu received requests:", error);
    return [];
  }
};

