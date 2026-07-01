const mongoose = require("mongoose");
const Event = require("../../models/Event");

const EVENT_TYPES = ["workshop", "talkshow", "webinar", "community_event"];
const EVENT_MODES = ["online", "offline"];
const REGISTRATION_STATUSES = ["registered", "cancelled", "attended"];
const ADMIN_REGISTRATION_FILTERS = ["all", ...REGISTRATION_STATUSES];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

function getCurrentUserId(req) {
  return req.user?._id || req.user?.id || req.userId || null;
}

function getCurrentUserRole(req) {
  return req.user?.role || null;
}

function isAdmin(req) {
  return getCurrentUserRole(req) === "admin";
}

function isEventOrganizer(req) {
  return getCurrentUserRole(req) === "event_organizer";
}

function canCreateEvent(req) {
  return isEventOrganizer(req);
}

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const text = String(value).trim();

  return text ? text : null;
}

function normalizeLocationKey(location, meetingLink, eventMode) {
  if (eventMode === "online") {
    return meetingLink && String(meetingLink).trim()
      ? `online:${String(meetingLink).trim().toLowerCase()}`
      : "online";
  }

  return location && String(location).trim()
    ? `offline:${String(location).trim().toLowerCase().replace(/\s+/g, " ")}`
    : "offline";
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
    "eventMode",
    "startDateTime",
    "endDateTime",
    "location",
    "meetingLink",
    "capacity",
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  [
    "title",
    "description",
    "speakerName",
    "organizerName",
    "contactEmail",
    "bannerImage",
    "location",
    "meetingLink",
  ].forEach((field) => {
    if (payload[field] !== undefined) {
      payload[field] = normalizeOptionalString(payload[field]);
    }
  });

  if (payload.eventMode !== undefined && payload.eventMode !== null) {
    payload.eventMode = String(payload.eventMode).trim();
  }

  if (payload.eventType !== undefined && payload.eventType !== null) {
    payload.eventType = String(payload.eventType).trim();
  }

  if (
    payload.capacity !== undefined &&
    payload.capacity !== null &&
    payload.capacity !== ""
  ) {
    payload.capacity = Number(payload.capacity);
  } else if (payload.capacity === "") {
    payload.capacity = null;
  }

  return payload;
}

function validateEventPayload(payload, currentEvent = null) {
  const title =
    payload.title !== undefined ? payload.title : currentEvent?.title;

  const startDateTime =
    payload.startDateTime !== undefined
      ? payload.startDateTime
      : currentEvent?.startDateTime;

  const endDateTime =
    payload.endDateTime !== undefined
      ? payload.endDateTime
      : currentEvent?.endDateTime;

  const eventType =
    payload.eventType !== undefined
      ? payload.eventType
      : currentEvent?.eventType;

  const eventMode =
    payload.eventMode !== undefined
      ? payload.eventMode
      : currentEvent?.eventMode || "offline";

  const location =
    payload.location !== undefined ? payload.location : currentEvent?.location;

  const meetingLink =
    payload.meetingLink !== undefined
      ? payload.meetingLink
      : currentEvent?.meetingLink;

  const capacity =
    payload.capacity !== undefined ? payload.capacity : currentEvent?.capacity;

  if (!title || !String(title).trim()) {
    return "Tiêu đề event không được để trống.";
  }

  if (eventType && !EVENT_TYPES.includes(eventType)) {
    return "Loại event không hợp lệ.";
  }

  if (!EVENT_MODES.includes(eventMode)) {
    return "Hình thức event không hợp lệ.";
  }

  if (eventMode === "online" && !meetingLink) {
    return "Event online bắt buộc phải có link Zoom/Meet.";
  }

  if (eventMode === "offline" && !location) {
    return "Event offline bắt buộc phải ghi rõ địa điểm.";
  }

  if (!startDateTime) {
    return "Vui lòng nhập thời gian bắt đầu.";
  }

  if (!endDateTime) {
    return "Vui lòng nhập thời gian kết thúc.";
  }

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (Number.isNaN(start.getTime())) {
    return "Thời gian bắt đầu không hợp lệ.";
  }

  if (Number.isNaN(end.getTime())) {
    return "Thời gian kết thúc không hợp lệ.";
  }

  if (end <= start) {
    return "Thời gian kết thúc phải sau thời gian bắt đầu.";
  }

  if (capacity !== null && capacity !== undefined) {
    const capacityNumber = Number(capacity);

    if (!Number.isInteger(capacityNumber) || capacityNumber < 1) {
      return "Sức chứa phải là số nguyên lớn hơn 0.";
    }
  }

  return null;
}

