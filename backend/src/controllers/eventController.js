const mongoose = require("mongoose");
const Event = require("../models/Event");
const User = require("../models/User");

const EVENT_TYPES = [
  "workshop",
  "talkshow",
  "webinar",
  "community_event",
  null,
];

const REGISTRATION_STATUSES = ["registered", "cancelled", "attended"];
const ADMIN_REGISTRATION_FILTERS = [
  "all",
  "registered",
  "cancelled",
  "attended",
];

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

const toObjectId = (id) => new mongoose.Types.ObjectId(id.toString());

const getEventRegistrationCollection = () =>
  mongoose.connection.collection("event_registrations");

function getCurrentUserId(req) {
  return req.user?._id || req.user?.id || req.userId || null;
}

function isAdmin(req) {
  return req.user?.role === "admin";
}

function canCreateEvent(req) {
  return req.user?.role === "admin" || req.user?.role === "event_organizer";
}

function normalizeLocationKey(location, meetingLink) {
  const raw =
    location && String(location).trim()
      ? String(location).trim()
      : meetingLink && String(meetingLink).trim()
      ? `online:${String(meetingLink).trim()}`
      : "online";

  return raw.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const text = String(value).trim();
  return text ? text : null;
}

function buildEventPayload(body) {
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
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(body, field)) return;

    if (
      [
        "description",
        "speakerName",
        "organizerName",
        "contactEmail",
        "bannerImage",
        "location",
        "meetingLink",
      ].includes(field)
    ) {
      payload[field] = normalizeOptionalString(body[field]);
      return;
    }

    if (field === "capacity") {
      if (
        body[field] === "" ||
        body[field] === null ||
        body[field] === undefined
      ) {
        payload[field] = null;
      } else {
        payload[field] = body[field];
      }
      return;
    }

    if (field === "eventType") {
      payload[field] = body[field] === "" ? null : body[field];
      return;
    }

    payload[field] = body[field];
  });

  return payload;
}

function validateEventPayload(
  payload,
  { isCreate = false, currentEvent = null } = {}
) {
  if (
    isCreate &&
    (!payload.title || !payload.startDateTime || !payload.endDateTime)
  ) {
    return "title, startDateTime và endDateTime là bắt buộc.";
  }

  if (payload.title !== undefined && !String(payload.title).trim()) {
    return "Tên event không được để trống.";
  }

  if (
    payload.eventType !== undefined &&
    !EVENT_TYPES.includes(payload.eventType)
  ) {
    return "Loại event không hợp lệ.";
  }

  if (payload.capacity !== undefined && payload.capacity !== null) {
    const capacity = Number(payload.capacity);
    const registeredCount = currentEvent ? currentEvent.registeredCount : 0;

    if (!Number.isInteger(capacity) || capacity < 1) {
      return "Sức chứa phải là số nguyên lớn hơn 0.";
    }

    if (capacity < registeredCount) {
      return "Sức chứa không được nhỏ hơn số người đã đăng ký.";
    }

    payload.capacity = capacity;
  }

  const startDateTime =
    payload.startDateTime !== undefined
      ? new Date(payload.startDateTime)
      : currentEvent?.startDateTime;

  const endDateTime =
    payload.endDateTime !== undefined
      ? new Date(payload.endDateTime)
      : currentEvent?.endDateTime;

  if (
    payload.startDateTime !== undefined &&
    Number.isNaN(startDateTime.getTime())
  ) {
    return "startDateTime không hợp lệ.";
  }

  if (
    payload.endDateTime !== undefined &&
    Number.isNaN(endDateTime.getTime())
  ) {
    return "endDateTime không hợp lệ.";
  }

  if (startDateTime && endDateTime && endDateTime <= startDateTime) {
    return "endDateTime phải sau startDateTime.";
  }

  if (payload.startDateTime !== undefined) {
    payload.startDateTime = startDateTime;
  }

  if (payload.endDateTime !== undefined) {
    payload.endDateTime = endDateTime;
  }

  if (payload.images !== undefined && !Array.isArray(payload.images)) {
    return "images phải là mảng.";
  }

  return null;
}

