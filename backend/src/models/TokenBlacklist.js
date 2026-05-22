const mongoose = require("mongoose");

/**
 * Lưu trữ danh sách các token JWT đã bị vô hiệu hóa (Đăng xuất).
 * Token sẽ bị xóa tự động sau khi hết hạn (TTL Index).
 */
const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Thời điểm token hết hạn thực sự (theo JWT exp)
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// TTL Index: MongoDB sẽ TỰ ĐỘNG xóa document khi `expiresAt` đã qua.
// Điều này giúp Blacklist luôn gọn nhẹ, không cần xóa thủ công.
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenBlacklistSchema.index({ token: 1 }, { unique: true });

const TokenBlacklist = mongoose.model(
  "TokenBlacklist",
  tokenBlacklistSchema,
  "token_blacklist"
);

module.exports = TokenBlacklist;
