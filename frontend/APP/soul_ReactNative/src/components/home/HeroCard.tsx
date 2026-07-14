import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

export function HeroCard() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>✨ Gợi ý hôm nay</Text>
      </View>

      <Text style={styles.heroTitle}>
        Bạn mạnh mẽ hơn{"\n"}bạn nghĩ 💚
      </Text>

      <Text style={styles.heroDescription}>
        Từng bước nhỏ hôm nay,{"\n"}tạo nên thay đổi lớn ngày mai.
      </Text>

      <TouchableOpacity style={styles.heroButton}>
        <Text style={styles.heroButtonText}>Bắt đầu hành trình</Text>

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