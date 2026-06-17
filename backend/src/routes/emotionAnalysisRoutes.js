const express = require("express");
const router = express.Router();

const emotionAnalysisController = require("../controllers/emotionAnalysisController");
const authMiddleware = require("../middleware/auth");

router.post("/analyze", authMiddleware, emotionAnalysisController.analyze);

router.get(
  "/me/profile",
  authMiddleware,
  emotionAnalysisController.getMyEmotionProfile
);

router.get(
  "/me/history",
  authMiddleware,
  emotionAnalysisController.getMyEmotionHistory
);

module.exports = router;