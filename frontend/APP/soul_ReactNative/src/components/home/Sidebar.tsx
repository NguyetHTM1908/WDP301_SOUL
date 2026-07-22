import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

import { useAuthStore } from "@/store";

type SidebarProps = {
  onClose?: () => void;
};

export function Sidebar({ onClose }: SidebarProps) {
  const user = useAuthStore((state: any) => state.user);
  const userRole = String(user?.role || "").trim().toLowerCase();
  const homeRoute =
    userRole === "admin" || userRole === "administrator"
      ? "/(admin)"
      : userRole === "event_organizer" || userRole === "organizer" || userRole === "event-organizer"
      ? "/(organizer)"
      : "/(tabs)";

  const menuItems = [
    { icon: "home", label: "Trang chủ", route: homeRoute },
    { icon: "brain", label: "Bạn đồng hành AI" },
    { icon: "book-outline", label: "Nhật ký", route: "/diary" },
    { icon: "heart-pulse", label: "Kiểm tra cảm xúc", route: "/emotional-test" },
    { icon: "calendar-month-outline", label: "Sự kiện", route: "/user-events" },
    { icon: "chart-line", label: "Phân tích cảm xúc" },
    { icon: "emoticon-happy-outline", label: "Theo dõi tâm trạng" },
    { icon: "account-group-outline", label: "Cộng đồng", route: "/(tabs)/forum" },
    { icon: "cog-outline", label: "Cài đặt" },
    { icon: "help-circle-outline", label: "Trợ giúp & hỗ trợ" },
  ];

  const handleMenuPress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }

    onClose?.();
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="leaf" size={54} color="#4BC6AD" />

        <Text style={styles.logoText}>SOUL</Text>

        <TouchableOpacity onPress={onClose} activeOpacity={0.75}>
  <MaterialCommunityIcons name="close" size={28} color="#006B5C" />
</TouchableOpacity>
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.sideItem, index === 0 && styles.sideItemActive]}
          onPress={() => handleMenuPress(item.route)}
          activeOpacity={0.78}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color={index === 0 ? "#006B5C" : "#466986"}
          />

          <Text style={[styles.sideText, index === 0 && styles.sideTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.reminderCard}>
        <MaterialCommunityIcons name="sprout" size={62} color="#8BCF78" />

        <Text style={styles.reminderTitle}>Lời nhắc mỗi ngày</Text>

        <Text style={styles.reminderText}>
          Hít thở thật sâu. Bạn đang làm rất tốt rồi.
        </Text>
      </View>
    </View>
  );
}