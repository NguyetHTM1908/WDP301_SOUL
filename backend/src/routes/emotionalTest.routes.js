const express = require("express");
const router = express.Router();

const emotionalTestController = require("../controllers/emotionalTest.controller");

// Chỉnh lại tên middleware theo project của bạn nếu khác.
const authMiddleware = require("../middleware/auth");

router.get("/", emotionalTestController.getAllTests);

router.get("/questions", emotionalTestController.getQuestions);

router.get("/questions/:testType", emotionalTestController.getQuestions);

router.post("/submit", authMiddleware, emotionalTestController.submitTest);

router.get("/my-results", authMiddleware, emotionalTestController.getMyResults);

router.get("/latest", authMiddleware, emotionalTestController.getLatestResult);

module.exports = router;