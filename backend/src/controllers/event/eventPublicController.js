const Event = require("../../models/Event");
const { cleanPublicEvent, isValidObjectId } = require("./eventHelpers");

async function getEvents(req, res) {
  try {
    const { eventType, eventMode, page = 1, limit = 10, from, to } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {
      approvalStatus: "approved",
      status: { $ne: "cancelled" },
    };

    if (eventType) {
      query.eventType = eventType;
    }

    if (eventMode) {
      query.eventMode = eventMode;
    }

    if (from || to) {
      query.startDateTime = {};

      if (from) query.startDateTime.$gte = new Date(from);
      if (to) query.startDateTime.$lte = new Date(to);
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("createdBy", "fullName email avatarUrl role"),
      Event.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event thành công.",
      data: events.map(cleanPublicEvent),
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getEvents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách event.",
    });
  }
}

async function getEventCalendar(req, res) {
  try {
    const { from, to } = req.query;

    const query = {
      approvalStatus: "approved",
      status: { $ne: "cancelled" },
    };

    if (from || to) {
      query.startDateTime = {};

      if (from) query.startDateTime.$gte = new Date(from);
      if (to) query.startDateTime.$lte = new Date(to);
    }

    const events = await Event.find(query)
      .sort({ startDateTime: 1 })
      .select(
        "title description eventType eventMode startDateTime endDateTime location meetingLink capacity registeredCount status approvalStatus bannerImage"
      );

    return res.status(200).json({
      success: true,
      message: "Lấy lịch event thành công.",
      data: events,
    });
  } catch (error) {
    console.error("getEventCalendar error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy lịch event.",
    });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findOne({
      _id: id,
      approvalStatus: "approved",
      status: { $ne: "cancelled" },
    }).populate("createdBy", "fullName email avatarUrl role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event hoặc event chưa được duyệt.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết event thành công.",
      data: cleanPublicEvent(event),
    });
  } catch (error) {
    console.error("getEventById error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết event.",
    });
  }
}

module.exports = {
  getEvents,
  getEventCalendar,
  getEventById,
};
