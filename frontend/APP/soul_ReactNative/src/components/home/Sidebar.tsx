import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

const menuItems = [
  { icon: "home", label: "Home", route: "/" },
  { icon: "brain", label: "AI Companion" },
  { icon: "book-outline", label: "Diary", route: "/diary" },
  { icon: "heart-pulse", label: "Emotional Test", route: "/emotional-test" },
  { icon: "calendar-month-outline", label: "Events", route: "/user-events" },
  { icon: "chart-line", label: "Insights" },
  { icon: "emoticon-happy-outline", label: "Mood Tracker" },
  { icon: "account-group-outline", label: "Community", route: "/forum" },
  { icon: "cog-outline", label: "Settings" },
  { icon: "help-circle-outline", label: "Help & Support" },
];

export function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBox}>
        <MaterialCommunityIcons name="leaf" size={54} color="#4BC6AD" />

        <Text style={styles.logoText}>SOUL</Text>
      </View>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.sideItem, index === 0 && styles.sideItemActive]}
          onPress={() => item.route && router.push(item.route as any)}
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

        <Text style={styles.reminderTitle}>Daily reminder</Text>

        <Text style={styles.reminderText}>
          Take a deep breath. You are doing great.
        </Text>
      </View>
    </View>
  );
}
