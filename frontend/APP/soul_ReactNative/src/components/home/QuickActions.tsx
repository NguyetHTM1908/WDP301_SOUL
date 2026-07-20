import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

const features = [
  ["brain", "AI Companion", "Emotion-aware chat", "#D8F8EC", "#009688", "/ai-chat"],
  ["book-outline", "Diary", "Private reflection", "#DFF1FF", "#2196F3", ""],
  [
    "head-heart-outline",
    "Emotional Test",
    "Check your state",
    "#E1F9E8",
    "#2BC56D",
    "/emotional-test",
  ],
  ["calendar-month-outline", "Events", "Healing workshop", "#FFF1E2", "#FF7A00", ""],
];

export function QuickActions() {
  return (
    <View style={styles.featureGrid}>
      {features.map(([icon, title, sub, bg, color, route]) => (
        <TouchableOpacity
          key={title}
          style={[styles.featureCard, { backgroundColor: bg }]}
          onPress={() => {
            if (route) router.push(route as any);
          }}
        >
          <View style={styles.featureIcon}>
            <MaterialCommunityIcons name={icon as any} size={34} color={color} />
          </View>

          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSub}>{sub}</Text>

          <View style={styles.arrowCircle}>
            <MaterialCommunityIcons name="arrow-right" size={24} color={color} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}