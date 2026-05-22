import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function MoodAnalytics() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>📊 Mood Overview</Text>
        <Text style={styles.panelLink}>This Week⌄</Text>
      </View>

      <View style={styles.chartRow}>
        {[82, 52, 78, 83, 54, 31, 66].map((h, i) => (
          <View key={i} style={styles.chartItem}>
            <Text style={styles.emoji}>{h > 65 ? "😊" : h > 45 ? "😐" : "🙁"}</Text>
            <View style={[styles.chartBar, { height: h }]} />
            <Text style={styles.day}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.noteBox}>
        <MaterialCommunityIcons name="leaf" size={38} color="#52B788" />
        <Text style={styles.noteText}>
          Your emotions are valid.{"\n"}Every feeling is a step to healing.
        </Text>
      </View>
    </View>
  );
}