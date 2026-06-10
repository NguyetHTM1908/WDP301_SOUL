const User = require("../models/User");

/**
 * @desc    Lấy danh sách tất cả người dùng (có filter, search, phân trang)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    // Xây dựng query filter
    const filter = {};

    if (role && ["user", "admin", "event_organizer"].includes(role)) {
      filter.role = role;
    }
    if (status && ["active", "inactive", "blocked"].includes(status)) {
      filter.status = status;
    }
    if (search && search.trim()) {
      const keyword = search.trim();
      filter.$or = [
        { fullName: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách người dùng thành công.",
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy danh sách người dùng: " + error.message,
    });
  }
};

/**
 * @desc    Lấy chi tiết một người dùng theo ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin người dùng thành công.",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin người dùng: " + error.message,
    });
  }
};

/**
 * @desc    Cập nhật trạng thái tài khoản (khóa/mở khóa)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "inactive", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ. Chỉ chấp nhận: active, inactive, blocked.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Không cho phép admin tự khóa bản thân
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi trạng thái tài khoản của chính bạn.",
      });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái tài khoản từ "${oldStatus}" sang "${status}".`,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật trạng thái: " + error.message,
    });
  }
};

/**
 * @desc    Cập nhật vai trò người dùng (gán/thu hồi Event Organizer, Admin)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin", "event_organizer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Vai trò không hợp lệ. Chỉ chấp nhận: user, admin, event_organizer.",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng.",
      });
    }

    // Không cho phép admin tự đổi vai trò của chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể thay đổi vai trò của chính bạn.",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    const roleLabels = {
      user: "Người dùng",
      admin: "Quản trị viên",
      event_organizer: "Người tổ chức sự kiện",
    };

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật vai trò từ "${roleLabels[oldRole] || oldRole}" sang "${roleLabels[role]}".`,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi cập nhật vai trò: " + error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
};
