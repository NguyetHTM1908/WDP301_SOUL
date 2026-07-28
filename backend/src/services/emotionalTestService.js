const mongoose = require("mongoose");

const EmotionalTest = require("../models/EmotionalTest");
const EmotionalTestResult = require("../models/emotionalTestResultModel");

function getNextMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function normalizeText(value) {
  return String(value || "").trim();
}

async function getActiveTest(testId) {
  if (testId) {
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      throw new Error("testId không hợp lệ.");
    }

    const test = await EmotionalTest.findOne({
      _id: testId,
      isActive: true,
    });

    if (!test) {
      throw new Error("Không tìm thấy bài kiểm tra.");
    }

    return test;
  }

  const test = await EmotionalTest.findOne({ isActive: true }).sort({
    createdAt: -1,
  });

  if (!test) {
    throw new Error("Chưa có bài kiểm tra nào đang hoạt động.");
  }

  return test;
}

function findResultRule(test, totalScore) {
  const rule = test.resultRules.find(
    (item) => totalScore >= item.minScore && totalScore <= item.maxScore
  );

  if (!rule) {
    throw new Error("Không tìm thấy thang điểm phù hợp với kết quả.");
  }

  return rule;
}

function validateAnswers(test, answers) {
  if (!Array.isArray(answers)) {
    throw new Error("Danh sách câu trả lời không hợp lệ.");
  }

  if (answers.length !== test.questions.length) {
    throw new Error(`Bạn cần trả lời đủ ${test.questions.length} câu hỏi.`);
  }

  const checkedQuestionIndexes = new Set();

  for (const item of answers) {
    if (typeof item.questionIndex !== "number") {
      throw new Error("questionIndex phải là số.");
    }

    if (item.questionIndex < 0 || item.questionIndex >= test.questions.length) {
      throw new Error(`questionIndex ${item.questionIndex} không hợp lệ.`);
    }

    if (checkedQuestionIndexes.has(item.questionIndex)) {
      throw new Error(`Câu hỏi ${item.questionIndex + 1} bị trả lời trùng.`);
    }

    checkedQuestionIndexes.add(item.questionIndex);

    if (!item.answer || typeof item.answer !== "string") {
      throw new Error(`Câu hỏi ${item.questionIndex + 1} chưa có câu trả lời.`);
    }
  }
}

function calculateEmotionalIntelligenceResult(test, answers) {
  const answerMap = new Map();

  for (const item of answers) {
    answerMap.set(item.questionIndex, item);
  }

  const calculatedAnswers = test.questions.map((question, index) => {
    const userAnswer = answerMap.get(index);
    const selectedAnswer = normalizeText(userAnswer.answer);
    const correctAnswer = normalizeText(question.correctAnswer);

    const selectedOption = question.options.find(
      (option) => normalizeText(option.label) === selectedAnswer
    );

    if (!selectedOption) {
      throw new Error(
        `Đáp án "${selectedAnswer}" không thuộc lựa chọn của câu ${index + 1}.`
      );
    }

    const isCorrect = selectedAnswer === correctAnswer;
    const score = isCorrect ? 1 : 0;

    return {
      questionIndex: index,
      answer: selectedAnswer,
      correctAnswer,
      score,
      isCorrect,
    };
  });

  const totalScore = calculatedAnswers.reduce((sum, item) => sum + item.score, 0);
  const resultRule = findResultRule(test, totalScore);

  return {
    calculatedAnswers,
    totalScore,
    resultRule,
  };
}

async function getAllTests() {
  const tests = await EmotionalTest.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select("_id title description questions resultRules isActive createdAt updatedAt");

  return tests.map((test) => ({
    _id: test._id,
    testId: test._id,
    title: test.title,
    description: test.description,
    totalQuestions: test.questions.length,
    maxScore: test.questions.length,
    resultRules: test.resultRules,
    isActive: test.isActive,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  }));
}

async function getQuestions(testTypeOrId) {
  let testId = null;

  if (testTypeOrId && mongoose.Types.ObjectId.isValid(testTypeOrId)) {
    testId = testTypeOrId;
  }

  const test = await getActiveTest(testId);

  return {
    _id: test._id,
    testId: test._id,
    title: test.title,
    description: test.description,
    totalQuestions: test.questions.length,
    maxScore: test.questions.length,
    resultRules: test.resultRules,
    questions: test.questions.map((question, index) => ({
      questionIndex: index,
      question: question.question,
      imageUrl: question.imageUrl,
      answerImageUrl: question.answerImageUrl,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      options: question.options,
    })),
  };
}

async function submitTest({ userId, testType, testId, answers }) {
  const finalTestId = testId || testType;
  const test = await getActiveTest(
    finalTestId && mongoose.Types.ObjectId.isValid(finalTestId)
      ? finalTestId
      : null
  );

  validateAnswers(test, answers);

  const { calculatedAnswers, totalScore, resultRule } =
    calculateEmotionalIntelligenceResult(test, answers);

  const nextTestDueAt = getNextMonthDate();

  const result = await EmotionalTestResult.create({
    userId,
    testId: test._id,
    answers: calculatedAnswers,
    totalScore,
    resultLevel: resultRule.level,
    title: resultRule.title,
    description: resultRule.description,
    advice: resultRule.advice,
    suggestion: resultRule.suggestion,
    nextTestDueAt,
  });

  return {
    _id: result._id,
    testId: test._id,
    testTitle: test.title,
    totalScore,
    maxScore: test.questions.length,
    resultLevel: resultRule.level,
    title: resultRule.title,
    description: resultRule.description,
    advice: resultRule.advice,
    suggestion: resultRule.suggestion,
    nextTestDueAt,
    answers: calculatedAnswers,
  };
}

async function getMyResults(userId, testTypeOrId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("userId không hợp lệ.");
  }

  const filter = { userId };

  if (testTypeOrId) {
    if (!mongoose.Types.ObjectId.isValid(testTypeOrId)) {
      throw new Error("testId không hợp lệ.");
    }

    filter.testId = testTypeOrId;
  }

  return EmotionalTestResult.find(filter)
    .populate("testId", "title description isActive")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
}

async function getLatestResult(userId, testTypeOrId) {
  const filter = { userId };

  if (testTypeOrId && mongoose.Types.ObjectId.isValid(testTypeOrId)) {
    filter.testId = testTypeOrId;
  }

  return EmotionalTestResult.findOne(filter)
    .populate("testId", "title description")
    .sort({ createdAt: -1 });
}
async function deleteMyResult(userId, resultId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("userId không hợp lệ.");
  }

  if (!mongoose.Types.ObjectId.isValid(resultId)) {
    throw new Error("resultId không hợp lệ.");
  }

  const deletedResult =
    await EmotionalTestResult.findOneAndDelete({
      _id: resultId,
      userId,
    }).lean();

  if (!deletedResult) {
    const error = new Error(
      "Không tìm thấy kết quả bài kiểm tra hoặc bạn không có quyền xóa kết quả này."
    );

    error.statusCode = 404;
    throw error;
  }

  return {
    resultId: deletedResult._id,
    testId: deletedResult.testId,
  };
}

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getMyResults,
  getLatestResult,
  deleteMyResult,
};