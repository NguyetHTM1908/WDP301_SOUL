import apiClient from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  pendingReports: number;
  unresolvedSafetyEvents: number;
  adminUnreadNotifs: number;
  newUsersThisWeek: number;
}

export interface AdminNotification {
  _id: string;
  userId: string;
  type:
    | "system"
    | "safety_alert"
    | "report_update"
    | "moderation_review"
    | string;
  title: string;
  content: string;
  related?: { type?: string | null; id?: string | null };
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface SendNotificationPayload {
  title: string;
  content: string;
  targetUserId?: string; // nếu không có → broadcast
}

// ─── User Management APIs ────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả người dùng (Admin only)
 * GET /api/admin/users
 */
export const getAdminUsers = async (
  params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
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
      message:
        error.response?.data?.message || "Không thể lấy danh sách người dùng.",
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
      message:
        error.response?.data?.message ||
        "Không thể lấy thông tin người dùng.",
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
    const response = await apiClient.patch(`/admin/users/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể cập nhật trạng thái.",
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
      message:
        error.response?.data?.message || "Không thể cập nhật vai trò.",
    };
  }
};

// ─── Dashboard Stats API ─────────────────────────────────────────────────────

/**
 * Lấy số liệu thống kê thực cho Admin Dashboard
 * GET /api/admin/dashboard-stats
 */
export const getAdminDashboardStats = async (): Promise<{
  success: boolean;
  message?: string;
  data?: DashboardStats;
}> => {
  try {
    const response = await apiClient.get("/admin/dashboard-stats");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể lấy số liệu thống kê.",
    };
  }
};

// ─── Admin Notifications APIs ────────────────────────────────────────────────

/**
 * Lấy danh sách thông báo hệ thống dành cho Admin
 * GET /api/admin/notifications
 */
export const getAdminNotifications = async (
  page: number = 1,
  limit: number = 30
): Promise<{
  success: boolean;
  data?: AdminNotification[];
  unreadCount?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.get(
      `/admin/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể lấy thông báo admin.",
    };
  }
};

/**
 * Đếm thông báo admin chưa đọc
 * GET /api/admin/notifications/unread-count
 */
export const getAdminNotifUnreadCount = async (): Promise<{
  success: boolean;
  count?: number;
  message?: string;
}> => {
  try {
    const response = await apiClient.get("/admin/notifications/unread-count");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể đếm thông báo.",
    };
  }
};

/**
 * Đánh dấu một thông báo admin đã đọc
 * PUT /api/admin/notifications/:id/read
 */
export const markAdminNotifAsRead = async (id: string) => {
  try {
    const response = await apiClient.put(`/admin/notifications/${id}/read`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể đánh dấu đã đọc.",
    };
  }
};

/**
 * Đánh dấu tất cả thông báo admin đã đọc
 * PUT /api/admin/notifications/read-all
 */
export const markAllAdminNotifsRead = async () => {
  try {
    const response = await apiClient.put("/admin/notifications/read-all");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Không thể đánh dấu tất cả đã đọc.",
    };
  }
};

// ─── Send System Notification (Broadcast) ────────────────────────────────────

/**
 * Admin gửi thông báo hệ thống đến 1 user hoặc broadcast toàn bộ
 * POST /api/admin/send-notification
 */
export const sendSystemNotification = async (
  payload: SendNotificationPayload
): Promise<{
  success: boolean;
  message?: string;
  data?: { totalSent: number; isBroadcast: boolean };
}> => {
  try {
    const response = await apiClient.post(
      "/admin/send-notification",
      payload
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Không thể gửi thông báo.",
    };
  }
};
