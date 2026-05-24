const Post = require("../models/Post");
const Comment = require("../models/Comment");

const ALLOWED_REACTIONS = ["like", "support", "hug"];

const countReactionStats = (reactions) => {
  return {
    likeCount: reactions.filter((r) => r.type === "like").length,
    supportCount: reactions.filter((r) => r.type === "support").length,
    hugCount: reactions.filter((r) => r.type === "hug").length,
  };
};

exports.reactToPost = async (req, res) => {
  try {
    const { type } = req.body;
    const { postId } = req.params;

    if (!ALLOWED_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại reaction không hợp lệ.",
      });
    }

    const post = await Post.findById(postId);

    if (!post || post.status !== "approved" || post.visibility !== "public") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết đã duyệt.",
      });
    }

    const existingIndex = post.reactions.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      post.reactions[existingIndex].type = type;
      post.reactions[existingIndex].createdAt = new Date();
    } else {
      post.reactions.push({
        userId: req.user._id,
        type,
      });
    }

    const stats = countReactionStats(post.reactions);

    post.statistics.likeCount = stats.likeCount;
    post.statistics.supportCount = stats.supportCount;
    post.statistics.hugCount = stats.hugCount;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "React bài viết thành công.",
      data: post.statistics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removePostReaction = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post || post.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    post.reactions = post.reactions.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );

    const stats = countReactionStats(post.reactions);

    post.statistics.likeCount = stats.likeCount;
    post.statistics.supportCount = stats.supportCount;
    post.statistics.hugCount = stats.hugCount;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Đã gỡ reaction bài viết.",
      data: post.statistics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.reactToComment = async (req, res) => {
  try {
    const { type } = req.body;
    const { commentId } = req.params;

    if (!ALLOWED_REACTIONS.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Loại reaction không hợp lệ.",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment || comment.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    const post = await Post.findById(comment.postId);

    if (!post || post.status !== "approved" || post.visibility !== "public") {
      return res.status(404).json({
        success: false,
        message: "Bài viết chứa bình luận không tồn tại hoặc chưa được duyệt.",
      });
    }

    const existingIndex = comment.reactions.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingIndex >= 0) {
      comment.reactions[existingIndex].type = type;
      comment.reactions[existingIndex].createdAt = new Date();
    } else {
      comment.reactions.push({
        userId: req.user._id,
        type,
      });
    }

    const stats = countReactionStats(comment.reactions);

    comment.statistics.likeCount = stats.likeCount;
    comment.statistics.supportCount = stats.supportCount;
    comment.statistics.hugCount = stats.hugCount;

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "React bình luận thành công.",
      data: comment.statistics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.removeCommentReaction = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment || comment.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    comment.reactions = comment.reactions.filter(
      (r) => r.userId.toString() !== req.user._id.toString()
    );

    const stats = countReactionStats(comment.reactions);

    comment.statistics.likeCount = stats.likeCount;
    comment.statistics.supportCount = stats.supportCount;
    comment.statistics.hugCount = stats.hugCount;

    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Đã gỡ reaction bình luận.",
      data: comment.statistics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};