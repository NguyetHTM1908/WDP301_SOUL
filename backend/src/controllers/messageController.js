const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

/**
 * GET /api/messages/conversations
 * Lấy danh sách hội thoại của user đang đăng nhập
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("lastMessage")
      .populate("participants", "fullName avatarUrl email")
      .sort({ lastMessageAt: -1 });

    // Tính số tin nhắn chưa đọc cho mỗi hội thoại
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiverId: userId,
          readAt: null,
        });

        // Lấy thông tin người đối thoại (không phải mình)
        const otherUser = conv.participants.find(
          (p) => p._id.toString() !== userId.toString()
        );

        return {
          _id: conv._id,
          otherUser: otherUser || null,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[getConversations] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tải danh sách hội thoại: " + error.message,
    });
  }
};

/**
 * GET /api/messages/conversations/:userId
 * Lấy tin nhắn trong hội thoại với 1 user cụ thể
 * Query params: page, limit
 */
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Tìm hoặc không tìm thấy conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!conversation) {
      // Chưa có hội thoại => trả về mảng rỗng
      return res.status(200).json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    const total = await Message.countDocuments({
      conversationId: conversation._id,
    });

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "fullName avatarUrl")
      .populate("receiverId", "fullName avatarUrl");

    return res.status(200).json({
      success: true,
      data: messages.reverse(), // trả về theo thứ tự cũ → mới
      conversationId: conversation._id,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[getMessages] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi tải tin nhắn: " + error.message,
    });
  }
};

/**
 * POST /api/messages/send
 * Gửi tin nhắn mới
 * Body: { receiverId, content }
 */
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Thiếu người nhận hoặc nội dung tin nhắn.",
      });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Không thể gửi tin nhắn cho chính mình.",
      });
    }

    // Kiểm tra user nhận có tồn tại không
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người nhận.",
      });
    }

    // Tìm hoặc tạo conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Tạo tin nhắn mới
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId,
      content: content.trim(),
    });

    // Cập nhật conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    // Populate trước khi trả về
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName avatarUrl")
      .populate("receiverId", "fullName avatarUrl");

    return res.status(201).json({
      success: true,
      data: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("[sendMessage] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi gửi tin nhắn: " + error.message,
    });
  }
};

/**
 * PUT /api/messages/read/:conversationId
 * Đánh dấu đã đọc tất cả tin nhắn trong hội thoại
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const result = await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        readAt: null,
      },
      {
        readAt: new Date(),
      }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
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
 * GET /api/messages/unread-count
 * Đếm tổng tin nhắn chưa đọc
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      receiverId: userId,
      readAt: null,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("[getUnreadCount] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi đếm tin nhắn chưa đọc: " + error.message,
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
