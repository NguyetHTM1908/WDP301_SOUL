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

router.post(
  "/",
  (req, res, next) => {
    console.log("POST /api/posts route reached");
    next();
  },
  auth,
  (req, res, next) => {
    console.log("AUTH PASSED USER:", req.user);
    next();
  },
  checkForumBan,
  (req, res, next) => {
    console.log("FORUM BAN PASSED");
    next();
  },
  createPost
);

router.post("/", auth, checkForumBan, createPost);
router.put("/:id", auth, checkForumBan, updateMyPost);
router.delete("/:id", auth, deleteMyPost);

module.exports = router;