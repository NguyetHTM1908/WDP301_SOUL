const mongoose = require("mongoose");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");

const ALLOWED_REACTIONS = ["support", "hug", "encourage", "thankyou"];

const emptyStats = () => ({
  supportCount: 0,
  hugCount: 0,
  encourageCount: 0,
  thankyouCount: 0,
});

const countReactionStats = (reactions = []) => {
  const safeReactions = Array.isArray(reactions) ? reactions : [];

  return safeReactions.reduce(
    (acc, reaction) => {
      if (reaction?.type === "support") acc.supportCount += 1;
      if (reaction?.type === "hug") acc.hugCount += 1;
      if (reaction?.type === "encourage") acc.encourageCount += 1;
      if (reaction?.type === "thankyou") acc.thankyouCount += 1;
      return acc;
    },
    emptyStats()
  );
};

const ensureStatistics = (target, type = "post") => {
  if (!target.statistics) {
    target.statistics = {};
  }

  target.statistics.supportCount = target.statistics.supportCount || 0;
  target.statistics.hugCount = target.statistics.hugCount || 0;
  target.statistics.encourageCount = target.statistics.encourageCount || 0;
  target.statistics.thankyouCount = target.statistics.thankyouCount || 0;
  target.statistics.reportCount = target.statistics.reportCount || 0;

  if (type === "post") {
    target.statistics.commentCount = target.statistics.commentCount || 0;
  }

  if (type === "comment") {
    target.statistics.replyCount = target.statistics.replyCount || 0;
  }
};

const ensureAuthUser = (req, res) => {
  if (!req.user || !req.user._id) {
    res.status(401).json({
      success: false,
      message: "Bạn cần đăng nhập để thực hiện hành động này.",
    });
    return false;
  }

  return true;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const upsertReaction = (target, userId, type) => {
  if (!Array.isArray(target.reactions)) {
    target.reactions = [];
  }

  const userIdString = userId.toString();

  const existingIndex = target.reactions.findIndex(
    (reaction) => reaction?.userId?.toString() === userIdString
  );

  if (existingIndex >= 0) {
    target.reactions[existingIndex].type = type;
    target.reactions[existingIndex].createdAt = new Date();
  } else {
    target.reactions.push({
      userId,
      type,
      createdAt: new Date(),
    });
  }
};

const removeReaction = (target, userId) => {
  if (!Array.isArray(target.reactions)) {
    target.reactions = [];
    return;
  }

  const userIdString = userId.toString();

  target.reactions = target.reactions.filter(
    (reaction) => reaction?.userId?.toString() !== userIdString
  );
};

const applyReactionStats = (target) => {
  const stats = countReactionStats(target.reactions);

  target.statistics.supportCount = stats.supportCount;
  target.statistics.hugCount = stats.hugCount;
  target.statistics.encourageCount = stats.encourageCount;
  target.statistics.thankyouCount = stats.thankyouCount;
};

exports.reactToPost = async (req, res) => {
  try {
    if (!ensureAuthUser(req, res)) return;

    const { type } = req.body;
    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "postId không hợp lệ.",
      });
    }

    if (!ALLOWED_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại reaction không hợp lệ.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.status !== "approved" || post.visibility !== "public") {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể react bài viết đã được duyệt và công khai.",
      });
    }

    ensureStatistics(post, "post");
    upsertReaction(post, req.user._id, type);
    applyReactionStats(post);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "React bài viết thành công.",
      data: post.statistics,
    });
  } catch (error) {
    console.error("reactToPost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi react bài viết.",
    });
  }
};

exports.removePostReaction = async (req, res) => {
  try {
    if (!ensureAuthUser(req, res)) return;

    const { postId } = req.params;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: "postId không hợp lệ.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.status !== "approved" || post.visibility !== "public") {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể gỡ reaction ở bài viết đã được duyệt và công khai.",
      });
    }

    ensureStatistics(post, "post");
    removeReaction(post, req.user._id);
    applyReactionStats(post);

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Đã gỡ reaction bài viết.",
      data: post.statistics,
    });
  } catch (error) {
    console.error("removePostReaction error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi gỡ reaction bài viết.",
    });
  }
};

exports.reactToComment = async (req, res) => {
  try {
    if (!ensureAuthUser(req, res)) return;

    const { type } = req.body;
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "commentId không hợp lệ.",
      });
    }

    if (!ALLOWED_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại reaction không hợp lệ.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    if (comment.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể react bình luận đang hoạt động.",
      });
    }

    const post = await Post.findById(comment.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết chứa bình luận.",
      });
    }

    if (post.status !== "approved" || post.visibility !== "public") {
      return res.status(403).json({
        success: false,
        message: "Bài viết chứa bình luận chưa được duyệt hoặc không công khai.",
      });
    }

    ensureStatistics(comment, "comment");
    upsertReaction(comment, req.user._id, type);
    applyReactionStats(comment);

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "React bình luận thành công.",
      data: comment.statistics,
    });
  } catch (error) {
    console.error("reactToComment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi react bình luận.",
    });
  }
};

exports.removeCommentReaction = async (req, res) => {
  try {
    if (!ensureAuthUser(req, res)) return;

    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message: "commentId không hợp lệ.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    if (comment.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Chỉ có thể gỡ reaction ở bình luận đang hoạt động.",
      });
    }

    const post = await Post.findById(comment.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết chứa bình luận.",
      });
    }

    if (post.status !== "approved" || post.visibility !== "public") {
      return res.status(403).json({
        success: false,
        message: "Bài viết chứa bình luận chưa được duyệt hoặc không công khai.",
      });
    }

    ensureStatistics(comment, "comment");
    removeReaction(comment, req.user._id);
    applyReactionStats(comment);

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Đã gỡ reaction bình luận.",
      data: comment.statistics,
    });
  } catch (error) {
    console.error("removeCommentReaction error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi gỡ reaction bình luận.",
    });
  }
};