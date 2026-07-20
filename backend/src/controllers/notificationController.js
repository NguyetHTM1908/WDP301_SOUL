const Notification = require("../models/Notification");

/**
 * GET /api/notifications
 * Lấy danh sách thông báo của user đang đăng nhập (mới nhất trước)
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getNotifications] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tải thông báo: " + error.message,
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Đếm số thông báo chưa đọc
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("[getUnreadCount] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đếm thông báo: " + error.message,
    });
  }
};

/**
 * PUT /api/notifications/:id/read
 * Đánh dấu một thông báo đã đọc
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
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
    console.error("[markAsRead] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đánh dấu đã đọc: " + error.message,
    });
  }
};

/**
 * PUT /api/notifications/read-all
 * Đánh dấu tất cả thông báo đã đọc
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[markAllAsRead] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đánh dấu tất cả đã đọc: " + error.message,
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
