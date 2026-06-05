export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
export type RegistrationStatus = "registered" | "cancelled";

export type EventRegistration = {
  status: RegistrationStatus;
  registeredAt?: string;
  cancelledAt?: string | null;
};

export type EventRegistrationMap = Record<string, EventRegistration>;

export const eventStatusMeta: Record<
  EventStatus,
  { label: string; bg: string; color: string }
> = {
  upcoming: { label: "Upcoming", bg: "#D1FAE5", color: "#047857" },
  ongoing: { label: "Ongoing", bg: "#DBEAFE", color: "#2563EB" },
  completed: { label: "Completed", bg: "#E5E7EB", color: "#4B5563" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#DC2626" },
};

export const registrationMeta: Record<
  RegistrationStatus,
  { label: string; bg: string; color: string }
> = {
  registered: { label: "Registered", bg: "#D1FAE5", color: "#047857" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#DC2626" },
};

export const buildRegistrationMap = <
  T extends { _id: string; registration?: EventRegistration }
>(
  events: T[]
): EventRegistrationMap =>
  events.reduce<EventRegistrationMap>((map, event) => {
    if (event.registration?.status) {
      map[event._id] = event.registration;
    }

    return map;
  }, {});

export const getRemainingSlots = (
  capacity?: number | null,
  registeredCount = 0
) => {
  if (capacity === null || capacity === undefined) {
    return null;
  }

  return Math.max(capacity - registeredCount, 0);
};

export const getFillRate = (
  capacity?: number | null,
  registeredCount = 0
) => {
  if (!capacity || capacity <= 0) {
    return 0;
  }

  return Math.min(Math.round((registeredCount / capacity) * 100), 100);
};

export const getComputedEventStatus = (event: {
  status?: EventStatus;
  startDateTime?: string | Date | null;
  endDateTime?: string | Date | null;
}): EventStatus => {
  if (event.status === "cancelled") {
    return "cancelled";
  }

  const now = Date.now();
  const startTime = event.startDateTime
    ? new Date(event.startDateTime).getTime()
    : NaN;
  const endTime = event.endDateTime
    ? new Date(event.endDateTime).getTime()
    : NaN;

  if (!Number.isNaN(endTime) && now > endTime) {
    return "completed";
  }

  if (!Number.isNaN(startTime) && now < startTime) {
    return "upcoming";
  }

  return "ongoing";
};

export const isEventFull = (
  capacity?: number | null,
  registeredCount = 0
) => {
  const remainingSlots = getRemainingSlots(capacity, registeredCount);
  return remainingSlots !== null && remainingSlots <= 0;
};
