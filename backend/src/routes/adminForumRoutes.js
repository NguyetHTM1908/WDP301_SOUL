const express = require("express");
const router = express.Router();

const {
  getAllPostsForAdmin,
  approvePost,
  rejectPost,
  hidePost,
  getReports,
  dismissReport,
  takeActionReport,
  hideComment,
  deleteCommentByAdmin,
} = require("../controllers/adminForumController");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/posts", auth, adminOnly, getAllPostsForAdmin);

router.patch("/posts/:id/approve", auth, adminOnly, approvePost);
router.patch("/posts/:id/reject", auth, adminOnly, rejectPost);
router.patch("/posts/:id/hide", auth, adminOnly, hidePost);

router.patch("/comments/:id/hide", auth, adminOnly, hideComment);
router.delete("/comments/:id", auth, adminOnly, deleteCommentByAdmin);

router.get("/reports", auth, adminOnly, getReports);
router.patch("/reports/:id/dismiss", auth, adminOnly, dismissReport);
router.patch("/reports/:id/action", auth, adminOnly, takeActionReport);

module.exports = router;