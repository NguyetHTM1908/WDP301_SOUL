const emotionalTestService = require("../services/emotionalTestService");

async function getAllTests(req, res) {
  try {
    const data = await emotionalTestService.getAllTests();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách bài test.",
    });
  }
}

async function getQuestions(req, res) {
  try {
    const testType =
      req.query.testId ||
      req.query.testType ||
      req.params.testType ||
      null;

    const data = await emotionalTestService.getQuestions(testType);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể lấy danh sách câu hỏi.",
    });
  }
}

async function submitTest(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để làm bài kiểm tra.",
      });
    }

    const { testId, testType, answers } = req.body;

    const result = await emotionalTestService.submitTest({
      userId,
      testId,
      testType,
      answers,
    });

    return res.status(201).json({
      success: true,
      message: "Đã lưu kết quả bài kiểm tra.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể nộp bài kiểm tra.",
    });
  }
}

async function getMyResults(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để xem lịch sử kết quả.",
      });
    }

    const testType = req.query.testId || req.query.testType;

    const results = await emotionalTestService.getMyResults(
      userId,
      testType
    );

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    const statusCode =
      error.message === "testId không hợp lệ." ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message || "Không thể lấy lịch sử kết quả.",
    });
  }
}

async function getLatestResult(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để xem kết quả gần nhất.",
      });
    }

    const testType = req.query.testId || req.query.testType;
    const result = await emotionalTestService.getLatestResult(userId, testType);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy kết quả gần nhất.",
    });
  }
}
async function deleteMyResult(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Bạn cần đăng nhập để xóa lịch sử kết quả.",
      });
    }

    const { resultId } = req.params;

    const result =
      await emotionalTestService.deleteMyResult(
        userId,
        resultId
      );

    return res.status(200).json({
      success: true,
      message: "Đã xóa kết quả bài kiểm tra.",
      data: result,
    });
  } catch (error) {
    let statusCode = error.statusCode || 500;

    if (
      error.message === "resultId không hợp lệ." ||
      error.message === "userId không hợp lệ."
    ) {
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Không thể xóa kết quả bài kiểm tra.",
    });
  }
}
module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getMyResults,
  getLatestResult,
  deleteMyResult,
};