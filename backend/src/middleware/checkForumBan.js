const checkForumBan = (req, res, next) => {
  if (req.user.forumBannedUntil && req.user.forumBannedUntil > new Date()) {
    return res.status(403).json({
      success: false,
      message: `Bạn bị cấm đăng bài/bình luận đến ${req.user.forumBannedUntil.toLocaleDateString()}`,
    });
  }

  next();
};

module.exports = checkForumBan;