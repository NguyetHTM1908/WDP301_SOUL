const Event = require("../../models/Event");
const {
  ADMIN_REGISTRATION_FILTERS,
  REGISTRATION_STATUSES,
  buildRegistrationStats,
  canCancelBefore24Hours,
  cleanPublicEvent,
  countUserUpcomingRegistrations,
  getCurrentUserId,
  getParticipant,
  isAdmin,
  isValidObjectId,
  syncRegisteredCount,
  toObjectId,
} = require("./eventHelpers");

async function getRegisteredEvents(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    const { status = "registered", page = 1, limit = 20 } = req.query;

    if (status !== "all" && !REGISTRATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đăng ký không hợp lệ.",
      });
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const participantMatch =
      status === "all"
        ? { userId: toObjectId(userId) }
        : { userId: toObjectId(userId), status };

    const query = {
      approvalStatus: "approved",
      participants: {
        $elemMatch: participantMatch,
      },
    };

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("createdBy", "fullName email avatarUrl role"),
      Event.countDocuments(query),
    ]);

    const data = events.map((event) => {
      const obj = event.toObject();

      const registration = obj.participants.find(
        (participant) => participant.userId.toString() === userId.toString()
      );

      delete obj.participants;

      return {
        ...obj,
        registration,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Lấy lịch event đã đăng ký thành công.",
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("getRegisteredEvents error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy lịch event đã đăng ký.",
    });
  }
}

async function registerEvent(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để đăng ký event.",
      });
    }

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

    if (event.approvalStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Event chưa được admin duyệt nên chưa thể đăng ký.",
      });
    }

    if (!["upcoming", "ongoing"].includes(event.status)) {
      return res.status(400).json({
        success: false,
        message: "Event không còn mở đăng ký.",
      });
    }

    const now = new Date();

    if (new Date(event.endDateTime) <= now) {
      return res.status(400).json({
        success: false,
        message: "Event đã kết thúc, không thể đăng ký.",
      });
    }

    const existingParticipant = getParticipant(event, userId);

    if (existingParticipant && existingParticipant.status === "registered") {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký event này rồi.",
      });
    }

    const activeCount = event.participants.filter(
      (participant) => participant.status === "registered"
    ).length;

    if (event.capacity && activeCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event đã đủ số lượng đăng ký.",
      });
    }

    const userUpcomingCount = await countUserUpcomingRegistrations(userId);

    if (userUpcomingCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ được đăng ký tối đa 3 event sắp diễn ra cùng lúc.",
      });
    }

    if (existingParticipant && existingParticipant.status === "cancelled") {
      existingParticipant.status = "registered";
      existingParticipant.registeredAt = new Date();
      existingParticipant.cancelledAt = null;
    } else {
      event.participants.push({
        userId,
        status: "registered",
        registeredAt: new Date(),
        cancelledAt: null,
      });
    }

    syncRegisteredCount(event);

    await event.save();

    return res.status(200).json({
      success: true,
      message:
        "Đăng ký tham dự event thành công. Event đã được thêm vào lịch của bạn.",
      data: cleanPublicEvent(event),
    });
  } catch (error) {
    console.error("registerEvent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể đăng ký event.",
    });
  }
}

async function cancelRegistration(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để hủy đăng ký.",
      });
    }

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

    if (!canCancelBefore24Hours(event)) {
      return res.status(400).json({
        success: false,
        message:
          "Bạn chỉ có thể hủy đăng ký trước khi event diễn ra ít nhất 24 giờ.",
      });
    }

    if (event.status === "cancelled" || event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Event đã hủy hoặc đã kết thúc nên không thể hủy đăng ký.",
      });
    }

    const participant = getParticipant(event, userId);

    if (!participant || participant.status !== "registered") {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa đăng ký event này hoặc đã hủy trước đó.",
      });
    }

    participant.status = "cancelled";
    participant.cancelledAt = new Date();

    syncRegisteredCount(event);

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Hủy đăng ký tham dự event thành công.",
      data: cleanPublicEvent(event),
    });
  } catch (error) {
    console.error("cancelRegistration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể hủy đăng ký event.",
    });
  }
}

async function getEventRegistrations(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được xem danh sách đăng ký.",
      });
    }

    const { id } = req.params;
    const { status = "all", page = 1, limit = 50 } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    if (!ADMIN_REGISTRATION_FILTERS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đăng ký không hợp lệ.",
      });
    }

    const event = await Event.findById(id)
      .populate("createdBy", "fullName email avatarUrl role")
      .populate("participants.userId", "fullName email phone avatarUrl role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 300);
    const skip = (pageNumber - 1) * limitNumber;

    let registrations = event.participants || [];

    if (status !== "all") {
      registrations = registrations.filter((item) => item.status === status);
    }

    const total = registrations.length;
    const paginatedRegistrations = registrations.slice(skip, skip + limitNumber);
    const stats = buildRegistrationStats(event);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách người đăng ký event thành công.",
      data: {
        event: {
          _id: event._id,
          title: event.title,
          eventMode: event.eventMode,
          location: event.location,
          meetingLink: event.meetingLink,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          capacity: event.capacity,
          registeredCount: event.registeredCount,
          approvalStatus: event.approvalStatus,
          status: event.status,
          createdBy: event.createdBy,
        },
        stats,
        registrations: paginatedRegistrations,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    console.error("getEventRegistrations error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách người đăng ký.",
    });
  }
}

module.exports = {
  getRegisteredEvents,
  registerEvent,
  cancelRegistration,
  getEventRegistrations,
};