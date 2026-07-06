import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function MoodAnalytics() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>📊 Tổng quan cảm xúc</Text>
        <Text style={styles.panelLink}>Tuần này⌄</Text>
      </View>

      <View style={styles.chartRow}>
        {[82, 52, 78, 83, 54, 31, 66].map((h, i) => (
          <View key={i} style={styles.chartItem}>
            <Text style={styles.emoji}>
              {h > 65 ? "😊" : h > 45 ? "😐" : "🙁"}
            </Text>

            <View style={[styles.chartBar, { height: h }]} />

            <Text style={styles.day}>
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.noteBox}>
        <MaterialCommunityIcons name="leaf" size={38} color="#52B788" />

        <Text style={styles.noteText}>
          Mọi cảm xúc của bạn đều đáng được lắng nghe.{"\n"}
          Mỗi cảm xúc là một bước trên hành trình chữa lành.
        </Text>
      </View>
    </View>
  );
}