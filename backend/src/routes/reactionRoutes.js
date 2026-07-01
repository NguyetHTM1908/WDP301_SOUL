const express = require("express");
const router = express.Router();

const {
  reactToPost,
  removePostReaction,
  reactToComment,
  removeCommentReaction,
} = require("../controllers/forum/reactionController");

const auth = require("../middleware/auth");

router.post("/posts/:postId", auth, reactToPost);
router.delete("/posts/:postId", auth, removePostReaction);

router.post("/comments/:commentId", auth, reactToComment);
router.delete("/comments/:commentId", auth, removeCommentReaction);

module.exports = router;