async function getExternalEventRegistrations(eventId) {
  const registrations = await getEventRegistrationCollection()
    .find({ eventId: toObjectId(eventId) })
    .toArray();

  if (!registrations.length) return [];

  const userIds = registrations.map((item) => item.userId);

  const users = await User.find({ _id: { $in: userIds } })
    .select("fullName email phone avatarUrl role status")
    .lean();

  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return registrations.map((item) => ({
    userId: userMap.get(item.userId.toString()) || item.userId,
    status: item.status,
    registeredAt: item.registeredAt,
    cancelledAt: item.cancelledAt || null,
  }));
}

function normalizeEmbeddedRegistration(participant) {
  return {
    userId: participant.userId,
    status: participant.status,
    registeredAt: participant.registeredAt,
    cancelledAt: participant.cancelledAt || null,
  };
}

function mergeRegistrations(embeddedRegistrations, externalRegistrations) {
  const merged = new Map();

  [...externalRegistrations, ...embeddedRegistrations].forEach(
    (registration) => {
      const userId =
        registration.userId && registration.userId._id
          ? registration.userId._id.toString()
          : registration.userId?.toString();

      if (userId) {
        merged.set(userId, registration);
      }
    }
  );

  return Array.from(merged.values());
}

function buildRegistrationStats(registrations, capacity) {
  const registered = registrations.filter(
    (item) => item.status === "registered"
  ).length;

  const cancelled = registrations.filter(
    (item) => item.status === "cancelled"
  ).length;

  const attended = registrations.filter(
    (item) => item.status === "attended"
  ).length;

  return {
    totalRegistrations: registered,
    totalCancelled: cancelled,
    totalAttended: attended,
    capacity,
    remainingSlots:
      capacity === null || capacity === undefined
        ? null
        : Math.max(capacity - registered, 0),
  };
}

async function countActiveRegistrations(event) {
  const externalRegistrations = await getEventRegistrationCollection()
    .find({ eventId: toObjectId(event._id) })
    .project({ userId: 1, status: 1 })
    .toArray();

  const mergedStatuses = new Map();

  externalRegistrations.forEach((item) => {
    mergedStatuses.set(item.userId.toString(), item.status);
  });

  event.participants.forEach((item) => {
    mergedStatuses.set(item.userId.toString(), item.status);
  });

  return Array.from(mergedStatuses.values()).filter(
    (status) => status === "registered"
  ).length;
}

async function countUserUpcomingRegistrations(userId) {
  const userObjectId = toObjectId(userId);
  const registeredEventIds = new Set();

  const embeddedEvents = await Event.find({
    approvalStatus: "approved",
    status: "upcoming",
    "participants.userId": userObjectId,
    "participants.status": "registered",
  })
    .select("_id")
    .lean();

  embeddedEvents.forEach((event) => {
    registeredEventIds.add(event._id.toString());
  });

  const externalRegistrations = await getEventRegistrationCollection()
    .find({ userId: userObjectId, status: "registered" })
    .project({ eventId: 1 })
    .toArray();

  const externalEventIds = externalRegistrations.map((item) => item.eventId);

  if (externalEventIds.length) {
    const externalEvents = await Event.find({
      _id: { $in: externalEventIds },
      approvalStatus: "approved",
      status: "upcoming",
    })
      .select("_id")
      .lean();

    externalEvents.forEach((event) => {
      registeredEventIds.add(event._id.toString());
    });
  }

  return registeredEventIds.size;
}

async function findScheduleConflict(event) {
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);

  const currentPlaceKey = normalizeLocationKey(
    event.location,
    event.meetingLink
  );

  const candidates = await Event.find({
    _id: { $ne: event._id },
    approvalStatus: "approved",
    status: { $ne: "cancelled" },

    // Time overlap:
    // new start < old end
    // new end > old start
    startDateTime: { $lt: end },
    endDateTime: { $gt: start },
  }).populate("createdBy", "fullName email avatarUrl role");

  const conflictEvent = candidates.find((item) => {
    const itemPlaceKey = normalizeLocationKey(item.location, item.meetingLink);
    return itemPlaceKey === currentPlaceKey;
  });

  return conflictEvent || null;
}

function cleanPublicEvent(event) {
  const data = event.toObject ? event.toObject() : event;
  delete data.participants;
  return data;
}

/**
 * GET /api/events
 * Public: chỉ trả event đã approved
 */
