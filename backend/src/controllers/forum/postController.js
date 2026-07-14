const Post = require("../../models/Post");
const forumModerationService = require("../../services/forumModerationService");

const forumIdentity = require("../../utils/forumIdentity");

const {
  isUserAnonymousModeOn,
  buildRealDisplayAuthor,
  maskAnonymousPost,
} = forumIdentity;

const ANONYMOUS_AVATAR_URL =
  forumIdentity.ANONYMOUS_AVATAR_URL ||
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

const AUTHOR_POPULATE_FIELDS =
  "fullName email avatarUrl anonymousAlias anonymousIdentityId anonymousAvatarUrl anonymousModeEnabled";

function getAuthUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.userId ||
    null
  );
}

function toId(value) {
  if (!value) return null;

  if (typeof value === "string") return value;

  return (
    value?._id?.toString?.() ||
    value?.id?.toString?.() ||
    value?.toString?.() ||
    null
  );
}

const normalizeHashtags = (hashtags = []) => {
  if (!Array.isArray(hashtags)) return [];

  return hashtags
    .map((tag) => String(tag).replace("#", "").trim().toLowerCase())
    .filter(Boolean);
};

function buildRealDisplayAuthorSafe(user) {
  if (typeof buildRealDisplayAuthor === "function") {
    return buildRealDisplayAuthor(user);
  }

  return {
    id: toId(user),
    fullName: user?.fullName || "SOUL User",
    avatarUrl: user?.avatarUrl || null,
    isAnonymous: false,
  };
}

function buildDisplayAuthorForPost(req, wantAnonymous, anonymousName) {
  const user = req.user;
  const userId = getAuthUserId(req);

  if (wantAnonymous) {
    const alias =
      String(anonymousName || "").trim() ||
      String(user?.anonymousAlias || "").trim() ||
      "Anonymous Soul";

    const anonymousId =
      user?.anonymousIdentityId ||
      `anon_${String(userId || "unknown")}`;

    return {
      id: anonymousId,
      fullName: alias,
      avatarUrl: ANONYMOUS_AVATAR_URL,
      isAnonymous: true,
    };
  }

  return buildRealDisplayAuthorSafe(user);
}

function fallbackMaskPost(post) {
  const obj = post?.toObject ? post.toObject() : post;

  if (!obj) return obj;

  if (obj.isAnonymous) {
    const anonymousName =
      obj.anonymousName ||
      obj.displayAuthor?.fullName ||
      obj.authorId?.anonymousAlias ||
      "Anonymous Soul";

    const anonymousId =
      obj.displayAuthor?.id ||
      obj.authorId?.anonymousIdentityId ||
      `anon_${obj._id?.toString?.() || "unknown"}`;

    const anonymousAuthor = {
      _id: anonymousId,
      id: anonymousId,
      fullName: anonymousName,
      email: null,
      avatarUrl: ANONYMOUS_AVATAR_URL,
      anonymousAlias: anonymousName,
      isAnonymous: true,
    };

    obj.displayAuthor = anonymousAuthor;
    obj.authorId = anonymousAuthor;

    return obj;
  }

  const author = obj.authorId || {};

  obj.displayAuthor = {
    _id: author?._id || author?.id || null,
    id: author?._id || author?.id || null,
    fullName: author?.fullName || obj.displayAuthor?.fullName || "SOUL User",
    email: author?.email || null,
    avatarUrl: author?.avatarUrl || obj.displayAuthor?.avatarUrl || null,
    isAnonymous: false,
  };

  return obj;
}

