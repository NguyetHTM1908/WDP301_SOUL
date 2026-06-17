import apiClient from "@/services/api";

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "user" | "admin" | "event_organizer";
  status: "active" | "inactive" | "blocked";
  avatarUrl?: string;
  gender?: string;
  lastLoginAt?: string;
  createdAt?: string;
  moodReputation?: string;
}

export interface GetUsersParams {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data?: {
    users: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Lấy danh sách tất cả người dùng (Admin only)
 * GET /api/admin/users
 */
export const getAdminUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  try {
    const { role, status, search, page = 1, limit = 20 } = params;
    const queryParams: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (role) queryParams.role = role;
    if (status) queryParams.status = status;
    if (search) queryParams.search = search;

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await apiClient.get(`/admin/users?${queryString}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể lấy danh sách người dùng.",
    };
  }
};

/**
 * Lấy chi tiết một người dùng (Admin only)
 * GET /api/admin/users/:id
 */
export const getAdminUserById = async (id: string) => {
  try {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể lấy thông tin người dùng.",
    };
  }
};

/**
 * Cập nhật trạng thái tài khoản (Admin only)
 * PATCH /api/admin/users/:id/status
 */
export const updateAdminUserStatus = async (
  id: string,
  status: "active" | "inactive" | "blocked"
) => {
  try {
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái.",
    };
  }
};

/**
 * Cập nhật vai trò người dùng (Admin only)
 * PATCH /api/admin/users/:id/role
 */
export const updateAdminUserRole = async (
  id: string,
  role: "user" | "admin" | "event_organizer"
) => {
  try {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật vai trò.",
    };
  }
};
