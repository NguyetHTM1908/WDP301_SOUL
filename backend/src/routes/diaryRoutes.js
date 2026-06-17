const express = require("express");
const router = express.Router();

const {
  createDiary,
  getMyDiaries,
  getDiaryById,
  updateDiary,
  deleteDiary,
} = require("../controllers/diaryController");

const auth = require("../middleware/auth");

router.post("/", auth, createDiary);
router.get("/", auth, getMyDiaries);
router.get("/:id", auth, getDiaryById);
router.patch("/:id", auth, updateDiary);
router.delete("/:id", auth, deleteDiary);

module.exports = router;