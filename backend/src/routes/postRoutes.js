const express = require("express");
const router = express.Router();

const {
  createPost,
  getApprovedPosts,
  getPostDetail,
  getMyPosts,
  updateMyPost,
  deleteMyPost,
} = require(
  "../controllers/forum/postController"
);

const auth =
  require(
    "../middleware/auth"
  );

const checkForumBan =
  require(
    "../middleware/checkForumBan"
  );


router.get(
  "/",
  getApprovedPosts
);


router.get(
  "/my-posts",
  auth,
  getMyPosts
);


router.get(
  "/:id",
  auth,
  getPostDetail
);

router.post(
  "/",
  auth,
  checkForumBan,
  createPost
);

router.put(
  "/:id",
  auth,
  checkForumBan,
  updateMyPost
);

router.delete(
  "/:id",
  auth,
  deleteMyPost
);

module.exports =
  router;