const checkForumBan = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để thực hiện hành động này.",
      });
    }

    if (req.user.forumBannedUntil) {
      const bannedUntil = new Date(req.user.forumBannedUntil);

      if (!Number.isNaN(bannedUntil.getTime()) && bannedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          message: `Bạn bị cấm đăng bài/bình luận đến ${bannedUntil.toLocaleDateString()}`,
        });
      }
    }

    return next();
  } catch (error) {
    console.error("checkForumBan error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi kiểm tra trạng thái forum ban.",
    });
  }
};

module.exports = checkForumBan;