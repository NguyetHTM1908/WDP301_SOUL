const express = require("express");
const router = express.Router();

const { register, login, getProfile, logout } = require("../controllers/authController");
const auth = require("../middleware/auth");

// Đăng ký tài khoản mới (Public)
router.post("/register", register);

// Đăng nhập (Public)
router.post("/login", login);

// Lấy thông tin cá nhân của token đang đăng nhập (Private)
router.get("/me", auth, getProfile);

// Đăng xuất - vô hiệu hóa token phía server (Private)
// Dùng cho cả Mobile App (Flutter) và Web
router.post("/logout", auth, logout);

module.exports = router;
