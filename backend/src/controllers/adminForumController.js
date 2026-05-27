const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Report = require("../models/Report");
const User = require("../models/User");
const ModerationLog = require("../models/ModerationLog");

exports.getAllPostsForAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) filter.status = status;

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
    return res.status(500).json({
      success: false,
      message: error.message,
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
      reason: "Bài viết phù hợp với quy tắc cộng đồng",
      note: "Approved from pending queue",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "approved",
    });

    return res.status(200).json({
      success: true,
      message: "Duyệt bài viết thành công.",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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

    post.status = "rejected";
    post.rejectedReason = reason || "Bài viết không phù hợp.";
    post.approvedAt = null;
    post.approvedBy = null;

    await post.save();

    await ModerationLog.create({
      target: {
        type: "post",
        id: post._id,
      },
      action: "reject_post",
      reason: post.rejectedReason,
      note: "Rejected from pending queue",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "rejected",
    });

    return res.status(200).json({
      success: true,
      message: "Từ chối bài viết thành công.",
      data: post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    return res.status(500).json({
      success: false,
      message: error.message,
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
    return res.status(500).json({
      success: false,
      message: error.message,
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

    await ModerationLog.create({
      target: {
        type: "report",
        id: report._id,
      },
      action: "reject_report",
      reason: "Report dismissed",
      note: "Admin reviewed and rejected this report",
      performedBy: req.user._id,
      previousStatus,
      newStatus: "dismissed",
    });

    return res.status(200).json({
      success: true,
      message: "Đã bỏ qua report.",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    let newTargetStatus = "hidden";

    if (report.targetType === "post") {
      const post = await Post.findById(report.targetId);

      if (post) {
        previousTargetStatus = post.status;
        post.status = "hidden";
        post.isFlagged = true;
        await post.save();
      }
    }

    if (report.targetType === "comment") {
      const comment = await Comment.findById(report.targetId);

      if (comment) {
        previousTargetStatus = comment.status;
        comment.status = "hidden";
        await comment.save();
      }
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const validReportsCount = await Report.countDocuments({
      reportedUserId: report.reportedUserId,
      status: "action_taken",
      createdAt: { $gte: oneWeekAgo },
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
      action: "resolve_report",
      reason: reason || "Admin took action on report",
      note: `Report status changed from ${previousReportStatus} to action_taken`,
      performedBy: req.user._id,
      previousStatus: previousTargetStatus,
      newStatus: newTargetStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Đã xử lý report thành công.",
      data: {
        report,
        validReportsCount,
        bannedUntil,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};