function cleanPublicEvent(event) {
  const data = event.toObject ? event.toObject() : { ...event };

  delete data.participants;

  return data;
}

function getParticipant(event, userId) {
  return event.participants.find(
    (participant) => participant.userId.toString() === userId.toString()
  );
}

function countActiveParticipants(event) {
  return event.participants.filter(
    (participant) => participant.status === "registered"
  ).length;
}

function syncRegisteredCount(event) {
  event.registeredCount = countActiveParticipants(event);
}

function buildRegistrationStats(event) {
  const totalRegistered = event.participants.filter(
    (item) => item.status === "registered"
  ).length;

  const totalCancelled = event.participants.filter(
    (item) => item.status === "cancelled"
  ).length;

  const totalAttended = event.participants.filter(
    (item) => item.status === "attended"
  ).length;

  const capacity = event.capacity ?? null;

  const remainingSlots =
    capacity === null ? null : Math.max(capacity - totalRegistered, 0);

  return {
    totalRegistrations: totalRegistered,
    totalCancelled,
    totalAttended,
    capacity,
    remainingSlots,
  };
}

async function countUserUpcomingRegistrations(userId) {
  const now = new Date();

  const events = await Event.find({
    approvalStatus: "approved",
    status: { $in: ["upcoming", "ongoing"] },
    endDateTime: { $gt: now },
    participants: {
      $elemMatch: {
        userId: toObjectId(userId),
        status: "registered",
      },
    },
  })
    .select("_id")
    .lean();

  return events.length;
}

async function findScheduleConflict(event) {
  const start = new Date(event.startDateTime);
  const end = new Date(event.endDateTime);

  const currentPlaceKey = normalizeLocationKey(
    event.location,
    event.meetingLink,
    event.eventMode
  );

  const candidates = await Event.find({
    _id: { $ne: event._id },
    approvalStatus: "approved",
    status: { $ne: "cancelled" },
    startDateTime: { $lt: end },
    endDateTime: { $gt: start },
  }).populate("createdBy", "fullName email avatarUrl role");

  const conflictEvent = candidates.find((item) => {
    const itemPlaceKey = normalizeLocationKey(
      item.location,
      item.meetingLink,
      item.eventMode
    );

    return itemPlaceKey === currentPlaceKey;
  });

  return conflictEvent || null;
}

function canCancelBefore24Hours(event) {
  const now = new Date();
  const start = new Date(event.startDateTime);
  const diffMs = start.getTime() - now.getTime();

  return diffMs > ONE_DAY_MS;
}

module.exports = {
  EVENT_TYPES,
  EVENT_MODES,
  REGISTRATION_STATUSES,
  ADMIN_REGISTRATION_FILTERS,
  ONE_DAY_MS,

  isValidObjectId,
  toObjectId,
  getCurrentUserId,
  getCurrentUserRole,
  isAdmin,
  isEventOrganizer,
  canCreateEvent,

  normalizeOptionalString,
  normalizeLocationKey,
  buildEventPayload,
  validateEventPayload,
  cleanPublicEvent,

  getParticipant,
  countActiveParticipants,
  syncRegisteredCount,
  buildRegistrationStats,
  countUserUpcomingRegistrations,
  findScheduleConflict,
  canCancelBefore24Hours,
};