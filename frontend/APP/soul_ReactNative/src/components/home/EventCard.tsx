import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function EventCard() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>🗓 Upcoming Event</Text>
        <Text style={styles.panelLink}>See all</Text>
      </View>

      <View style={styles.communityWrap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>Mindfulness & Meditation Workshop</Text>
          <Text style={styles.eventMeta}>📅 May 25, 2025 · 7:00 PM</Text>
          <Text style={styles.eventMeta}>📍 Online Session</Text>

          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinText}>Join Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventImage}>
          <MaterialCommunityIcons name="meditation" size={92} color="#E58A1F" />
        </View>
      </View>
    </View>
  );
}