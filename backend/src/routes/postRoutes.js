const express = require("express");
const router = express.Router();

const {
  createPost,
  getApprovedPosts,
  getPostDetail,
  getMyPosts,
  updateMyPost,
  deleteMyPost,
} = require("../controllers/postController");

const auth = require("../middleware/auth");
const checkForumBan = require("../middleware/checkForumBan");

router.get("/", getApprovedPosts);
router.get("/my-posts", auth, getMyPosts);

router.post("/", auth, checkForumBan, createPost);
router.put("/:id", auth, checkForumBan, updateMyPost);
router.delete("/:id", auth, deleteMyPost);

router.get("/:id", auth, getPostDetail);

module.exports = router;