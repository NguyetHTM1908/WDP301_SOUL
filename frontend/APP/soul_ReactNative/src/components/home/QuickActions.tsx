import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";

function normalizeRole(role?: string) {
  return String(role || "").trim().toLowerCase();
}

function isAdminRole(role?: string) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "administrator";
}

function isEventOrganizerRole(role?: string) {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === "event_organizer" ||
    normalizedRole === "event-organizer" ||
    normalizedRole === "eventorganizer" ||
    normalizedRole === "organizer"
  );
}

export function QuickActions() {
  const user = useAuthStore((state: any) => state.user);

  const isAdmin = isAdminRole(user?.role);
  const isEventOrganizer = isEventOrganizerRole(user?.role);

  const eventRoute = isAdmin
    ? "/(admin)/events"
    : isEventOrganizer
    ? "/(organizer)/events"
    : "/user-events";

  const eventTitle = isAdmin
    ? "Quản lý sự kiện"
    : isEventOrganizer
    ? "Event của tôi"
    : "Sự kiện";

  const eventSub = isAdmin
    ? "Duyệt event"
    : isEventOrganizer
    ? "Event & người tham dự"
    : "Workshop chữa lành";

  const eventIcon = isAdmin
    ? "shield-check"
    : isEventOrganizer
    ? "calendar-star"
    : "calendar-month-outline";

  const features = [
    {
      icon: "brain",
      title: "Bạn đồng hành AI",
      sub: "Trò chuyện thấu hiểu cảm xúc",
      bg: "#D8F8EC",
      color: "#009688",
      route: "/ai-chat",
    },
    {
      icon: "book-outline",
      title: "Nhật ký",
      sub: "Ghi lại cảm xúc riêng tư",
      bg: "#DFF1FF",
      color: "#2196F3",
      route: "/diary",
    },
    {
      icon: "head-heart-outline",
      title: "Kiểm tra cảm xúc",
      sub: "Theo dõi trạng thái của bạn",
      bg: "#E1F9E8",
      color: "#2BC56D",
      route: "/emotional-test",
    },
    {
      icon: eventIcon,
      title: eventTitle,
      sub: eventSub,
      bg: "#FFF1E2",
      color: "#FF7A00",
      route: eventRoute,
    },
  ];

  return (
    <View style={styles.featureGrid}>
      {features.map((feature) => (
        <TouchableOpacity
          key={feature.title}
          style={[styles.featureCard, { backgroundColor: feature.bg }]}
          onPress={() => router.push(feature.route as any)}
          activeOpacity={0.78}
        >
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons
              name={feature.icon as any}
              size={34}
              color={feature.color}
            />
          </View>

          <Text style={styles.featureTitle}>{feature.title}</Text>
          <Text style={styles.featureSub}>{feature.sub}</Text>

          <View style={styles.arrowCircle}>
            <MaterialCommunityIcons
              name="arrow-right"
              size={24}
              color={feature.color}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}