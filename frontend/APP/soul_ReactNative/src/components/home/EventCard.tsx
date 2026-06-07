import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function EventCard() {
  const openEvents = () => router.push("/user-events");

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Upcoming Event</Text>
        <TouchableOpacity onPress={openEvents}>
          <Text style={styles.panelLink}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.communityWrap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>Mindfulness & Meditation Workshop</Text>
          <Text style={styles.eventMeta}>View the latest SOUL event schedule</Text>
          <Text style={styles.eventMeta}>Online and campus activities</Text>

          <TouchableOpacity style={styles.joinButton} onPress={openEvents}>
            <Text style={styles.joinText}>Browse Events</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventImage}>
          <MaterialCommunityIcons name="meditation" size={92} color="#E58A1F" />
        </View>
      </View>
    </View>
  );
}
