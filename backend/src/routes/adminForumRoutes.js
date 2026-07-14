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
  resolveAppeal,
} = require(
  "../controllers/forum/adminForumController"
);

const auth = require(
  "../middleware/auth"
);

const adminOnly = require(
  "../middleware/adminOnly"
);

router.use(auth);
router.use(adminOnly);

router.get(
  "/posts",
  getAllPostsForAdmin
);

router.patch(
  "/posts/:id/approve",
  approvePost
);

router.patch(
  "/posts/:id/reject",
  rejectPost
);

router.patch(
  "/posts/:id/hide",
  hidePost
);

router.patch(
  "/comments/:id/hide",
  hideComment
);

router.delete(
  "/comments/:id",
  deleteCommentByAdmin
);

router.get(
  "/reports",
  getReports
);

router.patch(
  "/reports/:id/dismiss",
  dismissReport
);

router.patch(
  "/reports/:id/action",
  takeActionReport
);

router.patch(
  "/reports/:id/appeal",
  resolveAppeal
);

module.exports = router;