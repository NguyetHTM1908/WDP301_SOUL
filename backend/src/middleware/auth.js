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

    // Kiểm tra token có trong danh sách đen (đã đăng xuất) không
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại hoặc Token không hợp lệ.",
      });
    }

    // Đính kèm user, token và thời gian hết hạn vào request
    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp; // Unix timestamp khi token hết hạn
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = auth;
