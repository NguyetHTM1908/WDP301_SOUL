import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/api/config";

const EVENT_PATH = "/events";

export type EventApprovalStatus = "pending" | "approved" | "rejected";

export type EventScheduleStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type EventTypeValue =
  | "workshop"
  | "talkshow"
  | "webinar"
  | "community_event";

export type EventMode = "online" | "offline";

export type RegistrationStatus =
  | "all"
  | "registered"
  | "cancelled"
  | "attended";

export type EventPayload = {
  title: string;
  description?: string | null;
  speakerName?: string | null;
  organizerName?: string | null;
  contactEmail?: string | null;
  bannerImage?: string | null;
  images?: { url: string; type?: "image" }[];
  eventType?: EventTypeValue | null;
  eventMode: EventMode;
  startDateTime: string;
  endDateTime: string;
  location?: string | null;
  meetingLink?: string | null;
  capacity?: number | null;
};

async function getToken() {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("Bạn cần đăng nhập.");
  }

  return token;
}

async function handleResponse(res: Response) {
  const text = await res.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("EVENT API STATUS:", res.status);
  console.log("EVENT API DATA:", data);

  if (!res.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        JSON.stringify(data) ||
        `API error ${res.status}`
    );
  }

  return data;
}

async function authHeaders() {
  const token = await getToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function jsonAuthHeaders() {
  const token = await getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function buildQuery(params?: Record<string, any>) {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

export function normalizeListResponse(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.events)) return res.events;
  if (Array.isArray(res?.data?.events)) return res.data.events;
  return [];
}


export const eventService = {
  async getEvents(params?: {
    eventType?: EventTypeValue | string;
    eventMode?: EventMode | string;
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
  }) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}${EVENT_PATH}${query ? `?${query}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
    });

    return handleResponse(res);
  },

  async getEventCalendar(params?: { from?: string; to?: string }) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}${EVENT_PATH}/calendar${
      query ? `?${query}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
    });

    return handleResponse(res);
  },

  async getEventById(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/${id}`, {
      method: "GET",
    });

    return handleResponse(res);
  },

  async registerEvent(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/${id}/register`, {
      method: "POST",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async cancelRegistration(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/${id}/cancel`, {
      method: "POST",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async getRegisteredEvents(params?: {
    status?: RegistrationStatus;
    page?: number;
    limit?: number;
  }) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}${EVENT_PATH}/me/registered${
      query ? `?${query}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async getMyCalendar(params?: {
    status?: RegistrationStatus;
    page?: number;
    limit?: number;
  }) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}${EVENT_PATH}/me/calendar${
      query ? `?${query}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },
};

export const eventOwnerService = {
  async createEvent(body: EventPayload) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}`, {
      method: "POST",
      headers: await jsonAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  async getMyEvents() {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/me/created`, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async getMyEventById(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/me/created/${id}`, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async updateEvent(id: string, body: Partial<EventPayload>) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/${id}`, {
      method: "PATCH",
      headers: await jsonAuthHeaders(),
      body: JSON.stringify(body),
    });

    return handleResponse(res);
  },

  async deleteEvent(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/${id}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },
};


export const eventAdminService = {
  async getAdminAllEvents(params?: {
    approvalStatus?: EventApprovalStatus;
    status?: EventScheduleStatus;
    eventMode?: EventMode;
    eventType?: EventTypeValue;
    page?: number;
    limit?: number;
  }) {
    const query = buildQuery(params);
    const url = `${API_BASE_URL}${EVENT_PATH}/admin/all${
      query ? `?${query}` : ""
    }`;

    const res = await fetch(url, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async getAdminPendingEvents() {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/admin/pending`, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async getEventById(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/admin/${id}`, {
      method: "GET",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async approveEvent(id: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/admin/${id}/approve`, {
      method: "PATCH",
      headers: await authHeaders(),
    });

    return handleResponse(res);
  },

  async rejectEvent(id: string, reason?: string) {
    const res = await fetch(`${API_BASE_URL}${EVENT_PATH}/admin/${id}/reject`, {
      method: "PATCH",
      headers: await jsonAuthHeaders(),
      body: JSON.stringify({
        reason: reason || "Event không phù hợp hoặc thiếu thông tin.",
      }),
    });

    return handleResponse(res);
  },

  async getEventRegistrations(
    id: string,
    status: RegistrationStatus = "all",
    params?: {
      page?: number;
      limit?: number;
    }
  ) {
    const query = buildQuery({
      status,
      page: params?.page,
      limit: params?.limit,
    });

    const res = await fetch(
      `${API_BASE_URL}${EVENT_PATH}/${id}/registrations${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
        headers: await authHeaders(),
      }
    );

    return handleResponse(res);
  },
};