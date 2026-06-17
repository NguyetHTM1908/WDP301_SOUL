const emotionAnalysisService = require("../services/emotionAnalysisService");

function getCurrentUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.userId ||
    req.body.userId ||
    req.query.userId
  );
}

async function analyze(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { targetType, targetId, text } = req.body;

    const result = await emotionAnalysisService.analyze({
      userId,
      targetType,
      targetId,
      text,
    });

    return res.status(200).json({
      success: true,
      message: "Emotion analyzed successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMyEmotionProfile(req, res) {
  try {
    const userId = getCurrentUserId(req);

    const profile = await emotionAnalysisService.getUserEmotionProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMyEmotionHistory(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const limit = req.query.limit || 30;

    const history = await emotionAnalysisService.getUserEmotionHistory(
      userId,
      limit
    );

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  analyze,
  getMyEmotionProfile,
  getMyEmotionHistory,
};