const Post = require("../models/Post");
const forumModerationService = require("../services/forumModerationService");

function getAuthUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
}

function getAnonymousAlias(req) {
  return req.user?.anonymousAlias || req.user?.fullName || "Anonymous Soul";
}

const normalizeHashtags = (hashtags = []) => {
  if (!Array.isArray(hashtags)) return [];

  return hashtags
    .map((tag) => String(tag).replace("#", "").trim().toLowerCase())
    .filter(Boolean);
};

const maskAnonymousPost = (post) => {
  const obj = post.toObject ? post.toObject() : post;

  if (obj.isAnonymous) {
    obj.authorId = {
      fullName: obj.anonymousName || "Anonymous Soul",
      email: null,
      avatarUrl: null,
      anonymousAlias: obj.anonymousName || "Anonymous Soul",
    };
  }

  return obj;
};

exports.createPost = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
      });
    }

    const {
      content,
      mediaUrls,
      emotionStatus,
      hashtags,
      isAnonymous,
      anonymousName,
      visibility,
    } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung bài viết không được để trống.",
      });
    }

    const post = await Post.create({
      authorId: userId,
      content: content.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      emotionStatus: emotionStatus || "neutral",
      hashtags: normalizeHashtags(hashtags || []),

      isAnonymous: Boolean(isAnonymous),
      anonymousName: isAnonymous
        ? anonymousName || getAnonymousAlias(req)
        : null,

      visibility: visibility || "public",

      // Bài được tạo trước, AI kiểm tra ngay sau đó.
      status: "approved",
      approvedAt: new Date(),
      approvedBy: null,
      rejectedReason: null,

      isFlagged: false,
      toxicityLevel: "low",
    });

    let moderation = null;
    let moderationWarning = null;

    try {
      moderation = await forumModerationService.moderatePostAfterCreate(post);
    } catch (error) {
      moderationWarning = error.message;
      console.error("Forum moderation failed:", error);
    }

    const updatedPost = await Post.findById(post._id).populate(
      "authorId",
      "fullName email avatarUrl anonymousAlias"
    );

    return res.status(201).json({
      success: true,
      message: moderation?.isViolationSuspected
        ? "Tạo bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm."
        : "Tạo bài viết thành công.",
      data: updatedPost || post,
      moderation,
      moderationWarning,
    });
  } catch (error) {
    console.error("CREATE POST ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo bài viết.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};

exports.getApprovedPosts = async (req, res) => {
  try {
    const { hashtag, emotionStatus, search } = req.query;

    const filter = {
      status: "approved",
      visibility: "public",

      // Quan trọng:
      // Bài đang bị AI flag thì không hiện lên Community.
      isFlagged: false,
    };

    if (hashtag) {
      filter.hashtags = String(hashtag).replace("#", "").trim().toLowerCase();
    }

    if (emotionStatus) {
      filter.emotionStatus = emotionStatus;
    }

    if (search) {
      filter.content = { $regex: String(search), $options: "i" };
    }

    const posts = await Post.find(filter)
      .populate("authorId", "fullName email avatarUrl anonymousAlias")
      .sort({ createdAt: -1 });

    const data = posts.map(maskAnonymousPost);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết thành công.",
      data,
    });
  } catch (error) {
    console.error("GET APPROVED POSTS ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách bài viết.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};

exports.getPostDetail = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    const post = await Post.findById(req.params.id).populate(
      "authorId",
      "fullName email avatarUrl anonymousAlias"
    );

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const isAdmin = req.user && req.user.role === "admin";

    const authorId =
      post.authorId?._id?.toString?.() ||
      post.authorId?.toString?.() ||
      null;

    const isAuthor = userId && authorId && authorId === String(userId);

    const isPublicApproved =
      post.status === "approved" &&
      post.visibility === "public" &&
      post.isFlagged !== true;

    if (!isPublicApproved && !isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem bài viết này.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết bài viết thành công.",
      data: isAuthor || isAdmin ? post : maskAnonymousPost(post),
    });
  } catch (error) {
    console.error("GET POST DETAIL ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết bài viết.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
      });
    }

    const posts = await Post.find({
      authorId: userId,
      status: { $ne: "deleted" },
    })
      .populate("authorId", "fullName email avatarUrl anonymousAlias")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy bài viết của tôi thành công.",
      data: posts,
    });
  } catch (error) {
    console.error("GET MY POSTS ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy bài viết của tôi.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};

exports.updateMyPost = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.authorId.toString() !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa bài viết này.",
      });
    }

    const {
      content,
      mediaUrls,
      emotionStatus,
      hashtags,
      isAnonymous,
      anonymousName,
      visibility,
    } = req.body;

    let contentChanged = false;

    if (content !== undefined) {
      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Nội dung bài viết không được để trống.",
        });
      }

      post.content = content.trim();
      contentChanged = true;
    }

    if (mediaUrls !== undefined) {
      post.mediaUrls = Array.isArray(mediaUrls) ? mediaUrls : [];
    }

    if (emotionStatus !== undefined) {
      post.emotionStatus = emotionStatus || "neutral";
    }

    if (hashtags !== undefined) {
      post.hashtags = normalizeHashtags(hashtags);
    }

    if (isAnonymous !== undefined) {
      post.isAnonymous = Boolean(isAnonymous);
      post.anonymousName = isAnonymous
        ? anonymousName || getAnonymousAlias(req)
        : null;
    }

    if (visibility !== undefined) {
      post.visibility = visibility || "public";
    }

    if (
      post.status === "hidden" ||
      post.status === "rejected" ||
      post.status === "pending"
    ) {
      post.status = "approved";
      post.approvedAt = new Date();
      post.rejectedReason = null;
    }

    post.editedAt = new Date();

    if (contentChanged) {
      post.isFlagged = false;
      post.toxicityLevel = "low";
    }

    await post.save();

    let moderation = null;
    let moderationWarning = null;

    if (contentChanged) {
      try {
        moderation = await forumModerationService.moderatePostAfterCreate(post);
      } catch (error) {
        moderationWarning = error.message;
        console.error("Forum moderation failed:", error);
      }
    }

    const updatedPost = await Post.findById(post._id).populate(
      "authorId",
      "fullName email avatarUrl anonymousAlias"
    );

    return res.status(200).json({
      success: true,
      message: moderation?.isViolationSuspected
        ? "Cập nhật bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm."
        : "Cập nhật bài viết thành công.",
      data: updatedPost || post,
      moderation,
      moderationWarning,
    });
  } catch (error) {
    console.error("UPDATE POST ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể cập nhật bài viết.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};

exports.deleteMyPost = async (req, res) => {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy user từ token. Vui lòng đăng nhập lại.",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.authorId.toString() !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bài viết này.",
      });
    }

    post.status = "deleted";
    post.visibility = "private";
    post.rejectedReason = "User deleted this post.";

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Xóa bài viết thành công.",
      data: {
        postId: post._id,
        status: post.status,
      },
    });
  } catch (error) {
    console.error("DELETE POST ERROR FULL:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xóa bài viết.",
      errorName: error.name,
      errorCode: error.code,
      errorErrors: error.errors,
    });
  }
};