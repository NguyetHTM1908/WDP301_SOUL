import { API_BASE_URL } from "./config";

async function handleResponse(res: Response) {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || `API error ${res.status}`
    );
  }
  return data;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** Lấy danh sách thông báo */
export async function getNotifications(
  token: string,
  page: number = 1,
  limit: number = 30
) {
  const res = await fetch(
    `${API_BASE_URL}/notifications?page=${page}&limit=${limit}`,
    { method: "GET", headers: authHeaders(token) }
  );
  return handleResponse(res);
}

/** Đếm thông báo chưa đọc */
export async function getNotifUnreadCount(token: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Đánh dấu một thông báo đã đọc */
export async function markNotifAsRead(token: string, notifId: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
    method: "PUT",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/** Đánh dấu tất cả thông báo đã đọc */
export async function markAllNotifAsRead(token: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PUT",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
