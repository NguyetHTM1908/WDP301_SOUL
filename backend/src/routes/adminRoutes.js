const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getDashboardStats,
  getAdminNotifications,
  getAdminNotifUnreadCount,
  markAdminNotifRead,
  markAllAdminNotifsRead,
  sendSystemNotification,
} = require("../controllers/adminController");

const auth = require("../middleware/auth");

// ─── User Management ─────────────────────────────────────────────────────────
// Lấy danh sách tất cả user (có filter, search, phân trang)
router.get("/users", auth, auth.isAdmin, getAllUsers);

// Lấy chi tiết một user
router.get("/users/:id", auth, auth.isAdmin, getUserById);

// Cập nhật trạng thái tài khoản (khóa/mở khóa)
router.patch("/users/:id/status", auth, auth.isAdmin, updateUserStatus);

// Cập nhật vai trò (gán/thu hồi event_organizer, admin)
router.patch("/users/:id/role", auth, auth.isAdmin, updateUserRole);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
// Lấy số liệu thống kê thực cho dashboard
router.get("/dashboard-stats", auth, auth.isAdmin, getDashboardStats);

// ─── Admin Notifications ──────────────────────────────────────────────────────
// Chú ý: route cụ thể phải đặt TRƯỚC route có params (:id)
router.get("/notifications/unread-count", auth, auth.isAdmin, getAdminNotifUnreadCount);
router.put("/notifications/read-all", auth, auth.isAdmin, markAllAdminNotifsRead);
router.get("/notifications", auth, auth.isAdmin, getAdminNotifications);
router.put("/notifications/:id/read", auth, auth.isAdmin, markAdminNotifRead);

// ─── Send System Notification (Broadcast) ────────────────────────────────────
// Gửi thông báo đến 1 user hoặc broadcast đến tất cả
router.post("/send-notification", auth, auth.isAdmin, sendSystemNotification);

module.exports = router;
