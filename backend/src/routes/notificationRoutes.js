const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const auth = require("../middleware/auth");

// Đặt route cụ thể TRƯỚC route có params để tránh conflict
router.get("/unread-count", auth, getUnreadCount);
router.put("/read-all", auth, markAllAsRead);

router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markAsRead);

module.exports = router;
