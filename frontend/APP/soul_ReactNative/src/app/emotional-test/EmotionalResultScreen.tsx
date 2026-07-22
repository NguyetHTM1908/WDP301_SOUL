import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { EmotionalTestResult, ResultLevel } from "../../api/emotionalTestApi";

const GREEN = "#2FBF71";
const GREEN_DARK = "#1F9D5C";
const TEXT_DARK = "#1D1B38";

function parseResultParam(resultParam: string | string[] | undefined) {
  try {
    if (!resultParam) return undefined;

    const value = Array.isArray(resultParam) ? resultParam[0] : resultParam;

    if (!value) return undefined;

    return JSON.parse(value) as EmotionalTestResult;
  } catch (error) {
    console.log("Cannot parse emotional test result:", error);
    return undefined;
  }
}

function getEmoji(level?: ResultLevel) {
  if (level === "rat_thap") return "🌧️";
  if (level === "duoi_trung_binh") return "🌥️";
  if (level === "trung_binh") return "🌤️";
  if (level === "tot") return "🌞";
  if (level === "xuat_sac") return "✨";
  return "🌿";
}

function getLevelLabel(level?: ResultLevel) {
  if (level === "rat_thap") return "Rất thấp";
  if (level === "duoi_trung_binh") return "Dưới trung bình";
  if (level === "trung_binh") return "Trung bình";
  if (level === "tot") return "Tốt";
  if (level === "xuat_sac") return "Xuất sắc";
  return "Kết quả";
}

export default function EmotionalResultScreen() {
  const params = useLocalSearchParams();

  const result = useMemo(() => {
    return parseResultParam(params.result);
  }, [params.result]);

  return (
    <LinearGradient colors={["#DDFBE7", "#B9F5D0"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/(tabs)" as any)}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Kết quả của bạn</Text>

            <View style={{ width: 38 }} />
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.emoji}>{getEmoji(result?.resultLevel)}</Text>

            <Text style={styles.testTitle}>
              {result?.testTitle || "Kiểm tra trí tuệ cảm xúc"}
            </Text>

            <Text style={styles.score}>
              {result ? `${result.totalScore}/${result.maxScore}` : "0/20"}
            </Text>

            <Text style={styles.levelLabel}>
              {getLevelLabel(result?.resultLevel)}
            </Text>

            <Text style={styles.resultTitle}>
              {result?.title ||
                "Kết quả giúp bạn tự nhìn lại khả năng đọc cảm xúc."}
            </Text>

            <Text style={styles.message}>
              {result?.description ||
                "Bài test này chỉ mang tính tham khảo và giúp bạn luyện khả năng nhận diện cảm xúc qua nét mặt."}
            </Text>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.cardTitle}>Gợi ý cho bạn</Text>
            <Text style={styles.cardText}>
              {result?.suggestion ||
                "Hãy luyện quan sát nét mặt, ánh mắt, lông mày và biểu cảm miệng để cải thiện khả năng nhận diện cảm xúc."}
            </Text>
          </View>

          <View style={styles.adviceCard}>
            <Text style={styles.cardTitle}>Lời khuyên</Text>
            <Text style={styles.cardText}>
              {result?.advice ||
                "Khi giao tiếp, đừng chỉ nhìn vào nét mặt. Hãy kết hợp với giọng nói, ngữ cảnh và cách người đó phản hồi."}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/emotional-test/assessment" as any)}
          >
            <Text style={styles.primaryButtonText}>Làm lại bài test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/ai-chat" as any)}
          >
            <Text style={styles.secondaryButtonText}>Trò chuyện với SOUL AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push("/emotional-test" as any)}
          >
            <Text style={styles.homeButtonText}>Quay lại danh sách test</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
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
  topBar: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 34,
    lineHeight: 34,
    color: GREEN,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_DARK,
  },
  resultCard: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 26,
    alignItems: "center",
    shadowColor: GREEN,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  emoji: {
    fontSize: 74,
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  score: {
    fontSize: 46,
    fontWeight: "900",
    color: GREEN,
  },
  levelLabel: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "900",
    color: TEXT_DARK,
    textAlign: "center",
  },
  resultTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_DARK,
    textAlign: "center",
    lineHeight: 22,
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    color: "#4E6B5A",
    textAlign: "center",
    lineHeight: 20,
  },
  suggestionCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  adviceCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 13,
    color: "#4E6B5A",
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 22,
    height: 54,
    borderRadius: 27,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: GREEN_DARK,
    fontSize: 15,
    fontWeight: "900",
  },
  homeButton: {
    marginTop: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  homeButtonText: {
    color: "#2F6B48",
    fontSize: 14,
    fontWeight: "800",
  },
});