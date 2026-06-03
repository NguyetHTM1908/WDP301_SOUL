import apiClient from "./api";

export const eventAdminService = {
  // Lấy danh sách sự kiện
  getEvents: async () => {
    try {
      const response = await apiClient.get("/events");
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Không thể tải danh sách sự kiện";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEvents lỗi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  // Lấy chi tiết sự kiện theo ID
  getEventById: async (id: string) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Không thể tải chi tiết sự kiện";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEventById lỗi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  // Tạo sự kiện mới
  createEvent: async (eventData: any) => {
    try {
      console.log("[EventAPI] createEvent - Token header:", apiClient.defaults.headers.common["Authorization"]);
      const response = await apiClient.post("/events", eventData);
      console.log("[EventAPI] createEvent thành công:", response.status);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Không thể tạo sự kiện";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] createEvent lỗi ${errStatus}:`, errMsg, error.response?.data);
      throw new Error(errMsg);
    }
  },

  // Cập nhật sự kiện
  updateEvent: async (id: string, eventData: any) => {
    try {
      console.log("[EventAPI] updateEvent - Token header:", apiClient.defaults.headers.common["Authorization"]);
      const response = await apiClient.patch(`/events/${id}`, eventData);
      console.log("[EventAPI] updateEvent thành công:", response.status);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Không thể cập nhật sự kiện";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] updateEvent lỗi ${errStatus}:`, errMsg, error.response?.data);
      throw new Error(errMsg);
    }
  },

  // Xóa sự kiện
  deleteEvent: async (id: string) => {
    try {
      console.log("[EventAPI] deleteEvent id:", id, "- Token:", apiClient.defaults.headers.common["Authorization"]);
      const response = await apiClient.delete(`/events/${id}`);
      console.log("[EventAPI] deleteEvent thành công:", response.status, response.data);
      return response.data;
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || "Không thể xóa sự kiện";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] deleteEvent lỗi ${errStatus}:`, errMsg, error.response?.data);
      throw new Error(errMsg);
    }
  },

  getEventRegistrations: async (
    id: string,
    params?: { status?: string; page?: number; limit?: number }
  ) => {
    try {
      const response = await apiClient.get(`/events/${id}/registrations`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Khong the tai danh sach nguoi dang ky";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEventRegistrations error ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  removeEventRegistration: async (eventId: string, userId: string) => {
    try {
      const response = await apiClient.delete(`/events/${eventId}/registrations/${userId}`);
      return response.data;
    } catch (error: any) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Khong the xoa dang ky khoi su kien";
      const errStatus = error.response?.status;
      console.error(`[EventAPI] removeEventRegistration error ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },
};
