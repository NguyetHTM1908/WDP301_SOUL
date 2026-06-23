import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  getEmotionalTestQuestions,
  submitEmotionalTest,
  EmotionalQuestion,
  AnswerOption,
  EmotionalAnswer,
  TestType,
} from "../../api/emotionalTestApi";
import { router, useLocalSearchParams } from "expo-router";
type Props = {
  route?: {
    params?: {
      testType?: TestType;
    };
  };
  navigation?: any;
};

export default function EmotionalAssessmentScreen({ navigation }: Props) {
  const params = useLocalSearchParams();

  const testType = Array.isArray(params.testType)
    ? (params.testType[0] as TestType)
    : ((params.testType as TestType) || "WHO5");

  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [questions, setQuestions] = useState<EmotionalQuestion[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [description, setDescription] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const totalAnswered = useMemo(() => Object.keys(answers).length, [answers]);

  useEffect(() => {
    loadQuestions();
  }, [testType]);

  async function loadQuestions() {
    try {
      setLoading(true);
      setAnswers({});

      const data = await getEmotionalTestQuestions(testType);

      setTitle(data.title);
      setSource(data.source);
      setQuestions(data.questions);
      setAnswerOptions(data.answerOptions);
      setDescription(data.description);
      setDisclaimer(data.disclaimer);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId: number, score: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  }

  async function handleSubmit() {
    if (totalAnswered !== questions.length) {
      Alert.alert("Chưa hoàn thành", "Bạn vui lòng trả lời đủ tất cả câu hỏi.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: EmotionalAnswer[] = questions.map((question) => ({
        questionId: question.id,
        score: answers[question.id],
      }));

      const result = await submitEmotionalTest(testType, payload);

      router.push({
  pathname: "/emotional-test/result" as any,
  params: {
    result: JSON.stringify(result),
  },
});
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể nộp bài kiểm tra.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#BFD7FF", "#D9C2FF"]} style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#BFD7FF", "#D9C2FF"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity
  style={styles.backButton}
        onPress={() => router.replace("/(tabs)" as any)}
>
  <Text style={styles.backText}>‹</Text>
</TouchableOpacity>

            <Text style={styles.title}>{title}</Text>

            <View style={{ width: 38 }} />
          </View>

          <View style={styles.heroBox}>
            <Text style={styles.heroIcon}>
              {testType === "WHO5" ? "🧘‍♀️" : "📘"}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIconCircle}>
                <Text style={styles.infoIcon}>i</Text>
              </View>
              <Text style={styles.infoTitle}>HOW TO PROCEED</Text>
            </View>

            <Text style={styles.infoText}>{description}</Text>

            <Text style={styles.sourceText}>{source}</Text>

            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>

          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View
                  style={[
                    styles.numberBox,
                    index % 3 === 1 && styles.numberBoxBlue,
                    index % 3 === 2 && styles.numberBoxOrange,
                  ]}
                >
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>

                <Text style={styles.questionText}>{question.text}</Text>
              </View>

              {question.reverseScore && (
                <Text style={styles.reverseNote}>
                  Câu này được đảo điểm khi tính kết quả.
                </Text>
              )}

              <View style={styles.optionsBox}>
                {answerOptions.map((option) => {
                  const selected = answers[question.id] === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.optionRow}
                      onPress={() => selectAnswer(question.id, option.value)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.radio,
                          selected && styles.radioSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioDot} />}
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.submitButton,
              totalAnswered !== questions.length && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>
                Submit Result ({totalAnswered}/{questions.length})
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 70 }} />
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
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#4B4774",
    fontWeight: "700",
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
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
    color: "#121027",
  },
  heroBox: {
    alignItems: "center",
    justifyContent: "center",
    height: 130,
  },
  heroIcon: {
    fontSize: 82,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#B891F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoIcon: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#1D1B38",
  },
  infoText: {
    fontSize: 12,
    color: "#34304F",
    lineHeight: 19,
  },
  sourceText: {
    marginTop: 10,
    fontSize: 11,
    color: "#6F62D8",
    fontWeight: "800",
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 11,
    color: "#8A85A8",
    lineHeight: 17,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  numberBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "#FFC7DE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberBoxBlue: {
    backgroundColor: "#CAD8FF",
  },
  numberBoxOrange: {
    backgroundColor: "#FFE0B5",
  },
  numberText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: "#1D1B38",
    lineHeight: 18,
  },
  reverseNote: {
    marginBottom: 10,
    fontSize: 11,
    color: "#9B7DF5",
    fontWeight: "700",
  },
  optionsBox: {
    marginTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  radio: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#F1CFE0",
    marginRight: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#B891F6",
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#B891F6",
  },
  optionText: {
    fontSize: 12,
    color: "#36314E",
    flex: 1,
  },
  optionTextSelected: {
    color: "#6F62D8",
    fontWeight: "800",
  },
  submitButton: {
    marginTop: 8,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#9B7DF5",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#C7BAEF",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});