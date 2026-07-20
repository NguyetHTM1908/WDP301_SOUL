import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../api/config";

export type TestType = "WHO5" | "PSS10";

export type EmotionalTestInfo = {
  testType: TestType;
  title: string;
  shortTitle: string;
  duration: string;
  totalQuestions: number;
  source: string;
  description: string;
};

export type AnswerOption = {
  value: number;
  label: string;
};

export type EmotionalQuestion = {
  id: number;
  text: string;
  reverseScore?: boolean;
};

export type EmotionalTestQuestionsResponse = {
  testType: TestType;
  title: string;
  shortTitle: string;
  duration: string;
  totalQuestions: number;
  source: string;
  description: string;
  disclaimer: string;
  questions: EmotionalQuestion[];
  answerOptions: AnswerOption[];
};

export type EmotionalAnswer = {
  questionId: number;
  score: number;
};

export type EmotionalTestResult = {
  _id: string;
  userId: string;
  testType: TestType;
  testTitle: string;
  answers: Array<{
    questionId: number;
    score: number;
    calculatedScore: number;
  }>;
  rawScore: number;
  percentageScore: number;
  level:
    | "good"
    | "moderate"
    | "low"
    | "low_stress"
    | "moderate_stress"
    | "high_stress";
  levelLabel: string;
  suggestion: string;
  disclaimer: string;
  createdAt: string;
};

async function getAuthToken() {
  const token =
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("accessToken")) ||
    (await AsyncStorage.getItem("authToken"));

  return token;
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

export async function getEmotionalTestQuestions(testType: TestType = "WHO5") {
  const url = `${API_BASE_URL}/emotional-tests/questions?testType=${testType}`;

  console.log("GET:", url);

  const response = await fetch(url);
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể lấy câu hỏi.");
  }

  return data.data as EmotionalTestQuestionsResponse;
}

export async function submitEmotionalTest(
  testType: TestType,
  answers: EmotionalAnswer[]
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
      testType,
      answers,
    }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Không thể nộp bài kiểm tra.");
  }

  return data.data as EmotionalTestResult;
}

export async function getMyEmotionalTestResults(testType?: TestType) {
  const token = await getAuthToken();

  const query = testType ? `?testType=${testType}` : "";
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

export async function getLatestEmotionalTestResult(testType?: TestType) {
  const token = await getAuthToken();

  const query = testType ? `?testType=${testType}` : "";
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