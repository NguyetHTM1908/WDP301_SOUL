import apiClient from "./api";

type RegistrationStatusFilter = "all" | "registered" | "cancelled";
type EventStatusFilter = "all" | "upcoming" | "ongoing" | "completed" | "cancelled";

const getErrorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || error.message || fallback;

const fetchEvents = async (params?: {
  status?: EventStatusFilter;
  eventType?: string;
  page?: number;
  limit?: number;
}) => {
  const query = {
    ...params,
    status: params?.status === "all" ? undefined : params?.status,
  };

  const response = await apiClient.get("/events", { params: query });
  return response.data;
};

export const eventAdminService = {
  getEvents: async () => {
    try {
      return await fetchEvents();
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

export const eventUserService = {
  getEvents: async (params?: {
    status?: EventStatusFilter;
    eventType?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      return await fetchEvents(params);
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the tai danh sach su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] user getEvents loi ${errStatus}:`, errMsg);
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
      console.error(`[EventAPI] user getEventById loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  getRegisteredEvents: async (
    status: RegistrationStatusFilter = "all",
    page = 1,
    limit = 100
  ) => {
    try {
      const response = await apiClient.get("/events/me/registered", {
        params: { status, page, limit },
      });
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(
        error,
        "Khong the tai danh sach su kien da dang ky"
      );
      const errStatus = error.response?.status;
      console.error(`[EventAPI] user getRegisteredEvents loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  registerEvent: async (id: string) => {
    try {
      const response = await apiClient.post(`/events/${id}/register`);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the dang ky su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] user registerEvent loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },

  cancelRegistration: async (id: string) => {
    try {
      const response = await apiClient.post(`/events/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      const errMsg = getErrorMessage(error, "Khong the huy dang ky su kien");
      const errStatus = error.response?.status;
      console.error(`[EventAPI] user cancelRegistration loi ${errStatus}:`, errMsg);
      throw new Error(errMsg);
    }
  },
};
