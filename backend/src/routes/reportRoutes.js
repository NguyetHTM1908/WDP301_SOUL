const express = require("express");
const router = express.Router();

const {
  createReport,
  getMyReports,
} = require("../controllers/reportController");

const auth = require("../middleware/auth");

router.get("/my-reports", auth, getMyReports);
router.post("/", auth, createReport);

module.exports = router;