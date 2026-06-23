import { API_BASE_URL } from "./config";

export type DiaryMood =
  | "happy"
  | "sad"
  | "stress"
  | "anxious"
  | "angry"
  | "neutral";

export type CreateDiaryBody = {
  mood: DiaryMood | string;
  moodScore: number;
  note?: string | null;
  isPrivate?: boolean;
};

async function handleResponse(res: Response) {
  const text = await res.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("DIARY API STATUS:", res.status);
  console.log("DIARY API DATA:", data);

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

function jsonAuthHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Nếu backend dùng /api/journals thì đổi "/diaries" thành "/journals"
const DIARY_PATH = "/diaries";

export async function getMyDiaries(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    mood?: string;
  }
) {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.mood && params.mood !== "all") query.append("mood", params.mood);

  const url = `${API_BASE_URL}${DIARY_PATH}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function createDiary(token: string, body: CreateDiaryBody) {
  const res = await fetch(`${API_BASE_URL}${DIARY_PATH}`, {
    method: "POST",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function updateDiary(
  token: string,
  diaryId: string,
  body: Partial<CreateDiaryBody>
) {
  const res = await fetch(`${API_BASE_URL}${DIARY_PATH}/${diaryId}`, {
    method: "PATCH",
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function deleteDiary(token: string, diaryId: string) {
  const res = await fetch(`${API_BASE_URL}${DIARY_PATH}/${diaryId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}

export async function getDiaryById(token: string, diaryId: string) {
  const res = await fetch(`${API_BASE_URL}${DIARY_PATH}/${diaryId}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse(res);
}