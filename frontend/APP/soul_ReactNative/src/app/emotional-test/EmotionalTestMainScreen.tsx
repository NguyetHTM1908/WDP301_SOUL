import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import TestOptionCard from "../../components/emotional-test/TestOptionCard";
import { router } from "expo-router";

const GREEN = "#2FBF71";
const GREEN_DARK = "#1F9D5C";
const TEXT_DARK = "#1D1B38";

type Props = {
  navigation?: any;
};

export default function EmotionalTestMainScreen({ navigation }: Props) {
  const goToAssessment = (testId?: string) => {
    router.push({
      pathname: "/emotional-test/assessment" as any,
      params: testId ? { testId } : {},
    });
  };

  return (
    <LinearGradient colors={["#DDFBE7", "#B9F5D0"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backHomeButton}
              onPress={() => router.replace("/(tabs)" as any)}
            >
              <Text style={styles.backHomeText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🌿</Text>
            </View>

            <View style={styles.headerTextBox}>
              <Text style={styles.hello}>Xin chào, bạn</Text>
              <Text style={styles.subHello}>Hôm nay bạn cảm thấy thế nào?</Text>
            </View>

            <TouchableOpacity style={styles.bell}>
              <Text style={styles.bellText}>🔔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkInCard}>
            <View>
              <Text style={styles.checkTitle}>Kiểm tra cảm xúc hằng ngày</Text>
              <Text style={styles.checkSub}>Hôm nay bạn cảm thấy thế nào?</Text>
            </View>

            <View style={styles.moodRow}>
              {[
                { icon: "😄", label: "Rất tốt" },
                { icon: "🙂", label: "Ổn" },
                { icon: "😐", label: "Bình thường" },
                { icon: "😟", label: "Không tốt" },
                { icon: "😣", label: "Rất tệ" },
              ].map((item) => (
                <View key={item.label} style={styles.moodItem}>
                  <Text style={styles.moodIcon}>{item.icon}</Text>
                  <Text style={styles.moodLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureTitle}>Kiểm tra trí tuệ cảm xúc</Text>
              <Text style={styles.featureDescription}>
                Luyện khả năng nhận diện cảm xúc qua biểu cảm khuôn mặt.
              </Text>

              <View style={styles.featureInfoRow}>
                <Text style={styles.featureInfo}>5-7 phút</Text>
                <Text style={styles.featureInfo}>20 câu hỏi</Text>
              </View>
            </View>

            <View style={styles.featureRight}>
              <Text style={styles.featureIllustration}>😊</Text>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => goToAssessment()}
              >
                <Text style={styles.featureButtonText}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài kiểm tra</Text>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                placeholder="Tìm bài kiểm tra, chủ đề, từ khóa..."
                placeholderTextColor="#6FAF83"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>☷</Text>
            </TouchableOpacity>
          </View>

          <TestOptionCard
            icon="😊"
            title="Kiểm tra trí tuệ cảm xúc"
            description="Nhận diện cảm xúc qua khuôn mặt và xem khả năng đọc cảm xúc của bạn."
            duration="5-7 phút"
            onPress={() => goToAssessment()}
          />

          <TestOptionCard
            icon="🌱"
            title="Tự nhìn lại sức khỏe tinh thần"
            description="Tự nhìn lại trạng thái cảm xúc và mức độ cân bằng tinh thần."
            duration="5 phút"
            disabled
          />

          <TestOptionCard
            icon="☁️"
            title="Tự nhìn lại mức độ lo lắng"
            description="Tự nhìn lại các dấu hiệu lo lắng và căng thẳng cảm xúc."
            duration="3-4 phút"
            disabled
          />

          <TestOptionCard
            icon="🔥"
            title="Tự nhìn lại tình trạng kiệt sức"
            description="Nhận diện dấu hiệu kiệt sức học tập và mệt mỏi kéo dài."
            duration="5-10 phút"
            disabled
          />

          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 22,
  },
  header: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  backHomeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backHomeText: {
    fontSize: 32,
    lineHeight: 34,
    color: GREEN,
    fontWeight: "800",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
  },
  headerTextBox: {
    flex: 1,
    marginLeft: 14,
  },
  hello: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  subHello: {
    fontSize: 13,
    color: "#4E8C63",
    marginTop: 2,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  bellText: {
    fontSize: 20,
  },
  checkInCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkTitle: {
    fontWeight: "800",
    color: TEXT_DARK,
    fontSize: 13,
  },
  checkSub: {
    fontSize: 11,
    color: "#6FAF83",
    marginTop: 3,
  },
  moodRow: {
    flexDirection: "row",
    gap: 8,
  },
  moodItem: {
    alignItems: "center",
  },
  moodIcon: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 9,
    color: "#4E8C63",
    marginTop: 2,
  },
  featureCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    minHeight: 132,
  },
  featureLeft: {
    flex: 1,
  },
  featureTitle: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  featureDescription: {
    color: "#4E6B5A",
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 165,
  },
  featureInfoRow: {
    flexDirection: "row",
    gap: 26,
    marginTop: 16,
  },
  featureInfo: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: "700",
  },
  featureRight: {
    width: 120,
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureIllustration: {
    fontSize: 52,
  },
  featureButton: {
    backgroundColor: GREEN,
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  featureButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: TEXT_DARK,
    marginRight: 14,
  },
  searchBox: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.55)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: GREEN_DARK,
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: "#2F6B48",
    fontSize: 12,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  filterText: {
    color: GREEN,
    fontSize: 18,
  },
});