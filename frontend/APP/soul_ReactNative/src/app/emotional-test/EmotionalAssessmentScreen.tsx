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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  getEmotionalTestQuestions,
  submitEmotionalTest,
  EmotionalQuestion,
  EmotionalAnswer,
} from "../../api/emotionalTestApi";

const GREEN = "#2FBF71";
const GREEN_DARK = "#1F9D5C";
const GREEN_LIGHT = "#ECFFF4";
const TEXT_DARK = "#1D1B38";

export default function EmotionalAssessmentScreen() {
  const params = useLocalSearchParams();

  const testId = Array.isArray(params.testId)
    ? params.testId[0]
    : (params.testId as string | undefined);

  const [testTitle, setTestTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<EmotionalQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];

  const selectedAnswer = currentQuestion
    ? selectedAnswers[currentQuestion.questionIndex]
    : undefined;

  const isAnswered = Boolean(selectedAnswer);

  const progressText = questions.length
    ? `${currentIndex + 1}/${questions.length}`
    : "0/0";

  const progressPercent = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;

  const displayImage = useMemo(() => {
    if (!currentQuestion) return null;

    if (isAnswered && currentQuestion.answerImageUrl) {
      return currentQuestion.answerImageUrl;
    }

    return currentQuestion.imageUrl || null;
  }, [currentQuestion, isAnswered]);

  useEffect(() => {
    loadQuestions();
  }, [testId]);

  async function loadQuestions() {
    try {
      setLoading(true);
      setSelectedAnswers({});
      setCurrentIndex(0);

      const data = await getEmotionalTestQuestions(testId);

      setTestTitle(data.title);
      setDescription(data.description);
      setQuestions(data.questions);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(answer: string) {
    if (!currentQuestion || isAnswered) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionIndex]: answer,
    }));
  }

  async function submitFinalResult() {
    try {
      setSubmitting(true);

      const payload: EmotionalAnswer[] = questions.map((question) => ({
        questionIndex: question.questionIndex,
        answer: selectedAnswers[question.questionIndex],
      }));

      const result = await submitEmotionalTest(payload, testId);

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

  function handleNext() {
    if (!isAnswered) {
      Alert.alert("Chưa chọn đáp án", "Bạn hãy chọn một đáp án trước.");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    submitFinalResult();
  }

  function handleBackQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={["#DDFBE7", "#B9F5D0"]} style={styles.loadingBox}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Đang tải bài test...</Text>
      </LinearGradient>
    );
  }

  if (!currentQuestion) {
    return (
      <LinearGradient colors={["#DDFBE7", "#B9F5D0"]} style={styles.loadingBox}>
        <Text style={styles.loadingText}>Không có câu hỏi nào.</Text>
      </LinearGradient>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <LinearGradient colors={["#DDFBE7", "#B9F5D0"]} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Emotional Test</Text>

            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{progressText}</Text>
            </View>
          </View>

          <View style={styles.introCard}>
            <Text style={styles.testTitle}>{testTitle}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.progressBarOuter}>
              <View
                style={[styles.progressBarInner, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionNumberRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{currentIndex + 1}</Text>
              </View>

              <Text style={styles.questionLabel}>Câu hỏi</Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.imageCard}>
              {displayImage ? (
                <Image
                  source={{ uri: displayImage }}
                  style={styles.questionImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderEmoji}>🖼️</Text>
                  <Text style={styles.placeholderText}>Chưa có ảnh cho câu này</Text>
                </View>
              )}
            </View>

            <View style={styles.optionsBox}>
              {currentQuestion.options.map((option) => {
                const selected = selectedAnswer === option.label;
                const correct = currentQuestion.correctAnswer === option.label;

                const showCorrect = isAnswered && correct;
                const showWrong = isAnswered && selected && !correct;

                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.optionButton,
                      selected && styles.optionSelected,
                      showCorrect && styles.optionCorrect,
                      showWrong && styles.optionWrong,
                    ]}
                    onPress={() => selectAnswer(option.label)}
                    activeOpacity={0.85}
                    disabled={isAnswered}
                  >
                    <View
                      style={[
                        styles.optionRadio,
                        selected && styles.optionRadioSelected,
                        showCorrect && styles.radioCorrect,
                        showWrong && styles.radioWrong,
                      ]}
                    >
                      {selected && !isAnswered && <View style={styles.optionDot} />}
                      {showCorrect && <Text style={styles.optionIcon}>✓</Text>}
                      {showWrong && <Text style={styles.optionIcon}>✕</Text>}
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                        showCorrect && styles.correctText,
                        showWrong && styles.wrongText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isAnswered && (
              <View
                style={[
                  styles.explanationCard,
                  isCorrect ? styles.correctCard : styles.wrongCard,
                ]}
              >
                <Text style={styles.resultStatus}>
                  {isCorrect ? "Chính xác 🎉" : "Chưa chính xác"}
                </Text>

                <Text style={styles.correctAnswer}>
                  Đáp án đúng: {currentQuestion.correctAnswer}
                </Text>

                <Text style={styles.explanationText}>
                  {currentQuestion.explanation ||
                    "Không có giải thích cho câu hỏi này."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={handleBackQuestion}
              disabled={currentIndex === 0}
            >
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, !isAnswered && styles.nextDisabled]}
              onPress={handleNext}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextText}>
                  {currentIndex === questions.length - 1 ? "Xem kết quả" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

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
    paddingHorizontal: 20,
  },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#2F6B48",
    fontWeight: "800",
  },
  topBar: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 34,
    lineHeight: 34,
    color: GREEN,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
    color: TEXT_DARK,
  },
  progressPill: {
    minWidth: 46,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  progressText: {
    color: GREEN_DARK,
    fontSize: 12,
    fontWeight: "900",
  },
  introCard: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 26,
    padding: 18,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: TEXT_DARK,
  },
  description: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#4E6B5A",
  },
  progressBarOuter: {
    marginTop: 16,
    height: 9,
    borderRadius: 99,
    backgroundColor: "rgba(47,191,113,0.18)",
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: GREEN,
  },
  questionCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 18,
    shadowColor: GREEN,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  questionNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6BA67F",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_DARK,
    lineHeight: 25,
  },
  imageCard: {
    marginTop: 18,
    height: 250,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#EFFFF5",
  },
  questionImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderEmoji: {
    fontSize: 42,
  },
  placeholderText: {
    marginTop: 8,
    color: "#58986B",
    fontSize: 12,
    fontWeight: "700",
  },
  optionsBox: {
    marginTop: 18,
  },
  optionButton: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#F7FFF9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  optionCorrect: {
    borderColor: "#46B97A",
    backgroundColor: "#EFFFF5",
  },
  optionWrong: {
    borderColor: "#EF6A7A",
    backgroundColor: "#FFF0F2",
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#BFE8CD",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  optionRadioSelected: {
    borderColor: GREEN,
  },
  radioCorrect: {
    borderColor: "#46B97A",
    backgroundColor: "#46B97A",
  },
  radioWrong: {
    borderColor: "#EF6A7A",
    backgroundColor: "#EF6A7A",
  },
  optionDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  optionIcon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    position: "absolute",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: "#33463B",
    fontWeight: "700",
  },
  optionTextSelected: {
    color: GREEN_DARK,
  },
  correctText: {
    color: "#237A4E",
  },
  wrongText: {
    color: "#C33B4A",
  },
  explanationCard: {
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
  },
  correctCard: {
    backgroundColor: "#EFFFF5",
  },
  wrongCard: {
    backgroundColor: "#FFF0F2",
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT_DARK,
  },
  correctAnswer: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "900",
    color: GREEN_DARK,
  },
  explanationText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#4E6B5A",
  },
  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.45,
  },
  navButtonText: {
    color: GREEN_DARK,
    fontSize: 15,
    fontWeight: "900",
  },
  nextButton: {
    flex: 2,
    height: 54,
    borderRadius: 27,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  nextDisabled: {
    backgroundColor: "#A9E6BF",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});