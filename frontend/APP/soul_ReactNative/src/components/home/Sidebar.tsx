import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

const menuItems = [
  ["home", "Home"],
  ["brain", "AI Companion"],
  ["book-outline", "Diary"],
  ["heart-pulse", "Emotional Test"],
  ["calendar-month-outline", "Events"],
  ["chart-line", "Insights"],
  ["emoticon-happy-outline", "Mood Tracker"],
  ["account-group-outline", "Community"],
  ["cog-outline", "Settings"],
  ["help-circle-outline", "Help & Support"],
];

export function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoBox}>
        <MaterialCommunityIcons
          name="leaf"
          size={54}
          color="#4BC6AD"
        />

        <Text style={styles.logoText}>SOUL</Text>
      </View>

      {menuItems.map(([icon, label], index) => (
        <TouchableOpacity
          key={label}
          style={[
            styles.sideItem,
            index === 0 && styles.sideItemActive,
          ]}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={24}
            color={
              index === 0
                ? "#006B5C"
                : "#466986"
            }
          />

          <Text
            style={[
              styles.sideText,
              index === 0 && styles.sideTextActive,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.reminderCard}>
        <MaterialCommunityIcons
          name="sprout"
          size={62}
          color="#8BCF78"
        />

        <Text style={styles.reminderTitle}>
          Daily reminder
        </Text>

        <Text style={styles.reminderText}>
          Take a deep breath. You’re doing great 💚
        </Text>
      </View>
    </View>
  );
}