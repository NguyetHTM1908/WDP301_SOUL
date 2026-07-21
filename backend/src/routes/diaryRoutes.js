const express = require("express");
const router = express.Router();

const {
  createDiary,
  getMyDiaries,
  getDiaryById,
  updateDiary,
  deleteDiary,
  getDailySummaries,
  getDailySummaryByDate,
} = require("../controllers/diaryController");

const auth = require("../middleware/auth");

router.post("/", auth, createDiary);
router.get("/", auth, getMyDiaries);
router.get("/daily-summaries", auth, getDailySummaries);
router.get("/daily-summary/:date", auth, getDailySummaryByDate);
router.get("/:id", auth, getDiaryById);
router.patch("/:id", auth, updateDiary);
router.delete("/:id", auth, deleteDiary);

module.exports = router;