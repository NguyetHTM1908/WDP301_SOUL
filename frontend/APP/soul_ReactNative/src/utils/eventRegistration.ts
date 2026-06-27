export function getFillRate(capacity?: number | null, registeredCount?: number) {
  if (!capacity || capacity <= 0) return 0;

  const value = Math.round(((registeredCount || 0) / capacity) * 100);

  return Math.min(Math.max(value, 0), 100);
}

export function getComputedEventStatus(event: any) {
  if (!event) return "upcoming";

  if (event.status === "cancelled") return "cancelled";
  if (event.status === "completed") return "completed";

  const now = new Date();
  const start = event.startDateTime ? new Date(event.startDateTime) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;

  if (end && end <= now) return "completed";
  if (start && end && start <= now && now < end) return "ongoing";

  return "upcoming";
}