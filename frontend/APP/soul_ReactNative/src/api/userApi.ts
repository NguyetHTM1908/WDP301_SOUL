import { API_BASE_URL } from "./config";

async function handleResponse(res: Response) {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("USER API RESPONSE STATUS:", res.status);
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

export async function getUserProfile(token: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getUserPosts(token: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getUserFriends(token: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/friends`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getFriendRecommendations(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/recommendations`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getPendingFriendRequests(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/friend-requests/pending`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getFriendshipStatus(token: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/friendship-status`, {
    method: "GET",
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function friendshipAction(
  token: string,
  userId: string,
  action: "add" | "cancel" | "accept" | "remove" | "decline"
) {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/friendship-action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
}

export async function searchUsers(token: string, q: string) {
  const res = await fetch(
    `${API_BASE_URL}/users/search?q=${encodeURIComponent(q)}`,
    {
      method: "GET",
      headers: authHeaders(token),
    }
  );
  return handleResponse(res);
}
