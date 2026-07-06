const Event = require("../../models/Event");
const {
  isAdmin,
  isValidObjectId,
  getCurrentUserId,
  findScheduleConflict,
  validateEventPayload,
} = require("./eventHelpers");

async function getAdminPendingEvents(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được xem danh sách pending.",
      });
    }

    const events = await Event.find({
      approvalStatus: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email avatarUrl role");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event pending thành công.",
      data: events,
    });
  } catch (error) {
    console.error("getAdminPendingEvents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách event pending.",
    });
  }
}

async function getAdminAllEvents(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được xem tất cả event.",
      });
    }

    const {
      approvalStatus,
      status,
      eventMode,
      eventType,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.status = status;
    if (eventMode) query.eventMode = eventMode;
    if (eventType) query.eventType = eventType;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("createdBy", "fullName email avatarUrl role"),
      Event.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy tất cả event thành công.",
      data: events,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getAdminAllEvents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách event.",
    });
  }
}

async function getAdminEventById(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được xem chi tiết event này.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findById(id).populate(
      "createdBy approvedBy",
      "fullName email avatarUrl role"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết event thành công.",
      data: event,
    });
  } catch (error) {
    console.error("getAdminEventById error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết event.",
    });
  }
}

async function approveEvent(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được duyệt event.",
      });
    }

    const adminId = getCurrentUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findById(id).populate(
      "createdBy",
      "fullName email avatarUrl role"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    if (event.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Event này đã được duyệt trước đó.",
      });
    }

    if (event.status === "cancelled" || event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt event đã hủy hoặc đã kết thúc.",
      });
    }

    const validationError = validateEventPayload({}, event);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const now = new Date();

    if (new Date(event.endDateTime) <= now) {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt event đã qua thời gian kết thúc.",
      });
    }

    const conflictEvent = await findScheduleConflict(event);

    if (conflictEvent) {
      return res.status(409).json({
        success: false,
        message:
          "Event bị trùng lịch với event đã được duyệt tại cùng địa điểm/link meeting.",
        conflict: {
          _id: conflictEvent._id,
          title: conflictEvent.title,
          eventMode: conflictEvent.eventMode,
          location: conflictEvent.location,
          meetingLink: conflictEvent.meetingLink,
          startDateTime: conflictEvent.startDateTime,
          endDateTime: conflictEvent.endDateTime,
        },
      });
    }

    event.approvalStatus = "approved";
    event.approvedBy = adminId;
    event.approvedAt = new Date();
    event.rejectedReason = null;
    event.lockAfterApproval = true;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Duyệt event thành công. Event đã public cho user đăng ký.",
      data: event,
    });
  } catch (error) {
    console.error("approveEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể duyệt event.",
    });
  }
}

async function rejectEvent(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được từ chối event.",
      });
    }

    const { id } = req.params;
    const reason =
      req.body?.reason || "Event không phù hợp hoặc thiếu thông tin.";

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    if (event.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Event đã được duyệt nên không thể từ chối.",
      });
    }

    event.approvalStatus = "rejected";
    event.rejectedReason = reason;
    event.approvedBy = null;
    event.approvedAt = null;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Từ chối event thành công.",
      data: event,
    });
  } catch (error) {
    console.error("rejectEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể từ chối event.",
    });
  }
}

module.exports = {
  getAdminPendingEvents,
  getAdminAllEvents,
  getAdminEventById,
  approveEvent,
  rejectEvent,
};