const Comment = require("../models/Comment");
const Post = require("../models/Post");

const maskAnonymousComment = (comment) => {
  const obj = comment.toObject ? comment.toObject() : comment;

  if (obj.isAnonymous) {
    obj.authorId = {
      fullName: obj.anonymousName || "Anonymous",
      email: null,
      avatarUrl: null,
    };
  }

  return obj;
};

exports.createComment = async (req, res) => {
  try {
    const { postId, parentCommentId, content, isAnonymous, anonymousName } = req.body;

    if (!postId) {
      return res.status(400).json({ success: false, message: "postId là bắt buộc." });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Nội dung bình luận không được để trống." });
    }

    const post = await Post.findById(postId);

    if (!post || post.status !== "approved" || post.visibility !== "public") {
      return res.status(400).json({ success: false, message: "Bài viết không tồn tại hoặc chưa được duyệt." });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);

      if (
        !parentComment ||
        parentComment.status !== "active" ||
        parentComment.postId.toString() !== postId.toString()
      ) {
        return res.status(400).json({ success: false, message: "Bình luận cha không hợp lệ." });
      }
    }

    const comment = await Comment.create({
      postId,
      authorId: req.user._id,
      parentCommentId: parentCommentId || null,
      content: content.trim(),
      isAnonymous: isAnonymous || false,
      anonymousName: isAnonymous
        ? anonymousName || req.user.anonymousAlias || "Anonymous"
        : null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { "statistics.commentCount": 1 },
    });

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { "statistics.replyCount": 1 },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      status: "active",
    })
      .populate("authorId", "fullName email avatarUrl anonymousAlias")
      .sort({ createdAt: 1 });

    const data = comments.map(maskAnonymousComment);

    return res.status(200).json({
      success: true,
      message: "Lấy bình luận thành công.",
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMyComment = async (req, res) => {
  try {
    const { content, isAnonymous, anonymousName } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Nội dung bình luận không được để trống." });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận." });
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền sửa bình luận này." });
    }

    comment.content = content.trim();

    if (isAnonymous !== undefined) {
      comment.isAnonymous = isAnonymous;
      comment.anonymousName = isAnonymous
        ? anonymousName || req.user.anonymousAlias || comment.anonymousName || "Anonymous"
        : null;
    }

    comment.editedAt = new Date();
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMyComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận." });
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xóa bình luận này." });
    }

    comment.status = "deleted";
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { "statistics.commentCount": -1 },
    });

    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(comment.parentCommentId, {
        $inc: { "statistics.replyCount": -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa bình luận thành công.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};