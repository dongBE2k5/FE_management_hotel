import RegisterResponse from '@/models/RegisterResponse';
import UserLogin from '@/models/UserLogin';
import UserLoginResponse from '@/models/UserLoginResponse';
import UserRegister from '@/models/UserRegister';
import BaseUrl from '../constants/BaseURL';

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

export { loginFunction, register };