async function getEvents(req, res) {
  try {
    const { eventType, page = 1, limit = 10, from, to } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {
      approvalStatus: "approved",
      status: { $ne: "cancelled" },
    };

    if (eventType) {
      query.eventType = eventType;
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

/**
 * GET /api/events/calendar
 * Public: lịch event đã approved
 */
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
      .select(
        "title description eventType startDateTime endDateTime location meetingLink capacity registeredCount status approvalStatus bannerImage"
      )
      .sort({ startDateTime: 1 })
      .lean();

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

/**
 * GET /api/events/:id
 * Public: chỉ xem event approved
 */
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

/**
 * POST /api/events
 * Owner tạo event -> approvalStatus = pending
 */
async function createEvent(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để tạo event.",
      });
    }

    if (!canCreateEvent(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ event organizer hoặc admin mới được tạo event.",
      });
    }

    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload, { isCreate: true });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const event = await Event.create({
      ...payload,
      locationKey: normalizeLocationKey(payload.location, payload.meetingLink),
      status: "upcoming",
      approvalStatus: "pending",
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null,
      lockAfterApproval: true,
      registeredCount: 0,
      participants: [],
      createdBy: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo event thành công. Event đang chờ admin duyệt.",
      data: event,
    });
  } catch (error) {
    console.error("createEvent error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể tạo event.",
    });
  }
}

/**
 * GET /api/events/me/created
 */
async function getMyEvents(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    const events = await Event.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate("approvedBy", "fullName email avatarUrl role");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event của tôi thành công.",
      data: events,
    });
  } catch (error) {
    console.error("getMyEvents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy event của tôi.",
    });
  }
}

/**
 * GET /api/events/me/created/:id
 */
async function getMyEventById(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
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
    })
      .populate("createdBy", "fullName email avatarUrl role")
      .populate("approvedBy", "fullName email avatarUrl role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event của bạn.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết event của tôi thành công.",
      data: event,
    });
  } catch (error) {
    console.error("getMyEventById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết event của tôi.",
    });
  }
}

/**
 * PATCH /api/events/:id
 */
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

    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa event này.",
      });
    }

    if (event.approvalStatus === "approved" && event.lockAfterApproval) {
      return res.status(400).json({
        success: false,
        message: "Event đã được admin duyệt nên không thể chỉnh sửa.",
      });
    }

    const payload = buildEventPayload(req.body);
    const validationError = validateEventPayload(payload, {
      currentEvent: event,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    Object.assign(event, payload);

    event.locationKey = normalizeLocationKey(event.location, event.meetingLink);

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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể cập nhật event.",
    });
  }
}

/**
 * DELETE /api/events/:id
 */
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

    if (event.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa event này.",
      });
    }

    if (event.approvalStatus === "approved" && event.lockAfterApproval) {
      return res.status(400).json({
        success: false,
        message: "Event đã được admin duyệt nên không thể xóa.",
      });
    }

    await Event.findByIdAndDelete(id);

    await getEventRegistrationCollection().deleteMany({
      eventId: toObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Xóa event thành công.",
      data: {
        eventId: event._id,
        title: event.title,
      },
    });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể xóa event.",
    });
  }
}

/**
 * GET /api/events/admin/pending
 */
async function getAdminPendingEvents(req, res) {
  try {
    const events = await Event.find({ approvalStatus: "pending" })
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email avatarUrl role");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event chờ duyệt thành công.",
      data: events,
    });
  } catch (error) {
    console.error("getAdminPendingEvents error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy event chờ duyệt.",
    });
  }
}

/**
 * GET /api/events/admin/all
 */
async function getAdminAllEvents(req, res) {
  try {
    const { approvalStatus, status, page = 1, limit = 20 } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (status) query.status = status;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("createdBy", "fullName email avatarUrl role")
        .populate("approvedBy", "fullName email avatarUrl role"),
      Event.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách event admin thành công.",
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
      message: error.message || "Không thể lấy danh sách event admin.",
    });
  }
}

/**
 * GET /api/events/admin/:id
 */
async function getAdminEventById(req, res) {
  try {
    const { id } = req.params;

    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được xem chi tiết event admin.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Event ID không hợp lệ.",
      });
    }

    const event = await Event.findById(id)
      .populate("createdBy", "fullName email avatarUrl role")
      .populate("approvedBy", "fullName email avatarUrl role");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết event admin thành công.",
      data: event,
    });
  } catch (error) {
    console.error("getAdminEventById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy chi tiết event admin.",
    });
  }
}

/**
 * PATCH /api/events/admin/:id/approve
 */
