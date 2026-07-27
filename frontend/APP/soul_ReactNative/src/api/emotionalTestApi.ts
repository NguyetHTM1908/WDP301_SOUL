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
  description?: string | null;
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
  description?: string | null;
  totalQuestions: number;
  maxScore: number;
  resultRules: ResultRule[];
  questions: EmotionalQuestion[];
};

export type EmotionalAnswer = {
  questionIndex: number;
  answer: string;
};

export type CalculatedEmotionalAnswer = {
  questionIndex: number;
  answer: string;
  correctAnswer?: string | null;
  score: number;
  isCorrect: boolean;
};

/**
 * Kết quả trả về sau khi user nộp bài.
 */
export type EmotionalTestResult = {
  _id?: string;
  resultId?: string;

  testId: string;
  testTitle?: string;

  totalScore: number;
  maxScore?: number;

  resultLevel: ResultLevel;

  title?: string | null;
  description?: string | null;
  advice?: string | null;
  suggestion: string;

  nextTestDueAt?: string | null;

  answers: CalculatedEmotionalAnswer[];

  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Trường testId có thể đã được backend populate.
 */
type PopulatedTestReference =
  | string
  | {
      _id: string;
      title?: string;
      description?: string | null;
      isActive?: boolean;
    }
  | null;

/**
 * Dữ liệu thô backend có thể trả về khi xem lịch sử.
 */
type RawEmotionalTestHistoryItem = {
  _id: string;
  resultId?: string;

  testId: PopulatedTestReference;

  testTitle?: string;
  testDescription?: string | null;
  testIsActive?: boolean;

  totalScore: number;
  maxScore?: number;

  resultLevel: ResultLevel;

  title?: string | null;
  description?: string | null;
  advice?: string | null;
  suggestion: string;

  nextTestDueAt?: string | null;

  answers?: CalculatedEmotionalAnswer[];

  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Kiểu dữ liệu đã chuẩn hóa để màn hình lịch sử sử dụng.
 */
export type EmotionalTestHistoryItem = Omit<
  EmotionalTestResult,
  "testId" | "maxScore"
> & {
  _id: string;
  resultId?: string;

  testId: string | PopulatedEmotionalTest | null;

  testTitle?: string;
  testDescription?: string | null;
  testIsActive?: boolean;

  maxScore?: number;
  completedAt?: string;
  updatedAt?: string;
};
export type DeleteEmotionalTestResultData = {
  resultId: string;
  testId?: string | null;
  deletedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
};

async function getAuthToken(): Promise<string | null> {
  return (
    (await AsyncStorage.getItem("token")) ||
    (await AsyncStorage.getItem("accessToken")) ||
    (await AsyncStorage.getItem("authToken"))
  );
}

/**
 * Dùng cho các API bắt buộc đăng nhập.
 */
async function requireAuthToken(): Promise<string> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Bạn cần đăng nhập để sử dụng chức năng này.");
  }

  return token;
}

async function parseJsonResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  const text = await response.text();

  try {
    return text
      ? (JSON.parse(text) as ApiResponse<T>)
      : ({
          success: false,
          message: "API không trả về dữ liệu.",
          data: null,
        } as ApiResponse<T>);
  } catch {
    throw new Error("API trả về dữ liệu không phải JSON.");
  }
}

/**
 * Chuyển dữ liệu raw từ backend sang format thống nhất cho frontend.
 *
 * Hỗ trợ cả hai trường hợp:
 * 1. testId là chuỗi ObjectId.
 * 2. testId đã populate thành object.
 */
function normalizeHistoryItem(
  item: RawEmotionalTestHistoryItem
): EmotionalTestHistoryItem {
  const populatedTest =
    item.testId &&
    typeof item.testId === "object"
      ? item.testId
      : null;

  const normalizedTestId =
    typeof item.testId === "string"
      ? item.testId
      : populatedTest?._id || null;

  return {
    _id: item._id,
    resultId: item.resultId || item._id,

    testId: normalizedTestId,

    testTitle:
      item.testTitle ||
      populatedTest?.title ||
      "Bài kiểm tra không còn tồn tại",

    testDescription:
      item.testDescription ??
      populatedTest?.description ??
      null,

    testIsActive:
      item.testIsActive ??
      populatedTest?.isActive,

    totalScore: item.totalScore,
    maxScore: item.maxScore,

    resultLevel: item.resultLevel,

    title: item.title,
    description: item.description,
    advice: item.advice,
    suggestion: item.suggestion,

    nextTestDueAt: item.nextTestDueAt,

    answers: Array.isArray(item.answers)
      ? item.answers
      : [],

    completedAt:
      item.completedAt || item.createdAt,

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Lấy danh sách bài Emotional Test đang hoạt động.
 */
export async function getEmotionalTests(): Promise<
  EmotionalTestInfo[]
> {
  const url = `${API_BASE_URL}/emotional-tests`;

  console.log("GET:", url);

  const response = await fetch(url);

  const data =
    await parseJsonResponse<EmotionalTestInfo[]>(
      response
    );

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Không thể lấy danh sách bài test."
    );
  }

  return Array.isArray(data.data)
    ? data.data
    : [];
}

