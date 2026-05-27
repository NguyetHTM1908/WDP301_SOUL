const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByPost,
  updateMyComment,
  deleteMyComment,
} = require("../controllers/commentController");

const auth = require("../middleware/auth");
const checkForumBan = require("../middleware/checkForumBan");

router.get("/post/:postId", getCommentsByPost);

router.post("/", auth, checkForumBan, createComment);
router.put("/:id", auth, checkForumBan, updateMyComment);
router.delete("/:id", auth, deleteMyComment);

module.exports = router;