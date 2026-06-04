const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");

const EVENT_TYPES = ["workshop", "talkshow", "webinar", "community_event", null];
const EVENT_STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];
const REGISTRATION_STATUSES = ["registered", "cancelled", "attended"];
const ADMIN_REGISTRATION_FILTERS = ["all", "registered", "cancelled"];

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const buildEventPayload = (body) => {
  const allowedFields = [
    "title",
    "description",
    "speakerName",
    "organizerName",
    "contactEmail",
    "bannerImage",
    "images",
    "eventType",
    "startDateTime",
    "endDateTime",
    "location",
    "meetingLink",
    "capacity",
    "status",
  ];

  return allowedFields.reduce((payload, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const validateEventPayload = (payload, { isCreate = false, currentEvent = null } = {}) => {
  if (isCreate && (!payload.title || !payload.startDateTime)) {
    return "Title and startDateTime are required";
  }

  if (payload.title !== undefined && !String(payload.title).trim()) {
    return "Title cannot be empty";
  }

  if (payload.eventType !== undefined && !EVENT_TYPES.includes(payload.eventType)) {
    return "Invalid event type";
  }

  if (payload.status !== undefined && !EVENT_STATUSES.includes(payload.status)) {
    return "Invalid event status";
  }

  if (payload.capacity !== undefined && payload.capacity !== null) {
    const capacity = Number(payload.capacity);
    const registeredCount = currentEvent ? currentEvent.registeredCount : 0;

    if (!Number.isInteger(capacity) || capacity < 0) {
      return "Capacity must be a non-negative integer";
    }

    if (capacity < registeredCount) {
      return "Capacity cannot be lower than current registered count";
    }

    payload.capacity = capacity;
  }

  const startDateTime =
    payload.startDateTime !== undefined
      ? new Date(payload.startDateTime)
      : currentEvent && currentEvent.startDateTime;
  const endDateTime =
    payload.endDateTime !== undefined
      ? payload.endDateTime === null
        ? null
        : new Date(payload.endDateTime)
      : currentEvent && currentEvent.endDateTime;

  if (payload.startDateTime !== undefined && Number.isNaN(startDateTime.getTime())) {
    return "Invalid startDateTime";
  }

  if (
    payload.endDateTime !== undefined &&
    payload.endDateTime !== null &&
    Number.isNaN(endDateTime.getTime())
  ) {
    return "Invalid endDateTime";
  }

  if (endDateTime && startDateTime && endDateTime <= startDateTime) {
    return "endDateTime must be after startDateTime";
  }

  if (payload.startDateTime !== undefined) {
    payload.startDateTime = startDateTime;
  }

  if (payload.endDateTime !== undefined) {
    payload.endDateTime = endDateTime;
  }

  return null;
};

const getExternalEventRegistrations = async (eventId) => {
  const registrations = await mongoose.connection
    .collection("event_registrations")
    .find({ eventId: new mongoose.Types.ObjectId(eventId) })
    .toArray();

  if (!registrations.length) {
    return [];
  }

  const userIds = registrations.map((registration) => registration.userId);
  const users = await User.find({ _id: { $in: userIds } })
    .select("fullName email phone avatarUrl role status")
    .lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return registrations.map((registration) => ({
    userId: userMap.get(registration.userId.toString()) || registration.userId,
    status: registration.status,
    registeredAt: registration.registeredAt,
    cancelledAt: registration.cancelledAt || null,
  }));
};

const normalizeEmbeddedRegistration = (participant) => ({
  userId: participant.userId,
  status: participant.status,
  registeredAt: participant.registeredAt,
  cancelledAt: participant.cancelledAt || null,
});

const mergeRegistrations = (embeddedRegistrations, externalRegistrations) => {
  const merged = new Map();

  [...externalRegistrations, ...embeddedRegistrations].forEach((registration) => {
    const userId =
      registration.userId && registration.userId._id
        ? registration.userId._id.toString()
        : registration.userId && registration.userId.toString();

    if (userId) {
      merged.set(userId, registration);
    }
  });

  return Array.from(merged.values());
};

const buildRegistrationStats = (registrations, capacity) => {
  const registered = registrations.filter(
    (registration) => registration.status === "registered"
  ).length;
  const cancelled = registrations.filter(
    (registration) => registration.status === "cancelled"
  ).length;

  return {
    totalRegistrations: registered,
    totalCancelled: cancelled,
    capacity,
    remainingSlots: capacity === null || capacity === undefined
      ? null
      : Math.max(capacity - registered, 0),
  };
};

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
    if (!isValidObjectId(id)) {
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
 * @route   POST /api/events
 * @desc    Create event
 * @access  Private (Admin)
 */
const createEvent = async (req, res) => {
  try {
    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload, { isCreate: true });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const event = await Event.create({
      ...payload,
      registeredCount: 0,
      participants: [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   PATCH /api/events/:id
 * @desc    Update event
 * @access  Private (Admin)
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload, { currentEvent: event });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    Object.assign(event, payload);
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Admin)
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: {
        eventId: event._id,
        title: event.title,
      },
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @route   GET /api/events/:id/registrations
 * @desc    Get event registrations
 * @access  Private (Admin)
 */
const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "all", page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    if (!ADMIN_REGISTRATION_FILTERS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration status",
      });
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const event = await Event.findById(id)
      .populate("participants.userId", "fullName email phone avatarUrl role status")
      .select("title startDateTime endDateTime status capacity registeredCount participants");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const embeddedRegistrations = event.participants.map(normalizeEmbeddedRegistration);
    const externalRegistrations = await getExternalEventRegistrations(id);
    const allRegistrations = mergeRegistrations(
      embeddedRegistrations,
      externalRegistrations
    ).filter((registration) =>
      ADMIN_REGISTRATION_FILTERS.includes(registration.status)
    );
    const stats = buildRegistrationStats(allRegistrations, event.capacity);

    const registrations = allRegistrations
      .filter((registration) => status === "all" || registration.status === status)
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    const paginatedRegistrations = registrations.slice(skip, skip + limitNumber);

    res.status(200).json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          status: event.status,
          capacity: event.capacity,
          registeredCount: stats.totalRegistrations,
        },
        registrations: paginatedRegistrations,
        stats,
      },
      pagination: {
        total: registrations.length,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(registrations.length / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
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
  createEvent,
  updateEvent,
  deleteEvent,
  getEventRegistrations,
  getRegisteredEvents,
  registerEvent,
  cancelRegistration,
};
