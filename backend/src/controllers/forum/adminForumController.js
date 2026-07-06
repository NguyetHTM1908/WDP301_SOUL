const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Report = require("../../models/Report");
const User = require("../../models/User");
const ModerationLog = require("../../models/ModerationLog");

const updateMoodReputation = async (userId) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const actionTakenCount = await Report.countDocuments({
    reportedUserId: userId,
    status: "action_taken",
    createdAt: { $gte: oneMonthAgo },
  });

  let moodReputation = "neutral";
  let moodReputationScore = 50;

  if (actionTakenCount >= 3) {
    moodReputation = "negative";
    moodReputationScore = 30;
  } else if (actionTakenCount === 0) {
    moodReputation = "positive";
    moodReputationScore = 80;
  }

  await User.findByIdAndUpdate(userId, {
    moodReputation,
    moodReputationScore,
    moodReputationUpdatedAt: new Date(),
  });
};

exports.getAllPostsForAdmin = async (req, res) => {
  try {
    const { status, flagged } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (flagged === "true") {
      filter.isFlagged = true;
    }

    if (flagged === "false") {
      filter.isFlagged = false;
    }

    const posts = await Post.find(filter)
      .populate("authorId", "fullName email avatarUrl")
      .populate("approvedBy", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bài viết admin thành công.",
      data: posts,
    });
  } catch (error) {
    console.error("getAllPostsForAdmin error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách bài viết admin.",
    });
  }
};

exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const previousStatus = post.status;

    post.status = "approved";
    post.visibility = "public";
    post.isFlagged = false;
    post.toxicityLevel = "low";
    post.approvedAt = new Date();
    post.approvedBy = req.user._id;
    post.rejectedReason = null;

    await post.save();

    await ModerationLog.create({
      target: {
        type: "post",
        id: post._id,
      },
      action: "approve_post",
      reason: "Admin approved this post after review",
      note: "Post is now visible in Community Forum",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "approved",
    });

    return res.status(200).json({
      success: true,
      message: "Duyệt bài viết thành công. Bài viết đã được hiển thị trong Community.",
      data: post,
    });
  } catch (error) {
    console.error("approvePost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể duyệt bài viết.",
    });
  }
};

exports.rejectPost = async (req, res) => {
  try {
    const { reason } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const previousStatus = post.status;

    post.status = "deleted";
    post.rejectedReason = reason || "Bài viết không phù hợp.";
    post.approvedAt = null;
    post.approvedBy = null;

    await post.save();

    await ModerationLog.create({
      target: {
        type: "post",
        id: post._id,
      },
      action: "delete_content",
      reason: post.rejectedReason,
      note: "Post deleted after admin rejection",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "deleted",
    });

    return res.status(200).json({
      success: true,
      message: "Từ chối và xóa bài viết thành công.",
      data: post,
    });
  } catch (error) {
    console.error("rejectPost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể từ chối bài viết.",
    });
  }
};

exports.hidePost = async (req, res) => {
  try {
    const { reason } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết.",
      });
    }

    const previousStatus = post.status;

    post.status = "hidden";
    post.rejectedReason = reason || "Post hidden by admin";

    await post.save();

    await ModerationLog.create({
      target: {
        type: "post",
        id: post._id,
      },
      action: "hide_content",
      reason: reason || "Post hidden by admin",
      note: "Post was hidden manually by admin",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "hidden",
    });

    return res.status(200).json({
      success: true,
      message: "Ẩn bài viết thành công.",
      data: post,
    });
  } catch (error) {
    console.error("hidePost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể ẩn bài viết.",
    });
  }
};

exports.hideComment = async (req, res) => {
  try {
    const { reason } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    const previousStatus = comment.status;

    comment.status = "hidden";

    await comment.save();

    await ModerationLog.create({
      target: {
        type: "comment",
        id: comment._id,
      },
      action: "hide_content",
      reason: reason || "Comment hidden by admin",
      note: "Comment was hidden manually by admin",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "hidden",
    });

    return res.status(200).json({
      success: true,
      message: "Ẩn bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    console.error("hideComment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể ẩn bình luận.",
    });
  }
};

