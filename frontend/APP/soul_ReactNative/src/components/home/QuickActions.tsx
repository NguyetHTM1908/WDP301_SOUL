import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

const features = [
  {
    icon: "brain",
    title: "AI Companion",
    sub: "Emotion-aware chat",
    bg: "#D8F8EC",
    color: "#009688",
  },
  {
    icon: "book-outline",
    title: "Diary",
    sub: "Private reflection",
    bg: "#DFF1FF",
    color: "#2196F3",
    route: "/diary",
  },
  {
    icon: "head-heart-outline",
    title: "Emotional Test",
    sub: "Check your state",
    bg: "#E1F9E8",
    color: "#2BC56D",
    route :  "/emotional-test",
  },
  {
    icon: "calendar-month-outline",
    title: "Events",
    sub: "Healing workshop",
    bg: "#FFF1E2",
    color: "#FF7A00",
    route: "/user-events",
  },
];

export function QuickActions() {
  return (
    <View style={styles.featureGrid}>
      {features.map((feature) => (
        <TouchableOpacity
          key={feature.title}
          style={[styles.featureCard, { backgroundColor: feature.bg }]}
          onPress={() => feature.route && router.push(feature.route as any)}
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
