import LogoutResponse from '@/models/LogoutResponse';
import RegisterResponse from '@/models/RegisterResponse';
import UserLogin from '@/models/UserLogin';
import UserLoginResponse from '@/models/UserLoginResponse';
import UserRegister from '@/models/UserRegister';
import { RegisterEmployee } from '@/models/RegisterEmployee';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseUrl from '../constants/BaseURL';
import axios from 'axios';
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



    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('role')

    return { success: true, message: "Đăng xuất thành công!" };
  } catch (error: any) {
    console.error("Lỗi logout:", error);
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
async function sendOtp(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BaseUrl}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: err };
    }

    return { success: true, message: "OTP đã được gửi tới email của bạn!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Đặt lại mật khẩu bằng OTP
async function resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BaseUrl}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: err };
    }

    return { success: true, message: "Mật khẩu đã được cập nhật!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
// Đổi mật khẩu khi đã đăng nhập
async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return { success: false, message: "Không tìm thấy token người dùng." };
    }

    const res = await fetch(`${BaseUrl}/auth/change-password/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMessage = "Đổi mật khẩu thất bại."; // Giá trị mặc định

      try {


        const errorObject = JSON.parse(errText);
        if (errorObject.message) {
          errorMessage = errorObject.message;
        } else {
          errorMessage = errText; // Trường hợp không có trường message
        }
      } catch (e) {
      } catch (e) {
        errorMessage = errText;
      }



      return { success: false, message: errorMessage };
    }

    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Cập nhật thông tin người dùng
async function updateProfile(
  userId: number,
  updatedData: {
    fullName?: string;
    email?: string;
    phone?: string;
    cccd?: string;
    gender?: string;
    birthDate?: string; // YYYY-MM-DD
    address?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return { success: false, message: "Không tìm thấy token người dùng." };
    }

    const res = await fetch(`${BaseUrl}/auth/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData), // ✅ gửi đúng key theo DTO
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: errText };
    }

    return { success: true, message: "Cập nhật thông tin thành công!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }



}

async function sendRegisterOtp(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BaseUrl}/auth/send-otp-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "register" }), // thêm type để backend biết là đăng ký
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: err };
    }

    return { success: true, message: "OTP đã được gửi tới email của bạn!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function verifyRegisterOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${BaseUrl}/auth/verify-otp-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type: "register" }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, message: err };
    }

    return { success: true, message: "OTP hợp lệ, bạn có thể tiếp tục đăng ký!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export default updateProfile;

export {
  getUserById, loginFunction, register, logoutFunction, getCurrentUser, sendOtp,
  resetPassword, changePassword, updateProfile, sendRegisterOtp, verifyRegisterOtp
};

