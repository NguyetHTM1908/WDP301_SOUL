const express = require("express");
const router = express.Router();

const {
  createJournal,
  getJournalHistory,
  getJournalDetail,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");

// TODO: Gắn middleware auth và bỏ userId tạm từ body/query — dùng req.user._id

router.post("/", createJournal);
router.get("/", getJournalHistory);
router.get("/:id", getJournalDetail);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

module.exports = router;
