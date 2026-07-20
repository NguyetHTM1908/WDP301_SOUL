const mongoose = require("mongoose");

const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const Report = require("../../models/Report");
const User = require("../../models/User");
const ModerationLog = require("../../models/ModerationLog");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createModerationLogSafely = async (data) => {
  try {
    await ModerationLog.create(data);
  } catch (error) {
    console.error(
      "[MODERATION LOG ERROR]",
      error
    );
  }
};

const updateMoodReputation = async (userId) => {
  try {
    if (!userId || !isValidObjectId(userId)) {
      return;
    }

    const oneMonthAgo = new Date();

    oneMonthAgo.setMonth(
      oneMonthAgo.getMonth() - 1
    );

    const actionTakenCount =
      await Report.countDocuments({
        reportedUserId: userId,
        status: "action_taken",
        createdAt: {
          $gte: oneMonthAgo,
        },
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

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          moodReputation,
          moodReputationScore,
          moodReputationUpdatedAt:
            new Date(),
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    console.error(
      "[UPDATE MOOD REPUTATION ERROR]",
      error
    );
  }
};

exports.getAllPostsForAdmin = async (
  req,
  res
) => {
  try {
    const {
      status,
      flagged,
      search,
      postType,
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (postType) {
      filter.postType = postType;
    }

    if (flagged === "true") {
      filter.isFlagged = true;
    }

    if (flagged === "false") {
      filter.isFlagged = false;
    }

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      filter.$or = [
        {
          content: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          hashtags: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          anonymousName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const posts = await Post.find(filter)
      .populate(
        "authorId",
        "fullName email avatarUrl anonymousAlias"
      )
      .populate(
        "approvedBy",
        "fullName email avatarUrl"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message:
        "Lấy danh sách bài viết admin thành công.",
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error(
      "getAllPostsForAdmin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể lấy danh sách bài viết admin.",
    });
  }
};

exports.approvePost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID bài viết không hợp lệ.",
      });
    }

    const currentPost = await Post.findById(
      postId
    )
      .select("status")
      .lean();

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy bài viết.",
      });
    }

    const previousStatus =
      currentPost.status;

    const updateData = {
      status: "approved",
      visibility: "public",
      isFlagged: false,
      toxicityLevel: "low",
      approvedAt: new Date(),
      rejectedReason: null,
    };

    if (req.user?._id) {
      updateData.approvedBy =
        req.user._id;
    }

    const post =
      await Post.findByIdAndUpdate(
        postId,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: false,
        }
      )
        .populate(
          "authorId",
          "fullName email avatarUrl anonymousAlias"
        )
        .populate(
          "approvedBy",
          "fullName email avatarUrl"
        );

    await createModerationLogSafely({
      target: {
        type: "post",
        id: post._id,
      },

      action: "approve_post",

      reason:
        "Admin approved this post after review",

      note:
        "Post is now visible in Community Forum",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "approved",
    });

    return res.status(200).json({
      success: true,
      message:
        "Duyệt bài viết thành công. Bài viết đã được hiển thị trong Community.",
      data: post,
    });
  } catch (error) {
    console.error(
      "approvePost error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể duyệt bài viết.",
    });
  }
};

exports.rejectPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID bài viết không hợp lệ.",
      });
    }

    const currentPost = await Post.findById(
      postId
    )
      .select("status")
      .lean();

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy bài viết.",
      });
    }

    const previousStatus =
      currentPost.status;

    const rejectedReason =
      reason ||
      "Bài viết không phù hợp.";

    const post =
      await Post.findByIdAndUpdate(
        postId,
        {
          $set: {
            status: "deleted",
            visibility: "private",
            isFlagged: true,
            rejectedReason,
            approvedAt: null,
            approvedBy: null,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      )
        .populate(
          "authorId",
          "fullName email avatarUrl anonymousAlias"
        )
        .populate(
          "approvedBy",
          "fullName email avatarUrl"
        );

    await createModerationLogSafely({
      target: {
        type: "post",
        id: post._id,
      },

      action: "delete_content",

      reason: rejectedReason,

      note:
        "Post deleted after admin rejection",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "deleted",
    });

    return res.status(200).json({
      success: true,
      message:
        "Từ chối và xóa bài viết thành công.",
      data: post,
    });
  } catch (error) {
    console.error(
      "rejectPost error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể từ chối bài viết.",
    });
  }
};

