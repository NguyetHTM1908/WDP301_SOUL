import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function requestPermission() {
  if (Platform.OS === "web") return false;

  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();

  return requested.granted;
}

export async function scheduleEventReminder(event: {
  _id?: string;
  title?: string;
  startDateTime?: string | Date | null;
  location?: string | null;
  meetingLink?: string | null;
  eventMode?: string | null;
}) {
  try {
    if (Platform.OS === "web") return null;
    if (!event.startDateTime) return null;

    const start = new Date(event.startDateTime);

    if (Number.isNaN(start.getTime())) return null;

    const reminderAt = new Date(start.getTime() - ONE_DAY_MS);

    const secondsUntilReminder = Math.floor(
      (reminderAt.getTime() - Date.now()) / 1000
    );

    if (secondsUntilReminder <= 0) {
      return null;
    }

    const granted = await requestPermission();

    if (!granted) return null;

    const place =
      event.eventMode === "online"
        ? event.meetingLink || "Link meeting trong app"
        : event.location || "Địa điểm trong app";

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Nhắc lịch sự kiện SOUL",
        body: `Sự kiện "${
          event.title || "SOUL Event"
        }" sẽ diễn ra sau 24 giờ. ${place}`,
        data: {
          eventId: event._id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilReminder,
        repeats: false,
      },
    });

    return notificationId;
  } catch (error) {
    console.log("scheduleEventReminder error:", error);
    return null;
  }
}