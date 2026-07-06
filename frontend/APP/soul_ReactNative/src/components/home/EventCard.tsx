import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function EventCard() {
  const openEvents = () => router.push("/user-events");

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Sự kiện sắp diễn ra</Text>
        <TouchableOpacity onPress={openEvents}>
          <Text style={styles.panelLink}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.communityWrap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>
            Workshop Chánh niệm & Thiền định
          </Text>
          <Text style={styles.eventMeta}>
            Xem lịch sự kiện mới nhất của SOUL
          </Text>
          <Text style={styles.eventMeta}>
            Hoạt động trực tuyến và tại trường
          </Text>

          <TouchableOpacity style={styles.joinButton} onPress={openEvents}>
            <Text style={styles.joinText}>Khám phá sự kiện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventImage}>
          <MaterialCommunityIcons name="meditation" size={92} color="#E58A1F" />
        </View>
      </View>
    </View>
  );
}