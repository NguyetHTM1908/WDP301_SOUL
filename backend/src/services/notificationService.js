const Notification = require("../models/Notification");

/**
 * Tạo thông báo cho một user.
 * Tự động bỏ qua lỗi để không làm gián đoạn luồng chính.
 *
 * @param {string|ObjectId} userId - ID người nhận thông báo
 * @param {string} type - Loại thông báo (theo enum trong Notification model)
 * @param {string} title - Tiêu đề thông báo
 * @param {string} content - Nội dung thông báo
 * @param {{ type: string, id: string|ObjectId }|null} related - Liên kết đến đối tượng liên quan
 */
async function createNotification(userId, type, title, content, related = null) {
  try {
    await Notification.create({
      userId,
      type,
      title,
      content,
      related: related || { type: null, id: null },
      isRead: false,
    });
  } catch (err) {
    // Silent fail - thông báo không được làm gián đoạn luồng chính
    console.warn("[NotificationService] Failed to create notification:", err.message);
  }
}

module.exports = { createNotification };
