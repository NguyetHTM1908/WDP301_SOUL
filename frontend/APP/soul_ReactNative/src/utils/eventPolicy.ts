const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function formatEventDateTime(value?: string | Date | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Thời gian không hợp lệ";
  }

  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getHoursUntilEvent(startDateTime?: string | Date | null) {
  if (!startDateTime) return 0;

  const start = new Date(startDateTime);

  if (Number.isNaN(start.getTime())) return 0;

  const diffMs = start.getTime() - Date.now();

  return Math.floor(diffMs / (60 * 60 * 1000));
}

export function canCancelRegistration(event: {
  startDateTime?: string | Date | null;
}) {
  if (!event.startDateTime) return false;

  const start = new Date(event.startDateTime);

  if (Number.isNaN(start.getTime())) return false;

  const diffMs = start.getTime() - Date.now();

  return diffMs > ONE_DAY_MS;
}

export function getCancelDeadlineText(event: {
  startDateTime?: string | Date | null;
}) {
  if (!event.startDateTime) return "Không xác định";

  const start = new Date(event.startDateTime);

  if (Number.isNaN(start.getTime())) return "Không xác định";

  const deadline = new Date(start.getTime() - ONE_DAY_MS);

  return formatEventDateTime(deadline);
}

export function getEventModeLabel(event: {
  eventMode?: string | null;
  meetingLink?: string | null;
}) {
  if (event.eventMode === "online") return "Online";
  if (event.eventMode === "offline") return "Offline";

  return event.meetingLink ? "Online" : "Offline";
}

export function getEventPlaceText(event: {
  eventMode?: string | null;
  location?: string | null;
  meetingLink?: string | null;
}) {
  const mode = getEventModeLabel(event);

  if (mode === "Online") {
    return event.meetingLink || "Chưa có link Zoom/Meet";
  }

  return event.location || "Chưa có địa điểm";
}

export function getFillRate(
  capacity?: number | string | null,
  registeredCount?: number | string | null
) {
  const capacityNumber = Number(capacity || 0);
  const registeredNumber = Number(registeredCount || 0);

  if (!capacityNumber || capacityNumber <= 0) return 0;

  const rate = Math.round((registeredNumber / capacityNumber) * 100);

  if (rate < 0) return 0;
  if (rate > 100) return 100;

  return rate;
}

export function getRemainingSlots(
  capacity?: number | string | null,
  registeredCount?: number | string | null
) {
  if (capacity === null || capacity === undefined || capacity === "") {
    return null;
  }

  const capacityNumber = Number(capacity);
  const registeredNumber = Number(registeredCount || 0);

  if (!Number.isFinite(capacityNumber) || capacityNumber <= 0) {
    return null;
  }

  return Math.max(capacityNumber - registeredNumber, 0);
}

export function isEventFull(
  capacity?: number | string | null,
  registeredCount?: number | string | null
) {
  const remainingSlots = getRemainingSlots(capacity, registeredCount);

  if (remainingSlots === null) {
    return false;
  }

  return remainingSlots <= 0;
}

export function getComputedEventStatus(event: {
  status?: string | null;
  startDateTime?: string | Date | null;
  endDateTime?: string | Date | null;
}) {
  if (event.status === "cancelled") return "cancelled";

  const now = new Date();
  const start = event.startDateTime ? new Date(event.startDateTime) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return event.status || "upcoming";
  }

  if (!end || Number.isNaN(end.getTime())) {
    return now < start ? "upcoming" : "ongoing";
  }

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";

  return "completed";
}

export function canRegisterEvent(event: {
  approvalStatus?: string | null;
  status?: string | null;
  startDateTime?: string | Date | null;
  endDateTime?: string | Date | null;
  capacity?: number | string | null;
  registeredCount?: number | string | null;
}) {
  if (event.approvalStatus !== "approved") return false;

  const status = getComputedEventStatus(event);

  if (status !== "upcoming" && status !== "ongoing") return false;

  if (isEventFull(event.capacity, event.registeredCount)) return false;

  return true;
}