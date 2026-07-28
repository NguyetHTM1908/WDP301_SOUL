const User = require("../models/User");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const SafetyEvent = require("../models/SafetyEvent");

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

// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * @desc    Lấy số liệu thống kê thực cho Admin Dashboard
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user._id;

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      pendingReports,
      unresolvedSafetyEvents,
      adminUnreadNotifs,
      newUsersThisWeek,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "blocked" }),
      Report.countDocuments({ status: "pending" }),
      SafetyEvent.countDocuments({ isResolved: false }),
      Notification.countDocuments({
        userId: adminId,
        isRead: false,
        type: { $in: ["system", "safety_alert", "report_update", "moderation_review"] },
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy thống kê thành công.",
      data: {
        totalUsers,
        activeUsers,
        blockedUsers,
        pendingReports,
        unresolvedSafetyEvents,
        adminUnreadNotifs,
        newUsersThisWeek,
      },
    });
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi lấy thống kê: " + error.message,
    });
  }
};

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

/**
 * @desc    Lấy danh sách thông báo hệ thống dành cho Admin
 * @route   GET /api/admin/notifications
 * @access  Private (Admin only)
 */
const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Admin xem các thông báo hệ thống, cảnh báo an toàn, kiểm duyệt gửi đến tài khoản admin này
    const adminTypes = [
      "system",
      "safety_alert",
      "report_update",
      "moderation_review",
    ];

    const filter = {
      userId: adminId,
      type: { $in: adminTypes },
    };

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getAdminNotifications] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tải thông báo admin: " + error.message,
    });
  }
};

/**
 * @desc    Đếm thông báo admin chưa đọc
 * @route   GET /api/admin/notifications/unread-count
 * @access  Private (Admin only)
 */
const getAdminNotifUnreadCount = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminTypes = ["system", "safety_alert", "report_update", "moderation_review"];

    const count = await Notification.countDocuments({
      userId: adminId,
      isRead: false,
      type: { $in: adminTypes },
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("[getAdminNotifUnreadCount] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đếm thông báo admin: " + error.message,
    });
  }
};

/**
 * @desc    Đánh dấu một thông báo admin đã đọc
 * @route   PUT /api/admin/notifications/:id/read
 * @access  Private (Admin only)
 */
const markAdminNotifRead = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: adminId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông báo.",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("[markAdminNotifRead] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đánh dấu đã đọc: " + error.message,
    });
  }
};

/**
 * @desc    Đánh dấu tất cả thông báo admin đã đọc
 * @route   PUT /api/admin/notifications/read-all
 * @access  Private (Admin only)
 */
const markAllAdminNotifsRead = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminTypes = ["system", "safety_alert", "report_update", "moderation_review"];

    const result = await Notification.updateMany(
      { userId: adminId, isRead: false, type: { $in: adminTypes } },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[markAllAdminNotifsRead] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đánh dấu tất cả đã đọc: " + error.message,
    });
  }
};

// ============================================================
// SEND SYSTEM NOTIFICATION (BROADCAST)
// ============================================================

/**
 * @desc    Admin gửi thông báo hệ thống đến 1 user hoặc broadcast đến tất cả
 * @route   POST /api/admin/send-notification
 * @access  Private (Admin only)
 * @body    { title, content, targetUserId? }
 *          - Nếu không có targetUserId → broadcast đến tất cả user active
 *          - Nếu có targetUserId → gửi đến user đó
 */
const sendSystemNotification = async (req, res) => {
  try {
    const { title, content, targetUserId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tiêu đề thông báo không được để trống.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung thông báo không được để trống.",
      });
    }

    let recipientIds = [];

    if (targetUserId) {
      // Gửi đến 1 user cụ thể
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng đích.",
        });
      }
      recipientIds = [targetUserId];
    } else {
      // Broadcast: lấy tất cả user active (không bao gồm admin gửi)
      const users = await User.find(
        { status: "active", _id: { $ne: req.user._id } },
        { _id: 1 }
      ).lean();
      recipientIds = users.map((u) => u._id);
    }

    if (recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có người dùng nào để gửi thông báo.",
      });
    }

    // Tạo danh sách notification documents
    const notifications = recipientIds.map((userId) => ({
      userId,
      type: "system",
      title: title.trim(),
      content: content.trim(),
      related: { type: null, id: null },
      isRead: false,
    }));

    // Dùng insertMany để tăng hiệu suất broadcast
    const BATCH_SIZE = 500;
    let totalInserted = 0;
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE);
      await Notification.insertMany(batch, { ordered: false });
      totalInserted += batch.length;
    }

    return res.status(201).json({
      success: true,
      message: targetUserId
        ? "Đã gửi thông báo đến người dùng thành công."
        : `Đã broadcast thông báo đến ${totalInserted} người dùng.`,
      data: {
        totalSent: totalInserted,
        isBroadcast: !targetUserId,
      },
    });
  } catch (error) {
    console.error("[sendSystemNotification] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi gửi thông báo: " + error.message,
    });
  }
};

module.exports = {
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
};