exports.hidePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID bài viết không hợp lệ.",
      });
    }

    const currentPost = await Post.findById(
      postId
    )
      .select("status")
      .lean();

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy bài viết.",
      });
    }

    const previousStatus =
      currentPost.status;

    const hideReason =
      reason ||
      "Bài viết đã bị quản trị viên ẩn.";

    const post =
      await Post.findByIdAndUpdate(
        postId,
        {
          $set: {
            status: "hidden",

            // Bảo đảm API Community không lấy bài này.
            visibility: "private",

            rejectedReason: hideReason,
          },
        },
        {
          new: true,
          runValidators: false,
        }
      )
        .populate(
          "authorId",
          "fullName email avatarUrl anonymousAlias"
        )
        .populate(
          "approvedBy",
          "fullName email avatarUrl"
        );

    await createModerationLogSafely({
      target: {
        type: "post",
        id: post._id,
      },

      action: "hide_content",

      reason: hideReason,

      note:
        "Post was hidden manually by admin",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "hidden",
    });

    return res.status(200).json({
      success: true,
      message:
        "Ẩn bài viết thành công.",
      data: post,
    });
  } catch (error) {
    console.error(
      "hidePost error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể ẩn bài viết.",
    });
  }
};

exports.hideComment = async (
  req,
  res
) => {
  try {
    const commentId = req.params.id;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID bình luận không hợp lệ.",
      });
    }

    const currentComment =
      await Comment.findById(commentId)
        .select("status")
        .lean();

    if (
      !currentComment ||
      currentComment.status === "deleted"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy bình luận.",
      });
    }

    const previousStatus =
      currentComment.status;

    const comment =
      await Comment.findByIdAndUpdate(
        commentId,
        {
          $set: {
            status: "hidden",
          },
        },
        {
          new: true,
          runValidators: false,
        }
      );

    await createModerationLogSafely({
      target: {
        type: "comment",
        id: comment._id,
      },

      action: "hide_content",

      reason:
        reason ||
        "Comment hidden by admin",

      note:
        "Comment was hidden manually by admin",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "hidden",
    });

    return res.status(200).json({
      success: true,
      message:
        "Ẩn bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    console.error(
      "hideComment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể ẩn bình luận.",
    });
  }
};

exports.deleteCommentByAdmin = async (
  req,
  res
) => {
  try {
    const commentId = req.params.id;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!isValidObjectId(commentId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID bình luận không hợp lệ.",
      });
    }

    const comment =
      await Comment.findById(commentId);

    if (
      !comment ||
      comment.status === "deleted"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy bình luận.",
      });
    }

    const previousStatus =
      comment.status;

    comment.status = "deleted";

    await comment.save();

    if (comment.postId) {
      await Post.findByIdAndUpdate(
        comment.postId,
        {
          $inc: {
            "statistics.commentCount": -1,
          },
        }
      );
    }

    if (comment.parentCommentId) {
      await Comment.findByIdAndUpdate(
        comment.parentCommentId,
        {
          $inc: {
            "statistics.replyCount": -1,
          },
        }
      );
    }

    await createModerationLogSafely({
      target: {
        type: "comment",
        id: comment._id,
      },

      action: "delete_content",

      reason:
        reason ||
        "Comment deleted by admin",

      note:
        "Comment was deleted manually by admin",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "deleted",
    });

    return res.status(200).json({
      success: true,
      message:
        "Xóa bình luận thành công.",
    });
  } catch (error) {
    console.error(
      "deleteCommentByAdmin error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể xóa bình luận.",
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate(
        "reporterId",
        "fullName email avatarUrl"
      )
      .populate(
        "reportedUserId",
        "fullName email avatarUrl"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message:
        "Lấy danh sách report thành công.",
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error(
      "getReports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể lấy danh sách report.",
    });
  }
};

