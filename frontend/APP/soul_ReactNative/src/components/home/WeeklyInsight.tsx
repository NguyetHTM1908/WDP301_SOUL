import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function WeeklyInsight() {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>✨ Gợi ý hôm nay</Text>

      <View style={styles.centerBox}>
        <MaterialCommunityIcons name="meditation" size={150} color="#2A9D8F" />

        <Text style={styles.suggestionText}>
          Dành 5 phút để hít thở{"\n"}và thư giãn tâm trí.
        </Text>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Bắt đầu ngay ▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}