async function approveEvent(req, res) {
  try {
    const adminId = getCurrentUserId(req);
    const { id } = req.params;

    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được duyệt event.",
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

    if (event.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Event này đã được duyệt trước đó.",
      });
    }

    if (event.status === "cancelled" || event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Không thể duyệt event đã bị hủy hoặc đã hoàn thành.",
      });
    }

    if (!event.startDateTime || !event.endDateTime) {
      return res.status(400).json({
        success: false,
        message: "Event cần có thời gian bắt đầu và kết thúc trước khi duyệt.",
      });
    }

    if (new Date(event.endDateTime) <= new Date(event.startDateTime)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
      });
    }

    const conflictEvent = await findScheduleConflict(event);

    if (conflictEvent) {
      return res.status(409).json({
        success: false,
        message: "Không thể duyệt event vì trùng lịch tại cùng địa điểm.",
        conflictEvent: {
          _id: conflictEvent._id,
          title: conflictEvent.title,
          startDateTime: conflictEvent.startDateTime,
          endDateTime: conflictEvent.endDateTime,
          location: conflictEvent.location,
          meetingLink: conflictEvent.meetingLink,
          approvalStatus: conflictEvent.approvalStatus,
          status: conflictEvent.status,
        },
      });
    }

    event.locationKey = normalizeLocationKey(event.location, event.meetingLink);
    event.approvalStatus = "approved";
    event.approvedBy = adminId;
    event.approvedAt = new Date();
    event.rejectedReason = null;
    event.lockAfterApproval = true;

    await event.save();

    return res.status(200).json({
      success: true,
      message:
        "Duyệt event thành công. Event đã hiển thị cho mọi người đăng ký.",
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

/**
 * PATCH /api/events/admin/:id/reject
 */
async function rejectEvent(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isAdmin(req)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới được từ chối event.",
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

    if (event.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message:
          "Event đã được duyệt nên không thể reject. Hãy dùng cancelled nếu cần hủy.",
      });
    }

    event.approvalStatus = "rejected";
    event.rejectedReason =
      reason || "Event không phù hợp hoặc thiếu thông tin.";
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

/**
 * GET /api/events/:id/registrations
 */
async function getEventRegistrations(req, res) {
  try {
    const { id } = req.params;
    const { status = "all", page = 1, limit = 10 } = req.query;

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

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const event = await Event.findById(id)
      .populate(
        "participants.userId",
        "fullName email phone avatarUrl role status"
      )
      .select(
        "title startDateTime endDateTime status approvalStatus capacity registeredCount participants location meetingLink"
      );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy event.",
      });
    }

    const embeddedRegistrations = event.participants.map(
      normalizeEmbeddedRegistration
    );

    const externalRegistrations = await getExternalEventRegistrations(id);

    const allRegistrations = mergeRegistrations(
      embeddedRegistrations,
      externalRegistrations
    );

    const stats = buildRegistrationStats(allRegistrations, event.capacity);

    const registrations = allRegistrations
      .filter((item) => status === "all" || item.status === status)
      .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

    const paginatedRegistrations = registrations.slice(skip, skip + limitNumber);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách đăng ký event thành công.",
      data: {
        event: {
          _id: event._id,
          title: event.title,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          location: event.location,
          meetingLink: event.meetingLink,
          status: event.status,
          approvalStatus: event.approvalStatus,
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
    console.error("getEventRegistrations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách đăng ký.",
    });
  }
}

/**
 * GET /api/events/me/registered
 */
async function getRegisteredEvents(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { status = "registered", page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
      });
    }

    if (status !== "all" && !REGISTRATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đăng ký không hợp lệ.",
      });
    }

    const userObjectId = toObjectId(userId);
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const participantQuery = { userId: userObjectId };

    if (status !== "all") {
      participantQuery.status = status;
    }

    const externalFilter = { userId: userObjectId };

    if (status !== "all") {
      externalFilter.status = status;
    }

    const externalRegistrations = await getEventRegistrationCollection()
      .find(externalFilter)
      .toArray();

    const externalRegistrationMap = new Map(
      externalRegistrations.map((item) => [
        item.eventId.toString(),
        {
          userId: item.userId,
          status: item.status,
          registeredAt: item.registeredAt,
          cancelledAt: item.cancelledAt || null,
        },
      ])
    );

    const eventConditions = [
      {
        participants: {
          $elemMatch: participantQuery,
        },
      },
    ];

    if (externalRegistrations.length) {
      eventConditions.push({
        _id: { $in: externalRegistrations.map((item) => item.eventId) },
      });
    }

    const query = {
      approvalStatus: "approved",
      $or: eventConditions,
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
      const eventData = event.toObject();

      const embeddedRegistration = eventData.participants.find(
        (item) =>
          item.userId.toString() === userId.toString() &&
          (status === "all" || item.status === status)
      );

      const externalRegistration = externalRegistrationMap.get(
        eventData._id.toString()
      );

      const registration = embeddedRegistration || externalRegistration;

      delete eventData.participants;

      return {
        ...eventData,
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
      message: error.message || "Không thể lấy event đã đăng ký.",
    });
  }
}