exports.dismissReport = async (
  req,
  res
) => {
  try {
    const reportId = req.params.id;

    if (!isValidObjectId(reportId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID report không hợp lệ.",
      });
    }

    const report = await Report.findById(
      reportId
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy report.",
      });
    }

    const previousStatus =
      report.status;

    report.status = "dismissed";

    await report.save();

    let updatedTarget = null;

    if (
      report.targetType === "post" &&
      isValidObjectId(report.targetId)
    ) {
      updatedTarget =
        await Post.findByIdAndUpdate(
          report.targetId,
          {
            $set: {
              status: "approved",
              visibility: "public",
              isFlagged: false,
              toxicityLevel: "low",
              rejectedReason: null,
              approvedAt: new Date(),
              approvedBy:
                req.user?._id || null,
            },
          },
          {
            new: true,
            runValidators: false,
          }
        );
    }

    if (
      report.targetType === "comment" &&
      isValidObjectId(report.targetId)
    ) {
      updatedTarget =
        await Comment.findByIdAndUpdate(
          report.targetId,
          {
            $set: {
              status: "active",
              toxicityLevel: "low",
            },
          },
          {
            new: true,
            runValidators: false,
          }
        );
    }

    await createModerationLogSafely({
      target: {
        type: "report",
        id: report._id,
      },

      action: "reject_report",

      reason:
        "Admin reviewed and found no violation",

      note:
        "Report dismissed. The content is now visible again.",

      performedBy: req.user?._id,

      previousStatus,

      newStatus: "dismissed",
    });

    await updateMoodReputation(
      report.reportedUserId
    );

    return res.status(200).json({
      success: true,
      message:
        "Đã bỏ qua report. Nội dung được phép hiển thị.",
      data: {
        report,
        target: updatedTarget,
      },
    });
  } catch (error) {
    console.error(
      "dismissReport error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể bỏ qua report.",
    });
  }
};

exports.takeActionReport = async (
  req,
  res
) => {
  try {
    const reportId = req.params.id;

    const reason =
      typeof req.body?.reason === "string"
        ? req.body.reason.trim()
        : "";

    if (!isValidObjectId(reportId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID report không hợp lệ.",
      });
    }

    const report = await Report.findById(
      reportId
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy report.",
      });
    }

    const previousReportStatus =
      report.status;

    report.status = "action_taken";

    await report.save();

    let previousTargetStatus = null;
    let updatedTarget = null;

    if (
      report.targetType === "post" &&
      isValidObjectId(report.targetId)
    ) {
      const post = await Post.findById(
        report.targetId
      )
        .select("status toxicityLevel")
        .lean();

      if (post) {
        previousTargetStatus =
          post.status;

        const toxicityLevel =
          report.aiReview?.severity ===
          "high"
            ? "high"
            : report.aiReview
                  ?.severity === "medium"
              ? "medium"
              : post.toxicityLevel ||
                "medium";

        updatedTarget =
          await Post.findByIdAndUpdate(
            report.targetId,
            {
              $set: {
                status: "deleted",
                visibility: "private",
                isFlagged: true,
                toxicityLevel,

                rejectedReason:
                  reason ||
                  report.reason ||
                  "Bài viết vi phạm quy tắc cộng đồng.",
              },
            },
            {
              new: true,
              runValidators: false,
            }
          );
      }
    }

    if (
      report.targetType === "comment" &&
      isValidObjectId(report.targetId)
    ) {
      const comment =
        await Comment.findById(
          report.targetId
        );

      if (comment) {
        previousTargetStatus =
          comment.status;

        comment.status = "deleted";

        comment.toxicityLevel =
          report.aiReview?.severity ===
          "high"
            ? "high"
            : report.aiReview
                  ?.severity === "medium"
              ? "medium"
              : comment.toxicityLevel ||
                "medium";

        updatedTarget =
          await comment.save();

        if (comment.postId) {
          await Post.findByIdAndUpdate(
            comment.postId,
            {
              $inc: {
                "statistics.commentCount":
                  -1,
              },
            }
          );
        }

        if (comment.parentCommentId) {
          await Comment.findByIdAndUpdate(
            comment.parentCommentId,
            {
              $inc: {
                "statistics.replyCount":
                  -1,
              },
            }
          );
        }
      }
    }

    const oneWeekAgo = new Date();

    oneWeekAgo.setDate(
      oneWeekAgo.getDate() - 7
    );

    const validReportsCount =
      await Report.countDocuments({
        reportedUserId:
          report.reportedUserId,

        status: "action_taken",

        createdAt: {
          $gte: oneWeekAgo,
        },
      });

    let bannedUntil = null;

    if (
      validReportsCount > 3 &&
      report.reportedUserId
    ) {
      bannedUntil = new Date();

      bannedUntil.setDate(
        bannedUntil.getDate() + 30
      );

      await User.findByIdAndUpdate(
        report.reportedUserId,
        {
          $set: {
            forumBannedUntil:
              bannedUntil,
          },
        }
      );

      await createModerationLogSafely({
        target: {
          type: "user",
          id: report.reportedUserId,
        },

        action: "block_user",

        reason:
          "User received more than 3 valid reports within 7 days",

        note: `Auto banned until ${bannedUntil.toISOString()}`,

        performedBy: req.user?._id,

        previousStatus: "active",

        newStatus: "forum_banned",
      });
    }

    await createModerationLogSafely({
      target: {
        type: report.targetType,
        id: report.targetId,
      },

      action: "delete_content",

      reason:
        reason ||
        report.reason ||
        "Admin confirmed violation",

      note:
        `Report status changed from ${previousReportStatus} ` +
        "to action_taken. Target content was deleted.",

      performedBy: req.user?._id,

      previousStatus:
        previousTargetStatus,

      newStatus: "deleted",
    });

    await updateMoodReputation(
      report.reportedUserId
    );

    return res.status(200).json({
      success: true,
      message:
        "Đã xử lý report. Nội dung vi phạm đã bị xóa khỏi forum.",
      data: {
        report,
        target: updatedTarget,
        validReportsCount,
        bannedUntil,
      },
    });
  } catch (error) {
    console.error(
      "takeActionReport error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể xử lý report.",
    });
  }
};

