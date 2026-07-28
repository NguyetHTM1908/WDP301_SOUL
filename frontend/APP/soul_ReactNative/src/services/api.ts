import axios from "axios";
import { API_BASE_URL } from "@/api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Khởi tạo instance Axios với cấu hình cơ bản
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const hasAuthorization = Boolean(config.headers?.Authorization);

  if (!hasAuthorization) {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Hàm gắn Token JWT vào Header của mọi yêu cầu
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  interests?: string[];

  // Forum anonymous mode
  anonymousModeEnabled?: boolean;
  anonymousAlias?: string;
};

/**
 * Các hàm API phục vụ luồng Authentication & Forgot Password.
 */
export const authService = {
  // Đăng nhập tài khoản
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
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
    role?: string;
  }) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Yêu cầu lấy lại mật khẩu
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Kiểm tra mã OTP quên mật khẩu
  verifyCode: async (email: string, code: string) => {
    try {
      const response = await apiClient.post("/auth/verify-code", {
        email,
        code,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Mã xác thực không hợp lệ.");
    }
  },

  // Xác thực mã OTP sau khi đăng ký tài khoản
  verifyRegisterOtp: async (email: string, otp: string) => {
    try {
      const response = await apiClient.post("/auth/verify-register-otp", {
        email,
        otp,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  },

  // Gửi lại mã OTP (cho cả đăng ký và quên mật khẩu)
  resendOtp: async (email: string, type: "register" | "reset-password" = "register") => {
    try {
      const response = await apiClient.post("/auth/resend-otp", {
        email,
        type,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể gửi lại mã OTP.");
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
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Đăng nhập bằng Google
  googleLogin: async (
    email?: string,
    fullName?: string,
    googleId?: string,
    avatarUrl?: string,
    idToken?: string
  ) => {
    try {
      const response = await apiClient.post("/auth/google-login", {
        email,
        fullName,
        googleId,
        avatarUrl: avatarUrl || null,
        idToken,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Cập nhật thông tin cá nhân + bật/tắt ẩn danh
  updateProfile: async (profileData: UpdateProfilePayload) => {
    try {
      const response = await apiClient.put("/auth/profile", profileData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },

  // Bật chế độ ẩn danh
  enableAnonymousMode: async (anonymousAlias: string) => {
    try {
      const alias = anonymousAlias.trim();

      if (!alias) {
        throw new Error("Vui lòng nhập tên ẩn danh trước khi bật ẩn danh.");
      }

      const response = await apiClient.put("/auth/profile", {
        anonymousModeEnabled: true,
        anonymousAlias: alias,
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || error || new Error("Không thể bật chế độ ẩn danh.");
    }
  },

  // Thoát chế độ ẩn danh
  disableAnonymousMode: async () => {
    try {
      const response = await apiClient.put("/auth/profile", {
        anonymousModeEnabled: false,
      });

      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể thoát chế độ ẩn danh.");
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData: {
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      const response = await apiClient.put("/auth/change-password", passwordData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || new Error("Không thể kết nối đến máy chủ.");
    }
  },
};

export default apiClient;