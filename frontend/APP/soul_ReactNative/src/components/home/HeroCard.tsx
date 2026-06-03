import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function HeroCard() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>✨ Daily Insight</Text>
      </View>

      <Text style={styles.heroTitle}>
        You’re stronger{"\n"}than you think 💚
      </Text>

      <Text style={styles.heroDescription}>
        Small steps today,{"\n"}big change tomorrow.
      </Text>

      <TouchableOpacity style={styles.heroButton}>
        <Text style={styles.heroButtonText}>Start your journey</Text>

        <MaterialCommunityIcons
          name="arrow-right"
          size={22}
          color="#004C43"
        />
      </TouchableOpacity>

      <MaterialCommunityIcons
        name="flower-tulip-outline"
        size={230}
        color="rgba(255,255,255,0.28)"
        style={styles.heroDecor}
      />
    </View>
  );
}