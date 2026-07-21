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
      data?.message ||
        data?.error ||
        JSON.stringify(data) ||
        `API error ${res.status}`
    );
  }

  return data;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Lấy danh sách hội thoại
 */
export async function getConversations(token: string) {
  const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

/**
 * Lấy tin nhắn trong hội thoại với 1 user
 */
export async function getMessages(
  token: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  const res = await fetch(
    `${API_BASE_URL}/messages/conversations/${userId}?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: authHeaders(token),
    }
  );
  return handleResponse(res);
}

/**
 * Gửi tin nhắn mới
 */
export async function sendMessage(
  token: string,
  receiverId: string,
  content: string
) {
  const res = await fetch(`${API_BASE_URL}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId, content }),
  });
  return handleResponse(res);
}

/**
 * Đánh dấu đã đọc tất cả tin nhắn trong hội thoại
 */
export async function markAsRead(token: string, conversationId: string) {
  const res = await fetch(
    `${API_BASE_URL}/messages/read/${conversationId}`,
    {
      method: "PUT",
      headers: authHeaders(token),
    }
  );
  return handleResponse(res);
}

/**
 * Đếm tổng tin nhắn chưa đọc
 */
export async function getUnreadCount(token: string) {
  const res = await fetch(`${API_BASE_URL}/messages/unread-count`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}
