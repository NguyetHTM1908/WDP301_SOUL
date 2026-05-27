import { Platform } from "react-native";

const LOCALHOST = "http://localhost:5000/api";

// Nếu chạy Expo Go trên điện thoại, đổi IP này thành IPv4 máy tính của m
const LAN_HOST = "http://192.168.1.5:5000/api";

export const API_BASE_URL = Platform.OS === "web" ? LOCALHOST : LAN_HOST;

export type ReactionType = "like" | "support" | "hug";

async function handleResponse(res: Response) {
  const data = await res.json();
  return data;
}

export async function getApprovedPosts() {
  const res = await fetch(`${API_BASE_URL}/posts`);
  return handleResponse(res);
}
export async function getMyPosts(token: string) {
  const res = await fetch(`${API_BASE_URL}/posts/my-posts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(res);
}

export async function createPost(token: string, body: any) {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function reactToPost(
  token: string,
  postId: string,
  type: ReactionType
) {
  const res = await fetch(`${API_BASE_URL}/reactions/posts/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type }),
  });

  return handleResponse(res);
}

export async function reportPost(
  token: string,
  postId: string,
  reason: string,
  description: string
) {
  const res = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetType: "post",
      targetId: postId,
      reason,
      description,
    }),
  });

  return handleResponse(res);
}