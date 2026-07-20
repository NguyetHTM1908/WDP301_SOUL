const express = require("express");
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require("../controllers/messageController");
const auth = require("../middleware/auth");

// Lấy số tin nhắn chưa đọc (đặt trước /:userId để tránh conflict)
router.get("/unread-count", auth, getUnreadCount);

// Lấy danh sách hội thoại
router.get("/conversations", auth, getConversations);

// Lấy tin nhắn trong hội thoại với 1 user
router.get("/conversations/:userId", auth, getMessages);

// Gửi tin nhắn mới
router.post("/send", auth, sendMessage);

// Đánh dấu đã đọc
router.put("/read/:conversationId", auth, markAsRead);

module.exports = router;
