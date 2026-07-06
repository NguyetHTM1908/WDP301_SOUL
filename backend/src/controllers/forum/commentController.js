const Comment = require("../../models/Comment");
const Post = require("../../models/Post");

const ANONYMOUS_AVATAR_URL =
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

function normalizeName(value) {
  const name = String(value || "").trim();
  return name || null;
}

function getId(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  return (
    value?._id?.toString?.() ||
    value?.id?.toString?.() ||
    value?.toString?.() ||
    null
  );
}

function getAnonymousNameFromUser(user) {
  return (
    normalizeName(user?.anonymousAlias) ||
    normalizeName(user?.anonymousName) ||
    "Anonymous Soul"
  );
}

function buildAnonymousAuthor(commentObj) {
  const anonymousName =
    normalizeName(commentObj?.anonymousName) ||
    normalizeName(commentObj?.displayAuthor?.fullName) ||
    normalizeName(commentObj?.authorId?.anonymousAlias) ||
    "Anonymous Soul";

  const anonymousId =
    commentObj?.displayAuthor?.id ||
    commentObj?.authorId?.anonymousIdentityId ||
    `anon_${getId(commentObj) || "comment"}`;

  return {
    _id: anonymousId,
    id: anonymousId,
    fullName: anonymousName,
    email: null,
    avatarUrl: ANONYMOUS_AVATAR_URL,
    anonymousAlias: anonymousName,
    isAnonymous: true,
  };
}

function buildRealAuthor(commentObj) {
  const author = commentObj?.authorId || {};

  const id =
    commentObj?.displayAuthor?.id ||
    getId(author) ||
    getId(commentObj?.displayAuthor);

  return {
    _id: id,
    id,
    fullName:
      commentObj?.displayAuthor?.fullName ||
      author?.fullName ||
      "SOUL User",
    email: author?.email || null,
    avatarUrl:
      commentObj?.displayAuthor?.avatarUrl ||
      author?.avatarUrl ||
      null,
    isAnonymous: false,
  };
}

function maskAnonymousComment(comment) {
  const obj = comment?.toObject ? comment.toObject() : comment;

  if (!obj) return obj;

  if (obj.isAnonymous) {
    const displayAuthor = buildAnonymousAuthor(obj);

    obj.displayAuthor = displayAuthor;
    obj.authorId = displayAuthor;

    return obj;
  }

  obj.displayAuthor = buildRealAuthor(obj);

  return obj;
}

exports.createComment = async (req, res) => {
  try {
    const {
      postId,
      parentCommentId,
      content,
      isAnonymous,
      anonymousName,
    } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "postId là bắt buộc.",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống.",
      });
    }

    const post = await Post.findById(postId);

    if (!post || post.status !== "approved" || post.visibility !== "public") {
      return res.status(400).json({
        success: false,
        message: "Bài viết không tồn tại hoặc chưa được duyệt.",
      });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);

      if (
        !parentComment ||
        parentComment.status !== "active" ||
        parentComment.postId.toString() !== postId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "Bình luận cha không hợp lệ.",
        });
      }
    }

    const shouldBeAnonymous = isAnonymous === true;

    const finalAnonymousName = shouldBeAnonymous
      ? normalizeName(anonymousName) || getAnonymousNameFromUser(req.user)
      : null;

    console.log("[CREATE COMMENT IDENTITY]", {
      user: req.user?._id?.toString?.(),
      isAnonymous,
      shouldBeAnonymous,
      anonymousName,
      finalAnonymousName,
    });

    const comment = await Comment.create({
      postId,
      authorId: req.user._id,
      parentCommentId: parentCommentId || null,
      content: content.trim(),
      isAnonymous: shouldBeAnonymous,
      anonymousName: finalAnonymousName,
      status: "active",
      statistics: {
        supportCount: 0,
        hugCount: 0,
        encourageCount: 0,
        thankyouCount: 0,
        replyCount: 0,
        reportCount: 0,
      },
      toxicityLevel: "low",
      reactions: [],
      editedAt: null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { "statistics.commentCount": 1 },
    });

    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { "statistics.replyCount": 1 },
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "authorId",
      "fullName email avatarUrl anonymousAlias anonymousIdentityId anonymousAvatarUrl"
    );

    return res.status(201).json({
      success: true,
      message: "Bình luận thành công.",
      data: maskAnonymousComment(populatedComment),
    });
  } catch (error) {
    console.error("createComment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể bình luận.",
    });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
      status: "active",
    })
      .populate(
        "authorId",
        "fullName email avatarUrl anonymousAlias anonymousIdentityId anonymousAvatarUrl"
      )
      .sort({ createdAt: 1 });

    const data = comments.map(maskAnonymousComment);

    return res.status(200).json({
      success: true,
      message: "Lấy bình luận thành công.",
      data,
    });
  } catch (error) {
    console.error("getCommentsByPost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy bình luận.",
    });
  }
};

exports.updateMyComment = async (req, res) => {
  try {
    const { content, isAnonymous, anonymousName } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống.",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa bình luận này.",
      });
    }

    comment.content = content.trim();

    if (isAnonymous !== undefined) {
      const shouldBeAnonymous = isAnonymous === true;

      comment.isAnonymous = shouldBeAnonymous;
      comment.anonymousName = shouldBeAnonymous
        ? normalizeName(anonymousName) ||
          normalizeName(comment.anonymousName) ||
          getAnonymousNameFromUser(req.user)
        : null;
    }

    comment.editedAt = new Date();

    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      "authorId",
      "fullName email avatarUrl anonymousAlias anonymousIdentityId anonymousAvatarUrl"
    );

    return res.status(200).json({
      success: true,
      message: "Cập nhật bình luận thành công.",
      data: maskAnonymousComment(populatedComment),
    });
  } catch (error) {
    console.error("updateMyComment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể cập nhật bình luận.",
    });
  }
};

exports.deleteMyComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bình luận này.",
      });
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
    console.error("deleteMyComment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xóa bình luận.",
    });
  }
};