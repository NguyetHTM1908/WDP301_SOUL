import apiClient from "./api";

type RegistrationStatusFilter = "all" | "registered" | "cancelled";

const getErrorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || error.message || fallback;

export const eventAdminService = {
  getEvents: async () => {
    try {
      const response = await apiClient.get("/events");
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the tai danh sach su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEvents loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  getEventById: async (id: string) => {
    try {
      const response = await apiClient.get(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the tai chi tiet su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEventById loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  getEventRegistrations: async (
    id: string,
    status: RegistrationStatusFilter = "all"
  ) => {
    try {
      const response = await apiClient.get(`/events/${id}/registrations`, {
        params: { status, limit: 100 },
      });
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(
        error,
        "Khong the tai danh sach nguoi dang ky"
      );
      const errStatus = error.response?.status;
      console.error(`[EventAPI] getEventRegistrations loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  createEvent: async (eventData: any) => {
    try {
      const response = await apiClient.post("/events", eventData);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the tao su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] createEvent loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  updateEvent: async (id: string, eventData: any) => {
    try {
      const response = await apiClient.patch(`/events/${id}`, eventData);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the cap nhat su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] updateEvent loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  deleteEvent: async (id: string) => {
    try {
      const response = await apiClient.delete(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the xoa su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] deleteEvent loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },
};
