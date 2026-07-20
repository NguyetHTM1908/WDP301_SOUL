import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://localhost:5000/api/ai";

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
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Create chat session failed");

  const data = await res.json();
  return data.data as ChatSession;
}

export async function getChatSessions() {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Get chat sessions failed");

  const data = await res.json();
  return data.data as ChatSession[];
}

export async function getChatMessages(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Get chat messages failed");

  const data = await res.json();
  return data.data as ChatMessage[];
}

export async function sendMessageToSession(sessionId: string, message: string) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error("Send message failed");

  const data = await res.json();
  return data.data;
}

export async function deleteChatSession(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Delete chat session failed");

  return true;
}