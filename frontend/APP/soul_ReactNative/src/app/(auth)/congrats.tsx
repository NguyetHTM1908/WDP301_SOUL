import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { authStyles as styles } from "@/styles/auth.styles";

export default function CongratulationsScreen() {
  
  // Điều hướng quay lại màn hình Login khi nhấn "Start now"
  const handleStartNow = () => {
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.congratsContainer}>
      <View style={styles.congratsCard}>
        {/* Biểu tượng chứng nhận / chúc mừng tốt nghiệp giống hình vẽ */}
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "#E6F4EA",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 30,
            borderWidth: 2,
            borderColor: "#A7F3D0",
            borderStyle: "dashed",
          }}
        >
          <MaterialCommunityIcons name="school-outline" size={80} color="#26A98F" />
        </View>

        {/* Tiêu đề Chúc mừng */}
        <Text style={styles.congratsTitle}>Congratulations</Text>
        
        {/* Chú thích hướng dẫn */}
        <Text style={styles.congratsSubText}>
          Your password has been changed. Please log in again with new password
        </Text>

        {/* Nút bắt đầu ngay (quay lại login) */}
        <TouchableOpacity 
          style={[styles.buttonLarge, { width: "100%", marginTop: 0 }]} 
          onPress={handleStartNow}
        >
          <Text style={styles.buttonLargeText}>Start now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
