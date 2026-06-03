import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function CommunityPreview() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>👥 Community Highlight</Text>
        <Text style={styles.panelLink}>See all</Text>
      </View>

      <View style={styles.communityWrap}>
        <View style={{ flex: 1 }}>
          <View style={styles.userRow}>
            <Image
              source={{ uri: "https://i.pravatar.cc/100?img=32" }}
              style={styles.smallAvatar}
            />
            <View>
              <Text style={styles.userName}>
                Linh Phạm <Text style={styles.newTag}>New</Text>
              </Text>
              <Text style={styles.time}>2h ago</Text>
            </View>
          </View>

          <Text style={styles.postText}>
            Grateful for a new day and a fresh start. Let’s be kind to ourselves today 💚
          </Text>

          <View style={styles.reactRow}>
            <Text style={styles.reactText}>❤️ 24</Text>
            <Text style={styles.reactText}>💬 6</Text>
          </View>
        </View>

        <View style={styles.illustrationBox}>
          <MaterialCommunityIcons name="account-group" size={92} color="#2A9D8F" />
        </View>
      </View>
    </View>
  );
}