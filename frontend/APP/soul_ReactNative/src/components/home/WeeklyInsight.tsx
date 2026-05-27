import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function WeeklyInsight() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{"✨ Today's Suggestion"}</Text>

      <View style={styles.centerBox}>
        <MaterialCommunityIcons name="meditation" size={150} color="#2A9D8F" />

        <Text style={styles.suggestionText}>
          Take 5 minutes to breathe{"\n"}and relax your mind.
        </Text>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Now ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}