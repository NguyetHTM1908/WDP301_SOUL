const express = require("express");
const router = express.Router();

const {
  createReport,
  getMyReports,
  createAppeal,
} = require("../controllers/forum/reportController");

const auth = require("../middleware/auth");

router.get("/my-reports", auth, getMyReports);
router.post("/", auth, createReport);
router.post("/appeal", auth, createAppeal);

module.exports = router;