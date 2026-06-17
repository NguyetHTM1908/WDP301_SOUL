const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập. Token không được cung cấp.",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isBlacklisted = await TokenBlacklist.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại hoặc Token không hợp lệ.",
      });
    }

    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Không xác định được danh tính người dùng. Vui lòng đăng nhập.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Không có quyền truy cập. Chức năng này chỉ dành cho quản trị viên.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền truy cập: " + error.message,
    });
  }
};

auth.isAdmin = isAdmin;

module.exports = auth;