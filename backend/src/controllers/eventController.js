const Event = require("../models/Event");

/**
 * @route   GET /api/events
 * @desc    Get list of events
 * @access  Public
 */
const getEvents = async (req, res) => {
  try {
    const { status, eventType, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await Event.find(query)
      .sort({ startDateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("createdBy", "username fullName avatar");

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   GET /api/events/:id
 * @desc    Get event detail by ID
 * @access  Public
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id).populate(
      "createdBy",
      "username fullName avatar"
    );

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Build response, exclude full participants array to keep it clean
    // but include registered count
    const responseData = event.toObject();

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching event detail:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   GET /api/events/me/registered
 * @desc    Get events registered by current user
 * @access  Private (User)
 */
const getRegisteredEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = "registered", page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const validStatuses = ["registered", "cancelled", "attended"];
    if (status !== "all" && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration status",
      });
    }

    const participantQuery = { userId };
    if (status !== "all") {
      participantQuery.status = status;
    }

    const query = {
      participants: {
        $elemMatch: participantQuery,
      },
    };

    const events = await Event.find(query)
      .sort({ startDateTime: 1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("createdBy", "username fullName avatar");

    const total = await Event.countDocuments(query);

    const data = events.map((event) => {
      const eventData = event.toObject();
      const registration = eventData.participants.find(
        (participant) => participant.userId.toString() === userId.toString()
      );

      delete eventData.participants;

      return {
        ...eventData,
        registration,
      };
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching registered events:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   POST /api/events/:id/register
 * @desc    Register for an event
 * @access  Private (User)
 */
const registerEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Chỉ cho đăng ký event sắp diễn ra
    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đăng ký các sự kiện sắp diễn ra",
      });
    }

    // Kiểm tra user đã đăng ký chưa
    const existingParticipant = event.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (existingParticipant) {
      if (existingParticipant.status === "registered") {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đăng ký sự kiện này rồi",
        });
      }
      // Nếu đã cancel trước đó thì cho phép đăng ký lại
      existingParticipant.status = "registered";
      existingParticipant.registeredAt = new Date();
      existingParticipant.cancelledAt = null;
    } else {
      // Kiểm tra giới hạn 3 event đồng thời (status = upcoming)
      const upcomingEventIds = await Event.find({
        "participants.userId": userId,
        "participants.status": "registered",
        status: "upcoming",
      }).select("_id");

      if (upcomingEventIds.length >= 3) {
        return res.status(400).json({
          success: false,
          message: "Bạn chỉ có thể đăng ký tối đa 3 sự kiện cùng lúc",
        });
      }

      // Kiểm tra capacity
      if (event.capacity !== null && event.registeredCount >= event.capacity) {
        return res.status(400).json({
          success: false,
          message: "Sự kiện đã đủ số lượng tham gia",
        });
      }

      // Thêm participant mới
      event.participants.push({
        userId,
        status: "registered",
        registeredAt: new Date(),
      });
    }

    event.registeredCount = event.participants.filter(
      (p) => p.status === "registered"
    ).length;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Đăng ký sự kiện thành công",
      data: {
        eventId: event._id,
        title: event.title,
        registeredCount: event.registeredCount,
      },
    });
  } catch (error) {
    console.error("Error registering event:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   POST /api/events/:id/cancel
 * @desc    Cancel event registration
 * @access  Private (User)
 */
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Không cho hủy event đã diễn ra hoặc đã completed
    if (event.status === "completed" || event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đăng ký sự kiện đã kết thúc hoặc bị hủy",
      });
    }

    // Tìm participant
    const participant = event.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!participant || participant.status !== "registered") {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa đăng ký sự kiện này",
      });
    }

    // Cập nhật status sang cancelled
    participant.status = "cancelled";
    participant.cancelledAt = new Date();

    event.registeredCount = event.participants.filter(
      (p) => p.status === "registered"
    ).length;

    await event.save();

    res.status(200).json({
      success: true,
      message: "Hủy đăng ký sự kiện thành công",
      data: {
        eventId: event._id,
        title: event.title,
        registeredCount: event.registeredCount,
      },
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getRegisteredEvents,
  registerEvent,
  cancelRegistration,
};
