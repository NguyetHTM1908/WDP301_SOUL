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
import { EmotionalTestResult } from "../../api/emotionalTestApi";

function getEmoji(result?: EmotionalTestResult) {
  if (!result) return "🌿";

  if (result.testType === "PSS10") {
    if (result.level === "low_stress") return "🌱";
    if (result.level === "moderate_stress") return "🌤️";
    return "🌧️";
  }

  if (result.level === "good") return "🌞";
  if (result.level === "moderate") return "🌤️";
  return "🌧️";
}

function getResultMessage(result?: EmotionalTestResult) {
  if (!result) {
    return "Kết quả giúp bạn tự nhìn lại trạng thái cảm xúc hiện tại.";
  }

  if (result.testType === "PSS10") {
    if (result.level === "low_stress") {
      return "Mức căng thẳng của bạn hiện đang tương đối thấp.";
    }

    if (result.level === "moderate_stress") {
      return "Bạn có thể đang gặp một mức căng thẳng nhất định trong học tập hoặc cuộc sống.";
    }

    return "Bạn có thể đang chịu khá nhiều áp lực và nên quan tâm hơn đến việc nghỉ ngơi, giảm tải.";
  }

  if (result.level === "good") {
    return "Gần đây bạn đang có trạng thái cảm xúc khá tích cực.";
  }

  if (result.level === "moderate") {
    return "Bạn có thể đang có một vài dấu hiệu mệt mỏi hoặc căng thẳng.";
  }

  return "Bạn có thể đang cần quan tâm hơn đến cảm xúc và sức khỏe tinh thần của mình.";
}

function getScoreLabel(result?: EmotionalTestResult) {
  if (!result) return "Score";

  if (result.testType === "PSS10") {
    return `${result.rawScore}/40`;
  }

  return `${result.percentageScore}/100`;
}

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

export default function EmotionalResultScreen() {
  const params = useLocalSearchParams();

  const result = useMemo(() => {
    return parseResultParam(params.result);
  }, [params.result]);

  return (
    <LinearGradient colors={["#BFD7FF", "#D9C2FF"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Your Result</Text>

            <View style={{ width: 38 }} />
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.emoji}>{getEmoji(result)}</Text>

            <Text style={styles.testTitle}>
              {result?.testTitle || "Emotional Check"}
            </Text>

            <Text style={styles.score}>{getScoreLabel(result)}</Text>

            <Text style={styles.levelLabel}>
              {result?.levelLabel || "Emotional well-being"}
            </Text>

            <Text style={styles.message}>{getResultMessage(result)}</Text>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.cardTitle}>Gợi ý cho bạn</Text>
            <Text style={styles.cardText}>
              {result?.suggestion ||
                "Hãy dành một chút thời gian nghỉ ngơi, hít thở sâu hoặc viết nhật ký cảm xúc."}
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Lưu ý an toàn</Text>
            <Text style={styles.warningText}>
              {result?.disclaimer ||
                "Kết quả này chỉ nhằm hỗ trợ bạn tự nhìn lại trạng thái cảm xúc, không phải chẩn đoán y khoa hoặc thay thế chuyên gia tâm lý."}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/ai-chat" as any)}
          >
            <Text style={styles.primaryButtonText}>Talk with SOUL AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/diary" as any)}
          >
            <Text style={styles.secondaryButtonText}>Write emotional diary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push("/emotional-test" as any)}
          >
            <Text style={styles.homeButtonText}>Back to Tests</Text>
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
    color: "#6F62D8",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#121027",
  },
  resultCard: {
    marginTop: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 28,
    alignItems: "center",
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1D1B38",
    textAlign: "center",
    marginBottom: 8,
  },
  score: {
    fontSize: 44,
    fontWeight: "900",
    color: "#6F62D8",
  },
  levelLabel: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "900",
    color: "#1D1B38",
    textAlign: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 13,
    color: "#6F6A91",
    textAlign: "center",
    lineHeight: 20,
  },
  suggestionCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  warningCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 24,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1D1B38",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 13,
    color: "#5C577C",
    lineHeight: 20,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1D1B38",
    marginBottom: 10,
  },
  warningText: {
    fontSize: 12,
    color: "#6F6A91",
    lineHeight: 19,
  },
  primaryButton: {
    marginTop: 22,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#9B7DF5",
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
    color: "#7B61FF",
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
    color: "#4F4A73",
    fontSize: 14,
    fontWeight: "800",
  },
});