const Post = require("../models/Post");

const normalizeHashtags = (hashtags = []) => {
  return hashtags
    .map((tag) => tag.replace("#", "").trim().toLowerCase())
    .filter(Boolean);
};

const maskAnonymousPost = (post) => {
  const obj = post.toObject ? post.toObject() : post;

  if (obj.isAnonymous) {
    obj.authorId = {
      fullName: "Anonymous",
      email: null,
      avatarUrl: null,
    };
  }

  return obj;
};

exports.createPost = async (req, res) => {
  try {
    const {
      content,
      mediaUrls,
      emotionStatus,
      hashtags,
      isAnonymous,
      visibility,
    } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung bài viết không được để trống.",
      });
    }

    const post = await Post.create({
      authorId: req.user._id,
      content: content.trim(),
      mediaUrls: mediaUrls || [],
      emotionStatus: emotionStatus || "neutral",
      hashtags: normalizeHashtags(hashtags || []),
      isAnonymous: isAnonymous || false,
      visibility: visibility || "public",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo bài viết thành công. Bài viết đang chờ admin duyệt.",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getApprovedPosts = async (req, res) => {
  try {
    const { hashtag, emotionStatus, search } = req.query;

    const filter = {
      status: "approved",
      visibility: "public",
    };

    if (hashtag) {
      filter.hashtags = hashtag.replace("#", "").trim().toLowerCase();
    }

    if (emotionStatus) {
      filter.emotionStatus = emotionStatus;
    }

    if (search) {
      filter.content = { $regex: search, $options: "i" };
    }

    const posts = await Post.find(filter)
      .populate("authorId", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    const data = posts.map(maskAnonymousPost);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết thành công.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostDetail = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "authorId",
      "fullName email avatarUrl"
    );

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const isAdmin = req.user && req.user.role === "admin";
    const isAuthor =
      req.user && post.authorId && post.authorId._id.toString() === req.user._id.toString();

    const isPublicApproved =
      post.status === "approved" && post.visibility === "public";

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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      authorId: req.user._id,
      status: { $ne: "deleted" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy bài viết của tôi thành công.",
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateMyPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
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
      visibility,
    } = req.body;

    let needReApproval = false;

    if (content !== undefined) {
      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Nội dung bài viết không được để trống.",
        });
      }

      post.content = content.trim();
      needReApproval = true;
    }

    if (mediaUrls !== undefined) {
      post.mediaUrls = mediaUrls;
      needReApproval = true;
    }

    if (emotionStatus !== undefined) {
      post.emotionStatus = emotionStatus;
      needReApproval = true;
    }

    if (hashtags !== undefined) {
      post.hashtags = normalizeHashtags(hashtags);
      needReApproval = true;
    }

    if (isAnonymous !== undefined) {
      post.isAnonymous = isAnonymous;
    }

    if (visibility !== undefined) {
      post.visibility = visibility;
    }

    if (needReApproval) {
      post.status = "pending";
      post.approvedAt = null;
      post.approvedBy = null;
      post.rejectedReason = null;
    }

    post.editedAt = new Date();

    await post.save();

    return res.status(200).json({
      success: true,
      message: needReApproval
        ? "Cập nhật bài viết thành công. Bài viết đang chờ admin duyệt lại."
        : "Cập nhật bài viết thành công.",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMyPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa bài viết này.",
      });
    }

    post.status = "deleted";
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Xóa bài viết thành công.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};