import RegisterResponse from '@/models/RegisterResponse';
import UserLogin from '@/models/UserLogin';
import UserLoginResponse from '@/models/UserLoginResponse';
import UserRegister from '@/models/UserRegister';
import BaseUrl from '../constants/BaseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutResponse from '@/models/LogoutResponse';

async function register(user: UserRegister): Promise<RegisterResponse | any> {
  try {
    const res = await fetch(`${BaseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      return {
        data: null,
        message: errorBody,
      }
    }

    const data = await res.json();

    return {
      data: data,
      message: "Đăng ký thành công!",
    };

  } catch (error: any) {
    console.error("❌ Lỗi trong register:", error);
    // Có thể trả về null hoặc object có message lỗi
    return {
      data: null,
      message: error.message,
    }
  }
}

async function logoutFunction(): Promise<LogoutResponse> {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      return { success: false, message: "Không tìm thấy token" };
    }

    // Gọi API logout trên backend
    const res = await fetch(`${BaseUrl}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(errorBody);
    }

    // Xóa token + userId ở client
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');

    return { success: true, message: "Đăng xuất thành công!" };
  } catch (error: any) {
    console.error("❌ Lỗi logout:", error);
    return { success: false, message: error.message };
  }
}

async function loginFunction(user: UserLogin): Promise<UserLoginResponse | null> {
    try {
      const res = await fetch(`${BaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorBody}`);
      }
  
      const data = await res.json();
  
      return {
        ...data,
        message: "Đăng nhập thành công!",
      };
  
    } catch (error: any) {
    //   console.error("❌ Lỗi trong login:", error);
      // Có thể trả về null hoặc object có message lỗi
      return null
    }
  }

async function getUserById(userId: string): Promise<RegisterResponse | null> {
  try {
    const res = await fetch(`${BaseUrl}/auth/user/${userId}`);
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }
    const data = await res.json();
    return {
      data: data,
      message: "Lấy thông tin người dùng thành công!",
    };
  } catch (error: any) {
    console.error("❌ Lỗi trong getUser:", error);
    return null;
  }
}
// UserAPI.ts
async function getCurrentUser(token: string): Promise<any | null> {
  try {
    const res = await fetch(`${BaseUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorBody}`);
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("❌ Lỗi getCurrentUser:", error);
    return null;
  }
}

export { getUserById, loginFunction, register,logoutFunction ,getCurrentUser };

