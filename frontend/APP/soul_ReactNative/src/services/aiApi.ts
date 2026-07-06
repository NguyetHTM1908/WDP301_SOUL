import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@/api/config";
// nếu path khác thì sửa lại, ví dụ "@/config/api"

const AI_API_BASE_URL = `${API_BASE_URL.replace(/\/$/, "")}/ai`;

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export type ChatSession = {
  _id: string;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  sentiment?: string;
  emotion?: string;
  riskLevel?: string;
  createdAt: string;
};

export async function createChatSession() {
  const res = await fetch(`${AI_API_BASE_URL}/sessions`, {
    method: "POST",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Create chat session failed");
  }

  return data.data as ChatSession;
}

export async function getChatSessions() {
  const res = await fetch(`${AI_API_BASE_URL}/sessions`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Get chat sessions failed");
  }

  return data.data as ChatSession[];
}

export async function getChatMessages(sessionId: string) {
  const res = await fetch(`${AI_API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Get chat messages failed");
  }

  return data.data as ChatMessage[];
}

export async function sendMessageToSession(sessionId: string, message: string) {
  const res = await fetch(`${AI_API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Send message failed");
  }

  return data.data;
}

export async function deleteChatSession(sessionId: string) {
  const res = await fetch(`${AI_API_BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Delete chat session failed");
  }

  return true;
}