exports.deleteCommentByAdmin = async (req, res) => {
  try {
    const { reason } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === "deleted") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bình luận.",
      });
    }

    const previousStatus = comment.status;

    comment.status = "deleted";

    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: {
        "statistics.commentCount": -1,
      },
    });

    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(comment.parentCommentId, {
        $inc: {
          "statistics.replyCount": -1,
        },
      });
    }

    await ModerationLog.create({
      target: {
        type: "comment",
        id: comment._id,
      },
      action: "delete_content",
      reason: reason || "Comment deleted by admin",
      note: "Comment was deleted manually by admin",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "deleted",
    });

    return res.status(200).json({
      success: true,
      message: "Xóa bình luận thành công.",
    });
  } catch (error) {
    console.error("deleteCommentByAdmin error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xóa bình luận.",
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "fullName email avatarUrl")
      .populate("reportedUserId", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách report thành công.",
      data: reports,
    });
  } catch (error) {
    console.error("getReports error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách report.",
    });
  }
};

exports.dismissReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy report.",
      });
    }

    const previousStatus = report.status;

    report.status = "dismissed";

    await report.save();

    let updatedTarget = null;

    // Admin xác nhận không vi phạm:
    // clear flag để bài hiện lên Community.
    if (report.targetType === "post") {
      updatedTarget = await Post.findById(report.targetId);

      if (updatedTarget) {
        updatedTarget.status = "approved";
        updatedTarget.visibility = "public";
        updatedTarget.isFlagged = false;
        updatedTarget.toxicityLevel = "low";
        updatedTarget.rejectedReason = null;
        updatedTarget.approvedAt = new Date();
        updatedTarget.approvedBy = req.user._id;

        await updatedTarget.save();
      }
    }

    if (report.targetType === "comment") {
      updatedTarget = await Comment.findById(report.targetId);

      if (updatedTarget) {
        updatedTarget.status = "active";
        updatedTarget.toxicityLevel = "low";

        await updatedTarget.save();
      }
    }

    await ModerationLog.create({
      target: {
        type: "report",
        id: report._id,
      },
      action: "reject_report",
      reason: "Admin reviewed and found no violation",
      note:
        "Report dismissed. If this was an AI-flagged post, the content is now visible again.",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "dismissed",
    });

    await updateMoodReputation(report.reportedUserId);

    return res.status(200).json({
      success: true,
      message: "Đã bỏ qua report. Nội dung được phép hiển thị.",
      data: {
        report,
        target: updatedTarget,
      },
    });
  } catch (error) {
    console.error("dismissReport error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể bỏ qua report.",
    });
  }
};

exports.takeActionReport = async (req, res) => {
  try {
    const { reason } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy report.",
      });
    }

    const previousReportStatus = report.status;

    report.status = "action_taken";

    await report.save();

    let previousTargetStatus = null;
    let updatedTarget = null;

    // Admin xác nhận bài vi phạm:
    // xóa khỏi forum bằng status = deleted.
    if (report.targetType === "post") {
      const post = await Post.findById(report.targetId);

      if (post) {
        previousTargetStatus = post.status;

        post.status = "deleted";
        post.isFlagged = true;
        post.toxicityLevel =
          report.aiReview?.severity === "high"
            ? "high"
            : report.aiReview?.severity === "medium"
            ? "medium"
            : post.toxicityLevel || "medium";

        post.rejectedReason =
          reason ||
          report.reason ||
          "Bài viết vi phạm quy tắc cộng đồng.";

        updatedTarget = await post.save();
      }
    }

    // Admin xác nhận comment vi phạm:
    // xóa khỏi forum bằng status = deleted.
    if (report.targetType === "comment") {
      const comment = await Comment.findById(report.targetId);

      if (comment) {
        previousTargetStatus = comment.status;

        comment.status = "deleted";
        comment.toxicityLevel =
          report.aiReview?.severity === "high"
            ? "high"
            : report.aiReview?.severity === "medium"
            ? "medium"
            : comment.toxicityLevel || "medium";

        updatedTarget = await comment.save();

        await Post.findByIdAndUpdate(comment.postId, {
          $inc: {
            "statistics.commentCount": -1,
          },
        });

        if (comment.parentCommentId) {
          await Comment.findByIdAndUpdate(comment.parentCommentId, {
            $inc: {
              "statistics.replyCount": -1,
            },
          });
        }
      }
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const validReportsCount = await Report.countDocuments({
      reportedUserId: report.reportedUserId,
      status: "action_taken",
      createdAt: {
        $gte: oneWeekAgo,
      },
    });

    let bannedUntil = null;

    if (validReportsCount > 3) {
      bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + 30);

      await User.findByIdAndUpdate(report.reportedUserId, {
        forumBannedUntil: bannedUntil,
      });

      await ModerationLog.create({
        target: {
          type: "user",
          id: report.reportedUserId,
        },
        action: "block_user",
        reason: "User received more than 3 valid reports within 7 days",
        note: `Auto banned until ${bannedUntil.toISOString()}`,
        performedBy: req.user._id,
        previousStatus: "active",
        newStatus: "forum_banned",
      });
    }

    await ModerationLog.create({
      target: {
        type: report.targetType,
        id: report.targetId,
      },
      action: "delete_content",
      reason: reason || report.reason || "Admin confirmed violation",
      note: `Report status changed from ${previousReportStatus} to action_taken. Target content was deleted.`,
      performedBy: req.user._id,
      previousStatus: previousTargetStatus,
      newStatus: "deleted",
    });

    await updateMoodReputation(report.reportedUserId);

    return res.status(200).json({
      success: true,
      message: "Đã xử lý report. Nội dung vi phạm đã bị xóa khỏi forum.",
      data: {
        report,
        target: updatedTarget,
        validReportsCount,
        bannedUntil,
      },
    });
  } catch (error) {
    console.error("takeActionReport error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xử lý report.",
    });
  }
};

