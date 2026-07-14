import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../api/config";

export type ResultLevel =
  | "rat_thap"
  | "duoi_trung_binh"
  | "trung_binh"
  | "tot"
  | "xuat_sac";

export type EmotionalTestInfo = {
  _id: string;
  testId: string;
  title: string;
  description: string;
  totalQuestions: number;
  maxScore: number;
  resultRules?: ResultRule[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TestOption = {
  label: string;
  score: number;
};

export type EmotionalQuestion = {
  questionIndex: number;
  question: string;
  imageUrl?: string | null;
  answerImageUrl?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  options: TestOption[];
};

export type ResultRule = {
  level: ResultLevel;
  minScore: number;
  maxScore: number;
  title?: string | null;
  description?: string | null;
  advice?: string | null;
  suggestion: string;
};

export type EmotionalTestQuestionsResponse = {
  _id: string;
  testId: string;
  title: string;
  description: string;
  totalQuestions: number;
  maxScore: number;
  resultRules: ResultRule[];
  questions: EmotionalQuestion[];
};

export type EmotionalAnswer = {
  questionIndex: number;
  answer: string;
};

export type EmotionalTestResult = {
  _id?: string;
  testId: string;
  testTitle?: string;
  totalScore: number;
  maxScore: number;
  resultLevel: ResultLevel;
  title?: string | null;
  description?: string | null;
  advice?: string | null;
  suggestion: string;
  nextTestDueAt?: string | null;
  answers: Array<{
    questionIndex: number;
    answer: string;
    correctAnswer?: string | null;
    score: number;
    isCorrect: boolean;
  }>;
  createdAt?: string;
};

async function getAuthToken() {
  return (
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("accessToken")) ||
    (await AsyncStorage.getItem("authToken"))
  );
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error("API trả về dữ liệu không phải JSON.");
  }
}

export async function getEmotionalTests() {
  const url = `${API_BASE_URL}/emotional-tests`;

  console.log("GET:", url);

  const response = await fetch(url);
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy danh sách bài test.");
  }

  return data.data as EmotionalTestInfo[];
}

export async function getEmotionalTestQuestions(testId?: string) {
  const query = testId ? `?testId=${testId}` : "";
  const url = `${API_BASE_URL}/emotional-tests/questions${query}`;

  console.log("GET:", url);

  const response = await fetch(url);
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy câu hỏi.");
  }

  return data.data as EmotionalTestQuestionsResponse;
}

export async function submitEmotionalTest(
  answers: EmotionalAnswer[],
  testId?: string
) {
  const token = await getAuthToken();
  const url = `${API_BASE_URL}/emotional-tests/submit`;

  console.log("POST:", url);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      testId,
      answers,
    }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể nộp bài kiểm tra.");
  }

  return data.data as EmotionalTestResult;
}

export async function getMyEmotionalTestResults(testId?: string) {
  const token = await getAuthToken();
  const query = testId ? `?testId=${testId}` : "";
  const url = `${API_BASE_URL}/emotional-tests/my-results${query}`;

  console.log("GET:", url);

  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy lịch sử kết quả.");
  }

  return data.data as EmotionalTestResult[];
}

export async function getLatestEmotionalTestResult(testId?: string) {
  const token = await getAuthToken();
  const query = testId ? `?testId=${testId}` : "";
  const url = `${API_BASE_URL}/emotional-tests/latest${query}`;

  console.log("GET:", url);

  const response = await fetch(url, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy kết quả gần nhất.");
  }

  return data.data as EmotionalTestResult | null;
}