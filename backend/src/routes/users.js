const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  getUserPosts,
  getUserFriends,
  getFriendRecommendations,
  getFriendshipStatus,
  friendshipAction,
  getPendingFriendRequests,
  searchUsers,
} = require("../controllers/userController");
const auth = require("../middleware/auth");

// Lấy danh sách yêu cầu kết bạn đang chờ (Đặt TRƯỚC /:id để tránh trùng lặp route)
router.get("/friend-requests/pending", auth, getPendingFriendRequests);

// Tìm kiếm người dùng theo tên hoặc email (Phải đặt TRƯỚC /:id)
router.get("/search", auth, searchUsers);

// Gợi ý kết bạn dựa trên cảm xúc (Cần token đăng nhập)
router.get("/recommendations", auth, getFriendRecommendations);

// Lấy trạng thái kết bạn hiện tại
router.get("/:id/friendship-status", auth, getFriendshipStatus);

// Thực hiện gửi yêu cầu kết bạn / chấp nhận / hủy kết bạn
router.post("/:id/friendship-action", auth, friendshipAction);

// Lấy thông tin cá nhân của một user cụ thể
router.get("/:id", auth, getUserProfile);

// Lấy bài viết của một user cụ thể
router.get("/:id/posts", auth, getUserPosts);

// Lấy danh sách bạn bè của một user cụ thể
router.get("/:id/friends", auth, getUserFriends);

module.exports = router;