exports.resolveAppeal = async (
  req,
  res
) => {
  try {
    const reportId = req.params.id;

    const {
      action,
      note,
    } = req.body;

    if (!isValidObjectId(reportId)) {
      return res.status(400).json({
        success: false,
        message:
          "ID report không hợp lệ.",
      });
    }

    if (
      action !== "accept" &&
      action !== "reject"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "action không hợp lệ. Chỉ nhận accept hoặc reject.",
      });
    }

    const report = await Report.findById(
      reportId
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy report.",
      });
    }

    if (
      report.status !==
      "appeal_pending"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Report này không ở trạng thái chờ appeal.",
      });
    }

    const previousStatus =
      report.status;

    if (action === "accept") {
      report.status =
        "appeal_accepted";

      report.appealResolvedAt =
        new Date();

      report.appealNote =
        note ||
        "Admin accepted appeal.";

      await report.save();

      let restoredTarget = null;

      if (
        report.targetType === "post" &&
        isValidObjectId(
          report.targetId
        )
      ) {
        restoredTarget =
          await Post.findByIdAndUpdate(
            report.targetId,
            {
              $set: {
                status: "approved",
                visibility: "public",
                isFlagged: false,
                toxicityLevel: "low",
                rejectedReason: null,
                approvedAt: new Date(),

                approvedBy:
                  req.user?._id ||
                  null,
              },
            },
            {
              new: true,
              runValidators: false,
            }
          );
      }

      if (
        report.targetType ===
          "comment" &&
        isValidObjectId(
          report.targetId
        )
      ) {
        restoredTarget =
          await Comment.findByIdAndUpdate(
            report.targetId,
            {
              $set: {
                status: "active",
                toxicityLevel: "low",
              },
            },
            {
              new: true,
              runValidators: false,
            }
          );
      }

      await createModerationLogSafely({
        target: {
          type: "report",
          id: report._id,
        },

        action: "appeal_accepted",

        reason:
          note ||
          "Appeal accepted by admin",

        note:
          "Target content was restored when possible",

        performedBy: req.user?._id,

        previousStatus,

        newStatus:
          "appeal_accepted",
      });

      await updateMoodReputation(
        report.reportedUserId
      );

      return res.status(200).json({
        success: true,
        message:
          "Đã chấp nhận appeal và khôi phục nội dung.",
        data: {
          report,
          target: restoredTarget,
        },
      });
    }

    report.status = "appeal_rejected";

    report.appealResolvedAt =
      new Date();

    report.appealNote =
      note ||
      "Admin rejected appeal.";

    await report.save();

    await createModerationLogSafely({
      target: {
        type: "report",
        id: report._id,
      },

      action: "appeal_rejected",

      reason:
        note ||
        "Appeal rejected by admin",

      note:
        "Target content remains removed or hidden",

      performedBy: req.user?._id,

      previousStatus,

      newStatus:
        "appeal_rejected",
    });

    await updateMoodReputation(
      report.reportedUserId
    );

    return res.status(200).json({
      success: true,
      message:
        "Đã từ chối appeal.",
      data: report,
    });
  } catch (error) {
    console.error(
      "resolveAppeal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Không thể xử lý appeal.",
    });
  }
};