exports.resolveAppeal = async (req, res) => {
  try {
    const { action, note } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy report.",
      });
    }

    if (report.status !== "appeal_pending") {
      return res.status(400).json({
        success: false,
        message: "Report này không ở trạng thái chờ appeal.",
      });
    }

    const previousStatus = report.status;

    if (action === "accept") {
      report.status = "appeal_accepted";
      report.appealResolvedAt = new Date();
      report.appealNote = note || "Admin accepted appeal.";

      await report.save();

      let restoredTarget = null;

      if (report.targetType === "post") {
        restoredTarget = await Post.findById(report.targetId);

        if (restoredTarget) {
          restoredTarget.status = "approved";
          restoredTarget.visibility = "public";
          restoredTarget.isFlagged = false;
          restoredTarget.toxicityLevel = "low";
          restoredTarget.rejectedReason = null;
          restoredTarget.approvedAt = new Date();
          restoredTarget.approvedBy = req.user._id;

          await restoredTarget.save();
        }
      }

      if (report.targetType === "comment") {
        restoredTarget = await Comment.findById(report.targetId);

        if (restoredTarget) {
          restoredTarget.status = "active";
          restoredTarget.toxicityLevel = "low";

          await restoredTarget.save();
        }
      }

      await ModerationLog.create({
        target: {
          type: "report",
          id: report._id,
        },
        action: "appeal_accepted",
        reason: note || "Appeal accepted by admin",
        note: "Target content was restored when possible",
        performedBy: req.user._id,
        previousStatus,
        newStatus: "appeal_accepted",
      });

      await updateMoodReputation(report.reportedUserId);

      return res.status(200).json({
        success: true,
        message: "Đã chấp nhận appeal và khôi phục nội dung.",
        data: {
          report,
          target: restoredTarget,
        },
      });
    }

    if (action === "reject") {
      report.status = "appeal_rejected";
      report.appealResolvedAt = new Date();
      report.appealNote = note || "Admin rejected appeal.";

      await report.save();

      await ModerationLog.create({
        target: {
          type: "report",
          id: report._id,
        },
        action: "appeal_rejected",
        reason: note || "Appeal rejected by admin",
        note: "Target content remains removed or hidden",
        performedBy: req.user._id,
        previousStatus,
        newStatus: "appeal_rejected",
      });

      await updateMoodReputation(report.reportedUserId);

      return res.status(200).json({
        success: true,
        message: "Đã từ chối appeal.",
        data: report,
      });
    }

    return res.status(400).json({
      success: false,
      message: "action không hợp lệ. Chỉ nhận accept hoặc reject.",
    });
  } catch (error) {
    console.error("resolveAppeal error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xử lý appeal.",
    });
  }
};