const EmotionalTestResult = require("../models/emotionalTestResult.model");
const { TEST_DEFINITIONS, getTestDefinition } = require("../utils/emotionalTestQuestions");

function getWHO5Level(percentageScore) {
  if (percentageScore >= 70) {
    return {
      level: "good",
      levelLabel: "Well-being tốt",
      suggestion:
        "Gần đây bạn có trạng thái cảm xúc khá tích cực. Hãy tiếp tục duy trì những thói quen lành mạnh như ngủ đủ giấc, vận động nhẹ, học tập vừa sức và kết nối với người thân hoặc bạn bè.",
    };
  }

  if (percentageScore >= 50) {
    return {
      level: "moderate",
      levelLabel: "Well-being trung bình",
      suggestion:
        "Bạn có thể đang có một vài dấu hiệu mệt mỏi hoặc căng thẳng. Hãy thử nghỉ ngắn, viết nhật ký cảm xúc, chia nhỏ việc học hoặc công việc trong ngày.",
    };
  }

  return {
    level: "low",
    levelLabel: "Well-being thấp",
    suggestion:
      "Kết quả cho thấy bạn có thể đang cần quan tâm hơn đến cảm xúc của mình. Bạn có thể thử chia sẻ với người đáng tin cậy, viết nhật ký hoặc tìm đến chuyên gia nếu cảm giác này kéo dài hoặc trở nên nặng hơn.",
  };
}

function getPSS10Level(rawScore) {
  if (rawScore <= 13) {
    return {
      level: "low_stress",
      levelLabel: "Mức căng thẳng thấp",
      suggestion:
        "Mức căng thẳng hiện tại của bạn đang ở mức thấp. Hãy tiếp tục duy trì thói quen nghỉ ngơi, học tập hợp lý và chăm sóc bản thân đều đặn.",
    };
  }

  if (rawScore <= 26) {
    return {
      level: "moderate_stress",
      levelLabel: "Mức căng thẳng trung bình",
      suggestion:
        "Bạn có thể đang gặp một mức căng thẳng nhất định trong học tập hoặc cuộc sống. Hãy thử chia nhỏ công việc, nghỉ ngắn, vận động nhẹ hoặc trò chuyện với người bạn tin tưởng.",
    };
  }

  return {
    level: "high_stress",
    levelLabel: "Mức căng thẳng cao",
    suggestion:
      "Kết quả cho thấy bạn có thể đang chịu khá nhiều áp lực. Bạn nên ưu tiên nghỉ ngơi, giảm tải nếu có thể và cân nhắc tìm sự hỗ trợ từ người thân, cố vấn học tập hoặc chuyên gia nếu tình trạng kéo dài.",
  };
}

function validateTestType(testType) {
  if (!testType || !TEST_DEFINITIONS[testType]) {
    throw new Error("Loại bài kiểm tra không hợp lệ.");
  }
}

function validateAnswers(testDefinition, answers) {
  if (!Array.isArray(answers)) {
    throw new Error("Danh sách câu trả lời không hợp lệ.");
  }

  if (answers.length !== testDefinition.questions.length) {
    throw new Error(`Bạn cần trả lời đủ ${testDefinition.questions.length} câu hỏi.`);
  }

  const validQuestionIds = testDefinition.questions.map((q) => q.id);
  const duplicatedCheck = new Set();

  for (const answer of answers) {
    if (!validQuestionIds.includes(answer.questionId)) {
      throw new Error(`questionId ${answer.questionId} không hợp lệ.`);
    }

    if (duplicatedCheck.has(answer.questionId)) {
      throw new Error(`Câu hỏi ${answer.questionId} bị trả lời trùng.`);
    }

    duplicatedCheck.add(answer.questionId);

    if (typeof answer.score !== "number") {
      throw new Error("Điểm trả lời phải là số.");
    }

    const maxScore = testDefinition.testType === "WHO5" ? 5 : 4;

    if (answer.score < 0 || answer.score > maxScore) {
      throw new Error(`Điểm trả lời phải nằm trong khoảng từ 0 đến ${maxScore}.`);
    }
  }
}

function calculateWHO5(testDefinition, answers) {
  const calculatedAnswers = answers.map((answer) => ({
    questionId: answer.questionId,
    score: answer.score,
    calculatedScore: answer.score,
  }));

  const rawScore = calculatedAnswers.reduce(
    (sum, item) => sum + item.calculatedScore,
    0
  );

  const percentageScore = rawScore * 4;
  const resultInfo = getWHO5Level(percentageScore);

  return {
    calculatedAnswers,
    rawScore,
    percentageScore,
    ...resultInfo,
  };
}

function calculatePSS10(testDefinition, answers) {
  const questionMap = new Map(
    testDefinition.questions.map((question) => [question.id, question])
  );

  const calculatedAnswers = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    const calculatedScore = question.reverseScore ? 4 - answer.score : answer.score;

    return {
      questionId: answer.questionId,
      score: answer.score,
      calculatedScore,
    };
  });

  const rawScore = calculatedAnswers.reduce(
    (sum, item) => sum + item.calculatedScore,
    0
  );

  const percentageScore = Math.round((rawScore / 40) * 100);
  const resultInfo = getPSS10Level(rawScore);

  return {
    calculatedAnswers,
    rawScore,
    percentageScore,
    ...resultInfo,
  };
}

async function getAllTests() {
  return Object.values(TEST_DEFINITIONS).map((test) => ({
    testType: test.testType,
    title: test.title,
    shortTitle: test.shortTitle,
    duration: test.duration,
    totalQuestions: test.totalQuestions,
    source: test.source,
    description: test.description,
  }));
}

async function getQuestions(testType = "WHO5") {
  validateTestType(testType);

  const testDefinition = getTestDefinition(testType);

  return {
    testType: testDefinition.testType,
    title: testDefinition.title,
    shortTitle: testDefinition.shortTitle,
    duration: testDefinition.duration,
    totalQuestions: testDefinition.totalQuestions,
    source: testDefinition.source,
    description: testDefinition.description,
    disclaimer: testDefinition.disclaimer,
    questions: testDefinition.questions,
    answerOptions: testDefinition.answerOptions,
  };
}

async function submitTest({ userId, testType, answers }) {
  validateTestType(testType);

  const testDefinition = getTestDefinition(testType);

  validateAnswers(testDefinition, answers);

  const calculatedResult =
    testType === "WHO5"
      ? calculateWHO5(testDefinition, answers)
      : calculatePSS10(testDefinition, answers);

  const result = await EmotionalTestResult.create({
    userId,
    testType,
    testTitle: testDefinition.title,
    answers: calculatedResult.calculatedAnswers,
    rawScore: calculatedResult.rawScore,
    percentageScore: calculatedResult.percentageScore,
    level: calculatedResult.level,
    levelLabel: calculatedResult.levelLabel,
    suggestion: calculatedResult.suggestion,
    disclaimer: testDefinition.disclaimer,
  });

  return result;
}

async function getMyResults(userId, testType) {
  const filter = { userId };

  if (testType && TEST_DEFINITIONS[testType]) {
    filter.testType = testType;
  }

  return EmotionalTestResult.find(filter).sort({ createdAt: -1 }).limit(30);
}

async function getLatestResult(userId, testType) {
  const filter = { userId };

  if (testType && TEST_DEFINITIONS[testType]) {
    filter.testType = testType;
  }

  return EmotionalTestResult.findOne(filter).sort({ createdAt: -1 });
}

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getMyResults,
  getLatestResult,
};