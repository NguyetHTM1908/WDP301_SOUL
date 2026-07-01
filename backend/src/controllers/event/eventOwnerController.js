const Event = require("../../models/Event");
const {
  buildEventPayload,
  validateEventPayload,
  getCurrentUserId,
  canCreateEvent,
  isValidObjectId,
} = require("./eventHelpers");

async function createEvent(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    if (!canCreateEvent(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ người tổ chức sự kiện mới có quyền tạo event.",
      });
    }

    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const event = await Event.create({
      ...payload,
      location: payload.eventMode === "offline" ? payload.location : null,
      meetingLink: payload.eventMode === "online" ? payload.meetingLink : null,
      approvalStatus: "pending",
      status: "upcoming",
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      registeredCount: 0,
      participants: [],
      createdBy: userId,
      lockAfterApproval: true,
    });

    return res.status(201).json({
      success: true,
      message:
        "Tạo event thành công. Event đang chờ admin duyệt trước khi public.",
      data: event,
    });
  } catch (error) {
    console.error("createEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo event.",
    });
  }
}

async function getMyEvents(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    const events = await Event.find({
      createdBy: userId,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email avatarUrl role");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event của bạn thành công.",
      data: events,
    });
  } catch (error) {
    console.error("getMyEvents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy event của bạn.",
    });
  }
}

async function getMyEventById(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
    }).populate("createdBy", "fullName email avatarUrl role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event của bạn.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết event của bạn thành công.",
      data: event,
    });
  } catch (error) {
    console.error("getMyEventById error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết event.",
    });
  }
}

async function updateEvent(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    if (!canCreateEvent(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ người tổ chức sự kiện mới có quyền sửa event.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event của bạn.",
      });
    }

    if (event.approvalStatus === "approved" && event.lockAfterApproval) {
      return res.status(403).json({
        success: false,
        message: "Event đã được duyệt nên không thể chỉnh sửa.",
      });
    }

    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload, event);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    Object.entries(payload).forEach(([key, value]) => {
      event[key] = value;
    });

    if (event.eventMode === "online") {
      event.location = null;
    }

    if (event.eventMode === "offline") {
      event.meetingLink = null;
    }

    if (event.approvalStatus === "rejected") {
      event.approvalStatus = "pending";
      event.rejectedReason = null;
      event.approvedBy = null;
      event.approvedAt = null;
    }

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật event thành công.",
      data: event,
    });
  } catch (error) {
    console.error("updateEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể cập nhật event.",
    });
  }
}

async function deleteEvent(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    if (!canCreateEvent(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ người tổ chức sự kiện mới có quyền xóa event.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: userId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event của bạn.",
      });
    }

    if (event.approvalStatus === "approved" && event.lockAfterApproval) {
      return res.status(403).json({
        success: false,
        message: "Event đã được duyệt nên không thể xóa.",
      });
    }

    await event.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Xóa event thành công.",
    });
  } catch (error) {
    console.error("deleteEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xóa event.",
    });
  }
}

module.exports = {
  createEvent,
  getMyEvents,
  getMyEventById,
  updateEvent,
  deleteEvent,
};