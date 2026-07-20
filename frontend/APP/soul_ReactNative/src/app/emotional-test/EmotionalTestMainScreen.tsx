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
import { TestType } from "../../api/emotionalTestApi";
import { router } from "expo-router";

type Props = {
  navigation?: any;
};

export default function EmotionalTestMainScreen({ navigation }: Props) {
  const goToAssessment = (testType: TestType) => {
    router.push({
      pathname: "/emotional-test/assessment" as any,
      params: { testType },
    });
  };

  const goHome = () => {
    router.replace("/home" as any);
  };

  return (
    <LinearGradient colors={["#BFD7FF", "#D9C2FF"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backHomeButton} onPress={goHome}>
              <Text style={styles.backHomeText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🧘</Text>
            </View>

            <View style={styles.headerTextBox}>
              <Text style={styles.hello}>Hello, user</Text>
              <Text style={styles.subHello}>How are you today?</Text>
            </View>

            <TouchableOpacity style={styles.bell}>
              <Text style={styles.bellText}>🔔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkInCard}>
            <View>
              <Text style={styles.checkTitle}>Daily check-in</Text>
              <Text style={styles.checkSub}>How are you today?</Text>
            </View>

            <View style={styles.moodRow}>
              {[
                { icon: "😄", label: "Great" },
                { icon: "🙂", label: "Good" },
                { icon: "😐", label: "Okay" },
                { icon: "😟", label: "Bad" },
                { icon: "😣", label: "Awful" },
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
              <Text style={styles.featureTitle}>WHO-5 Well-being Check</Text>
              <Text style={styles.featureDescription}>
                Hiểu nhanh trạng thái cảm xúc và well-being của bạn gần đây.
              </Text>

              <View style={styles.featureInfoRow}>
                <Text style={styles.featureInfo}>5-7 phút</Text>
                <Text style={styles.featureInfo}>5 câu hỏi</Text>
              </View>
            </View>

            <View style={styles.featureRight}>
              <Text style={styles.featureIllustration}>💜</Text>
              <TouchableOpacity
                style={styles.featureButton}
                onPress={() => goToAssessment("WHO5")}
              >
                <Text style={styles.featureButtonText}>Start Test</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Test</Text>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                placeholder="Search test, topic, keyword..."
                placeholderTextColor="#FFFFFF"
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>☷</Text>
            </TouchableOpacity>
          </View>

          <TestOptionCard
            icon="🌿"
            title="WHO-5 Well-being Check"
            description="Đánh giá nhanh mức độ well-being và trạng thái cảm xúc gần đây."
            duration="5-7m"
            onPress={() => goToAssessment("WHO5")}
          />

          <TestOptionCard
            icon="📘"
            title="PSS-10 Student Stress Check"
            description="Tự nhìn lại mức độ căng thẳng trong học tập và cuộc sống."
            duration="5-10m"
            onPress={() => goToAssessment("PSS10")}
          />

          <TestOptionCard
            icon="☁️"
            title="Anxiety Reflection"
            description="Tự nhìn lại các dấu hiệu lo lắng và căng thẳng cảm xúc."
            duration="3-4m"
            disabled
          />

          <TestOptionCard
            icon="🔥"
            title="Burnout Reflection"
            description="Nhận diện dấu hiệu kiệt sức học tập và mệt mỏi kéo dài."
            duration="5-10m"
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
    color: "#6F62D8",
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
    color: "#1D1B38",
  },
  subHello: {
    fontSize: 13,
    color: "#7B78A5",
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
    color: "#1D1B38",
    fontSize: 13,
  },
  checkSub: {
    fontSize: 11,
    color: "#9A96B8",
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
    color: "#77739C",
    marginTop: 2,
  },
  featureCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    minHeight: 132,
  },
  featureLeft: {
    flex: 1,
  },
  featureTitle: {
    color: "#1D1B38",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  featureDescription: {
    color: "#504C73",
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
    color: "#1D1B38",
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
    backgroundColor: "#B891F6",
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
    color: "#262346",
    marginRight: 14,
  },
  searchBox: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
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
    color: "#8B7BF4",
    fontSize: 18,
  },
  supportCard: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  supportIcon: {
    fontSize: 44,
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1D1B38",
  },
  supportSub: {
    marginTop: 6,
    fontSize: 11,
    color: "#8A85A8",
    lineHeight: 15,
  },
  supportButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  supportButtonText: {
    color: "#6F62D8",
    fontSize: 12,
    fontWeight: "800",
  },
});