const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
} = require("../controllers/adminController");

const auth = require("../middleware/auth");

// Lấy danh sách tất cả user (có filter, search, phân trang)
router.get("/users", auth, auth.isAdmin, getAllUsers);

// Lấy chi tiết một user
router.get("/users/:id", auth, auth.isAdmin, getUserById);

// Cập nhật trạng thái tài khoản (khóa/mở khóa)
router.patch("/users/:id/status", auth, auth.isAdmin, updateUserStatus);

// Cập nhật vai trò (gán/thu hồi event_organizer, admin)
router.patch("/users/:id/role", auth, auth.isAdmin, updateUserRole);

module.exports = router;