/**
 * POST /api/events/:id/register
 */
async function registerEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
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

    if (event.status !== "upcoming" && event.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể đăng ký event đang hoặc sắp diễn ra.",
      });
    }

    if (new Date(event.endDateTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event đã kết thúc.",
      });
    }

    const externalRegistration =
      await getEventRegistrationCollection().findOne({
        eventId: toObjectId(event._id),
        userId: toObjectId(userId),
      });

    const existingParticipant = event.participants.find(
      (item) => item.userId.toString() === userId.toString()
    );

    if (
      existingParticipant?.status === "registered" ||
      externalRegistration?.status === "registered"
    ) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký event này rồi.",
      });
    }

    const activeCount = await countActiveRegistrations(event);

    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      activeCount >= event.capacity
    ) {
      return res.status(400).json({
        success: false,
        message: "Event đã đủ số lượng người tham gia.",
      });
    }

    const upcomingEventCount = await countUserUpcomingRegistrations(userId);

    if (upcomingEventCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể đăng ký tối đa 3 event cùng lúc.",
      });
    }

    if (existingParticipant) {
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

    await getEventRegistrationCollection().updateOne(
      {
        eventId: toObjectId(event._id),
        userId: toObjectId(userId),
      },
      {
        $set: {
          eventId: toObjectId(event._id),
          userId: toObjectId(userId),
          status: "registered",
          registeredAt: new Date(),
          cancelledAt: null,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    event.registeredCount = await countActiveRegistrations(event);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Đăng ký event thành công.",
      data: {
        eventId: event._id,
        title: event.title,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        meetingLink: event.meetingLink,
        registeredAt: new Date(),
        registeredCount: event.registeredCount,
      },
    });
  } catch (error) {
    console.error("registerEvent error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể đăng ký event.",
    });
  }
}

/**
 * POST /api/events/:id/cancel
 */
async function cancelRegistration(req, res) {
  try {
    const { id } = req.params;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập.",
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

    if (event.status === "completed" || event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đăng ký event đã kết thúc hoặc đã bị hủy.",
      });
    }

    const externalRegistration =
      await getEventRegistrationCollection().findOne({
        eventId: toObjectId(event._id),
        userId: toObjectId(userId),
      });

    const participant = event.participants.find(
      (item) => item.userId.toString() === userId.toString()
    );

    if (
      (!participant || participant.status !== "registered") &&
      (!externalRegistration || externalRegistration.status !== "registered")
    ) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa đăng ký event này.",
      });
    }

    if (participant) {
      participant.status = "cancelled";
      participant.cancelledAt = new Date();
    }

    await getEventRegistrationCollection().updateOne(
      {
        eventId: toObjectId(event._id),
        userId: toObjectId(userId),
      },
      {
        $set: {
          eventId: toObjectId(event._id),
          userId: toObjectId(userId),
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          registeredAt: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    event.registeredCount = await countActiveRegistrations(event);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Hủy đăng ký event thành công.",
      data: {
        eventId: event._id,
        title: event.title,
        registeredCount: event.registeredCount,
      },
    });
  } catch (error) {
    console.error("cancelRegistration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể hủy đăng ký event.",
    });
  }
}

module.exports = {
  getEvents,
  getEventCalendar,
  getEventById,

  createEvent,
  getMyEvents,
  getMyEventById,
  updateEvent,
  deleteEvent,

  getAdminPendingEvents,
  getAdminAllEvents,
  getAdminEventById,
  approveEvent,
  rejectEvent,

  getEventRegistrations,
  getRegisteredEvents,
  registerEvent,
  cancelRegistration,
};