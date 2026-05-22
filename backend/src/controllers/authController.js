const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");

// Generate JWT Helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

/**
 * @desc    Đăng ký tài khoản người dùng mới
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, gender, dateOfBirth } = req.body;

    // 1. Kiểm tra các trường bắt buộc
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu.",
      });
    }

    // 2. Kiểm tra email định dạng hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Định dạng email không hợp lệ.",
      });
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    // 4. Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng để đăng ký tài khoản khác.",
      });
    }

    // 5. Kiểm tra xem số điện thoại đã tồn tại chưa (nếu có)
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Số điện thoại này đã được sử dụng.",
        });
      }
    }

    // 6. Mã hóa mật khẩu sử dụng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 7. Tạo người dùng mới
    const newUser = await User.create({
      fullName,
      email,
      phone: phone || null,
      passwordHash,
      gender: gender || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      role: "user",
      status: "active",
      isEmailVerified: false,
    });

    // 8. Tạo JWT token
    const token = generateToken(newUser._id);

    // 9. Trả về kết quả (toJSON đã tự động xóa passwordHash)
    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng ký tài khoản: " + error.message,
    });
  }
};

/**
 * @desc    Đăng nhập tài khoản
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
    }

    // 2. Tìm người dùng bằng email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 3. Kiểm tra trạng thái tài khoản
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }

    // 4. So sánh mật khẩu bằng bcryptjs
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 5. Cập nhật thời gian đăng nhập cuối cùng
    user.lastLoginAt = new Date();
    await user.save();

    // 6. Tạo JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng nhập: " + error.message,
    });
  }
};

/**
 * @desc    Lấy thông tin cá nhân hiện tại
 * @route   GET /api/auth/me
 * @access  Private (Cần Token)
 */
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Lấy thông tin cá nhân thành công.",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin cá nhân: " + error.message,
    });
  }
};

/**
 * @desc    Đăng xuất tài khoản (vô hiệu hóa token phía Server)
 * @route   POST /api/auth/logout
 * @access  Private (Cần Token)
 * @note    Hoạt động tốt cho cả Mobile App (Flutter) và Web.
 *          Sau khi gọi API này:
 *            - Mobile: xóa token khỏi Secure Storage.
 *            - Web: xóa token khỏi localStorage/sessionStorage/cookie.
 */
const logout = async (req, res) => {
  try {
    const token = req.token;
    const tokenExp = req.tokenExp; // Unix timestamp (giây) từ JWT payload

    // Chuyển đổi thời gian hết hạn từ Unix timestamp sang Date object
    const expiresAt = new Date(tokenExp * 1000);

    // Thêm token vào danh sách đen (blacklist)
    // Nếu token đã có trong blacklist (đăng xuất trùng), bỏ qua lỗi duplicate
    await TokenBlacklist.findOneAndUpdate(
      { token },
      { token, userId: req.user._id, expiresAt },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công. Hẹn gặp lại bạn!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi đăng xuất: " + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
};