/**
 * Lấy câu hỏi của một Emotional Test.
 */
export async function getEmotionalTestQuestions(
  testId?: string
): Promise<EmotionalTestQuestionsResponse> {
  const query = testId
    ? `?testId=${encodeURIComponent(testId)}`
    : "";

  const url =
    `${API_BASE_URL}/emotional-tests/questions${query}`;

  console.log("GET:", url);

  const response = await fetch(url);

  const data =
    await parseJsonResponse<EmotionalTestQuestionsResponse>(
      response
    );

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Không thể lấy câu hỏi."
    );
  }

  return data.data;
}

/**
 * Nộp kết quả Emotional Test.
 */
export async function submitEmotionalTest(
  answers: EmotionalAnswer[],
  testId?: string
): Promise<EmotionalTestResult> {
  const token = await requireAuthToken();

  const url =
    `${API_BASE_URL}/emotional-tests/submit`;

  console.log("POST:", url);

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      testId,
      answers,
    }),
  });

  const data =
    await parseJsonResponse<EmotionalTestResult>(
      response
    );

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Không thể nộp bài kiểm tra."
    );
  }

  return data.data;
}

/**
 * UC06 - View Test History
 *
 * Xem toàn bộ lịch sử:
 * GET /emotional-tests/my-results
 *
 * Lọc theo bài test:
 * GET /emotional-tests/my-results?testId=<testId>
 */
export async function getMyEmotionalTestResults(
  testId?: string
): Promise<EmotionalTestHistoryItem[]> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Bạn cần đăng nhập để xem lịch sử kết quả.");
  }

  const query = testId
    ? `?testId=${encodeURIComponent(testId)}`
    : "";

  const url = `${API_BASE_URL}/emotional-tests/my-results${query}`;

  console.log("GET:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Không thể lấy lịch sử kết quả."
    );
  }

  return Array.isArray(data.data)
    ? (data.data as EmotionalTestHistoryItem[])
    : [];
}

/**
 * Lấy kết quả Emotional Test gần nhất.
 */
export async function getLatestEmotionalTestResult(
  testId?: string
): Promise<EmotionalTestHistoryItem | null> {
  const token = await requireAuthToken();

  const query = testId
    ? `?testId=${encodeURIComponent(testId)}`
    : "";

  const url =
    `${API_BASE_URL}/emotional-tests/latest${query}`;

  console.log("GET:", url);

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data =
    await parseJsonResponse<
      RawEmotionalTestHistoryItem | null
    >(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Không thể lấy kết quả gần nhất."
    );
  }

  if (!data.data) {
    return null;
  }

  return normalizeHistoryItem(data.data);
}

/**
 * UC08 - Delete Test History
 *
 * DELETE /emotional-tests/my-results/:resultId
 */
export async function deleteEmotionalTestResult(
  resultId: string
): Promise<DeleteEmotionalTestResultData> {
  const normalizedResultId = resultId.trim();

  if (!normalizedResultId) {
    throw new Error(
      "Không xác định được kết quả cần xóa."
    );
  }

  const token = await requireAuthToken();

  const url =
    `${API_BASE_URL}/emotional-tests/my-results/` +
    encodeURIComponent(normalizedResultId);

  console.log("DELETE:", url);

  const response = await fetch(url, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data =
    await parseJsonResponse<DeleteEmotionalTestResultData>(
      response
    );

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Không thể xóa kết quả bài kiểm tra."
    );
  }

  return data.data;
}
export type PopulatedEmotionalTest = {
  _id: string;
  title?: string;
  description?: string | null;
  isActive?: boolean;
};

export type DeleteEmotionalTestResultResponse = {
  resultId: string;
  testId?: string | null;
  deletedAt?: string;
};