function safeMaskPost(post) {
  try {
    if (typeof maskAnonymousPost === "function") {
      return maskAnonymousPost(post);
    }

    return fallbackMaskPost(post);
  } catch (error) {
    console.error("[MASK POST ERROR]", {
      postId: post?._id,
      message: error.message,
      stack: error.stack,
    });

    return fallbackMaskPost(post);
  }
}

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
      postType,
    } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung bài viết không được để trống.",
      });
    }

    const anonymousMode =
      isAnonymous !== undefined
        ? Boolean(isAnonymous)
        : typeof isUserAnonymousModeOn === "function"
          ? isUserAnonymousModeOn(req.user)
          : Boolean(req.user?.anonymousModeEnabled);

    const displayAuthor = buildDisplayAuthorForPost(
      req,
      anonymousMode,
      anonymousName
    );

    const post = await Post.create({
      authorId: userId,
      displayAuthor,

      content: content.trim(),
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      emotionStatus: emotionStatus || "neutral",
      hashtags: normalizeHashtags(hashtags || []),

      isAnonymous: anonymousMode,
      anonymousName: anonymousMode ? displayAuthor.fullName : null,

      visibility: visibility || "public",
      postType: postType || "forum",

      status: "pending",
      approvedAt: null,
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

      post.status = "pending";
      post.isFlagged = true;
      post.toxicityLevel = "medium";
      post.approvedAt = null;
      post.rejectedReason =
        "Không thể kiểm duyệt bằng AI tại thời điểm đăng bài. Cần admin xem xét.";

      await post.save();
    }

    const updatedPost = await Post.findById(post._id).populate(
      "authorId",
      AUTHOR_POPULATE_FIELDS
    );

    return res.status(201).json({
      success: true,
      message:
        moderationWarning ||
        moderation?.isViolationSuspected
          ? "Tạo bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm."
          : "Tạo bài viết thành công.",
      data: safeMaskPost(updatedPost || post),
      moderation,
      moderationWarning,
    });
  } catch (error) {
    console.error("CREATE POST ERROR FULL:", error);

    return res.status(error.statusCode || 500).json({
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
      postType: "forum",
      status: "approved",
      visibility: "public",
      isFlagged: { $ne: true },
    };

    if (hashtag && String(hashtag).trim()) {
      filter.hashtags = String(hashtag)
        .replace("#", "")
        .trim()
        .toLowerCase();
    }

    if (
      emotionStatus &&
      String(emotionStatus).trim()
    ) {
      filter.emotionStatus =
        String(emotionStatus)
          .trim()
          .toLowerCase();
    }

    const keyword = String(
      search || ""
    ).trim();

    if (keyword) {
      filter.$or = [
        {
          content: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          hashtags: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          anonymousName: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const posts = await Post.find(filter)
      .populate(
        "authorId",
        AUTHOR_POPULATE_FIELDS
      )
      .sort({
        createdAt: -1,
      });

    const data = posts.map(safeMaskPost);

    return res.status(200).json({
      success: true,
      message:
        "Lấy danh sách bài viết thành công.",
      data,
    });
  } catch (error) {
    console.error(
      "GET APPROVED POSTS ERROR FULL:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể lấy danh sách bài viết.",
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
      AUTHOR_POPULATE_FIELDS
    );

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const isAdmin = req.user && req.user.role === "admin";

    const authorId = toId(post.authorId);

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
      data: safeMaskPost(post),
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
      postType: { $ne: "profile" },
    })
      .populate("authorId", AUTHOR_POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy bài viết của tôi thành công.",
      data: posts.map(safeMaskPost),
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

    if (toId(post.authorId) !== String(userId)) {
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

      const newContent = content.trim();

      if (newContent !== post.content) {
        post.content = newContent;
        contentChanged = true;
      }
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
      const wantAnonymous = Boolean(isAnonymous);

      const displayAuthor = buildDisplayAuthorForPost(
        req,
        wantAnonymous,
        anonymousName
      );

      post.isAnonymous = wantAnonymous;
      post.anonymousName = wantAnonymous ? displayAuthor.fullName : null;
      post.displayAuthor = displayAuthor;
    }

    if (visibility !== undefined) {
      post.visibility = visibility || "public";
    }

    if (contentChanged) {
      post.status = "pending";
      post.approvedAt = null;
      post.rejectedReason = null;
      post.isFlagged = false;
      post.toxicityLevel = "low";
    }

    post.editedAt = new Date();

    await post.save();

    let moderation = null;
    let moderationWarning = null;

    if (contentChanged) {
      try {
        moderation = await forumModerationService.moderatePostAfterCreate(post);
      } catch (error) {
        moderationWarning = error.message;
        console.error("Forum moderation failed:", error);

        post.status = "pending";
        post.isFlagged = true;
        post.toxicityLevel = "medium";
        post.approvedAt = null;
        post.rejectedReason =
          "Không thể kiểm duyệt bằng AI tại thời điểm cập nhật bài viết. Cần admin xem xét.";

        await post.save();
      }
    }

    const updatedPost = await Post.findById(post._id).populate(
      "authorId",
      AUTHOR_POPULATE_FIELDS
    );

    return res.status(200).json({
      success: true,
      message:
        moderationWarning ||
        moderation?.isViolationSuspected
          ? "Cập nhật bài viết thành công. Bài viết đang chờ admin xem xét vì có dấu hiệu nhạy cảm."
          : "Cập nhật bài viết thành công.",
      data: safeMaskPost(updatedPost || post),
      moderation,
      moderationWarning,
    });
  } catch (error) {
    console.error("UPDATE POST ERROR FULL:", error);

    return res.status(error.statusCode || 500).json({
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

    if (toId(post.authorId) !== String(userId)) {
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