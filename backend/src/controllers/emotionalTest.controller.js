const emotionalTestService = require("../services/emotionalTest.service");

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
    const testType = req.query.testType || req.params.testType || "WHO5";
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

    const { testType = "WHO5", answers } = req.body;

    const result = await emotionalTestService.submitTest({
      userId,
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

    const { testType } = req.query;
    const results = await emotionalTestService.getMyResults(userId, testType);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy lịch sử kết quả.",
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

    const { testType } = req.query;
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

module.exports = {
  getAllTests,
  getQuestions,
  submitTest,
  getMyResults,
  getLatestResult,
};