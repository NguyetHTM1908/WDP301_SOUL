export type ComputedEventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

type EventLike = {
  status?: string | null;
  startDateTime?: string | Date | null;
  endDateTime?: string | Date | null;
};

export function getFillRate(
  capacity?: number | string | null,
  registeredCount?: number | string | null
) {
  const capacityNumber = Number(capacity || 0);
  const registeredNumber = Number(registeredCount || 0);

  if (!capacityNumber || capacityNumber <= 0) {
    return 0;
  }

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

export function getComputedEventStatus(event: EventLike): ComputedEventStatus {
  if (event.status === "cancelled") {
    return "cancelled";
  }

  const now = new Date();

  const start = event.startDateTime ? new Date(event.startDateTime) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return (event.status as ComputedEventStatus) || "upcoming";
  }

  if (!end || Number.isNaN(end.getTime())) {
    if (now < start) return "upcoming";
    return (event.status as ComputedEventStatus) || "ongoing";
  }

  if (now < start) {
    return "upcoming";
  }

  if (now >= start && now <= end) {
    return "ongoing";
  }

  return "completed";
}

export function canRegisterEvent(event: EventLike & {
  approvalStatus?: string | null;
  capacity?: number | string | null;
  registeredCount?: number | string | null;
}) {
  if (event.approvalStatus !== "approved") {
    return false;
  }

  const status = getComputedEventStatus(event);

  if (status !== "upcoming" && status !== "ongoing") {
    return false;
  }

  if (isEventFull(event.capacity, event.registeredCount)) {
    return false;
  }

  return true;
}

export function formatEventDateTime(value?: string | Date | null) {
  if (!value) {
    return "Chưa cập nhật";
  }

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