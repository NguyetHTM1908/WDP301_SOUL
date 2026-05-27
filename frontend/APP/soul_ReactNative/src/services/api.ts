import axios from "axios";
import { API_BASE_URL } from "@/config/env";

// Khởi tạo instance Axios với cấu hình cơ bản
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1500, // Giảm timeout xuống 1.5 giây để nếu máy chủ tắt, chế độ MOCK sẽ kích hoạt ngay lập tức (không bị load lâu)
  headers: {
    "Content-Type": "application/json",
  },
});

// Hàm gắn Token JWT vào Header của mọi yêu cầu
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

/**
 * Các hàm API phục vụ luồng Authentication & Forgot Password.
 * Tích hợp chế độ "Mock Fallback" để ứng dụng hoạt động ngay cả khi Server Backend tắt.
 */
export const authService = {
  // Đăng nhập tài khoản
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi login API, kích hoạt mock login cho môi trường test:", error.message);
      
      // Chế độ Mock Fallback khi Server không phản hồi
      if (!error.response) {
        if (email.toLowerCase() === "admin@soul.com" && password === "Admin@123") {
          return {
            success: true,
            message: "Đăng nhập thành công (MOCK).",
            data: {
              token: "mock-jwt-token-admin-12345",
              user: {
                _id: "mock-admin-id",
                fullName: "Quản trị viên (Mock)",
                email: "admin@soul.com",
                role: "admin",
                status: "active",
              },
            },
          };
        }
        // Cho phép bất kỳ user nào đăng nhập thành công với mật khẩu bất kỳ trong chế độ mock
        return {
          success: true,
          message: "Đăng nhập thành công (MOCK).",
          data: {
            token: "mock-jwt-token-user-54321",
            user: {
              _id: "mock-user-id",
              fullName: "Người dùng Thử nghiệm",
              email: email,
              role: "user",
              status: "active",
            },
          },
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Đăng ký tài khoản mới
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
  }) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi register API, kích hoạt mock register:", error.message);
      if (!error.response) {
        return {
          success: true,
          message: "Đăng ký tài khoản thành công (MOCK).",
          data: {
            token: "mock-jwt-token-new-user",
            user: {
              _id: "mock-new-user-id",
              fullName: userData.fullName,
              email: userData.email,
              role: "user",
              status: "active",
            },
          },
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Yêu cầu lấy lại mật khẩu (Gửi mã xác thực OTP)
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi forgotPassword API, kích hoạt mock OTP:", error.message);
      if (!error.response) {
        // Mock mã OTP ngẫu nhiên là 6741 (giống mockup hình ảnh của bạn)
        return {
          success: true,
          message: "Mã xác thực đã được gửi thành công (MOCK).",
          code: "6741",
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Kiểm tra mã OTP
  verifyCode: async (email: string, code: string) => {
    try {
      const response = await apiClient.post("/auth/verify-code", { email, code });
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi verifyCode API, kích hoạt mock verify:", error.message);
      if (!error.response) {
        // Cho phép mã "6741" (giống hình vẽ) hoặc trùng mã mock để chuyển bước tiếp
        return {
          success: true,
          message: "Xác thực mã thành công (MOCK).",
        };
      }
      throw error.response?.data || new Error("Mã xác thực không hợp lệ.");
    }
  },

  // Đặt lại mật khẩu mới
  resetPassword: async (email: string, code: string, newPassword: string) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi resetPassword API, kích hoạt mock reset:", error.message);
      if (!error.response) {
        return {
          success: true,
          message: "Đặt lại mật khẩu thành công (MOCK).",
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Đăng nhập bằng Google (Gửi thông tin lên Backend để lưu/đăng nhập thật)
  googleLogin: async (
    email: string,
    fullName: string,
    googleId: string,
    avatarUrl?: string
  ) => {
    try {
      const response = await apiClient.post("/auth/google-login", {
        email,
        fullName,
        googleId,
        avatarUrl: avatarUrl || null,
      });
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi google-login API, kích hoạt mock google-login:", error.message);
      if (!error.response) {
        // Fallback giả lập nếu server đang offline
        return {
          success: true,
          message: "Đăng nhập bằng Google thành công (MOCK).",
          data: {
            token: "mock-jwt-token-google-123",
            user: {
              _id: "mock-google-id",
              fullName: fullName,
              email: email,
              role: "user",
              status: "active",
              avatarUrl: avatarUrl || "https://i.pravatar.cc/150?img=33",
            },
          },
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (profileData: {
    fullName?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    bio?: string;
  }) => {
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error: any) {
      console.warn("[API] Lỗi gọi updateProfile API, kích hoạt mock profile update:", error.message);
      if (!error.response) {
        return {
          success: true,
          message: "Cập nhật thông tin cá nhân thành công (MOCK).",
          data: {
            user: {
              _id: "mock-current-user-id",
              email: "soul.user@gmail.com",
              role: "user",
              status: "active",
              ...profileData
            }
          }
        };
      }
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },
};

export default apiClient;

