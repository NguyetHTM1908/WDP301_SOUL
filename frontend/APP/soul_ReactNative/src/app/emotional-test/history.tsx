import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  deleteEmotionalTestResult,
  EmotionalTestHistoryItem,
  getMyEmotionalTestResults,
  PopulatedEmotionalTest,
  ResultLevel,
} from "../../api/emotionalTestApi";

import { useAuthStore } from "@/store";

const GREEN = "#2FBF71";
const GREEN_DARK = "#1F9D5C";
const GREEN_LIGHT = "#ECFFF4";
const TEXT_DARK = "#1D1B38";
const TEXT_MUTED = "#4E6B5A";
const RED = "#EF6A7A";

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
  if (level === "duoi_trung_binh") {
    return "Dưới trung bình";
  }

  if (level === "trung_binh") return "Trung bình";
  if (level === "tot") return "Tốt";
  if (level === "xuat_sac") return "Xuất sắc";

  return "Chưa xác định";
}

function getLevelStyle(level?: ResultLevel) {
  if (level === "rat_thap") {
    return {
      backgroundColor: "#FFF0F2",
      textColor: "#C33B4A",
    };
  }

  if (level === "duoi_trung_binh") {
    return {
      backgroundColor: "#FFF6DF",
      textColor: "#A36A12",
    };
  }

  if (level === "trung_binh") {
    return {
      backgroundColor: "#F3F8E9",
      textColor: "#6B7C27",
    };
  }

  if (level === "tot") {
    return {
      backgroundColor: "#EFFFF5",
      textColor: GREEN_DARK,
    };
  }

  if (level === "xuat_sac") {
    return {
      backgroundColor: "#EEF9FF",
      textColor: "#2683A5",
    };
  }

  return {
    backgroundColor: "#F3F5F4",
    textColor: TEXT_MUTED,
  };
}

function formatDate(value?: string) {
  if (!value) return "Không rõ thời gian";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không rõ thời gian";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(
    2,
    "0"
  );
  const minutes = String(date.getMinutes()).padStart(
    2,
    "0"
  );

  return `${day}/${month}/${year} • ${hours}:${minutes}`;
}

function getResultId(item: EmotionalTestHistoryItem) {
  return item.resultId || item._id;
}
function isPopulatedTest(
  value: EmotionalTestHistoryItem["testId"]
): value is PopulatedEmotionalTest {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value
  );
}

function getTestId(
  item: EmotionalTestHistoryItem
): string {
  if (typeof item.testId === "string") {
    return item.testId;
  }

  if (isPopulatedTest(item.testId)) {
    return item.testId._id;
  }

  return "";
}

function getTestTitle(
  item: EmotionalTestHistoryItem
): string {
  if (item.testTitle?.trim()) {
    return item.testTitle;
  }

  if (
    isPopulatedTest(item.testId) &&
    item.testId.title?.trim()
  ) {
    return item.testId.title;
  }

  return "Kiểm tra trí tuệ cảm xúc";
}

function getMaxScore(item: EmotionalTestHistoryItem) {
  if (
    typeof item.maxScore === "number" &&
    item.maxScore > 0
  ) {
    return item.maxScore;
  }

  if (
    Array.isArray(item.answers) &&
    item.answers.length > 0
  ) {
    return item.answers.length;
  }

  return 0;
}

export default function EmotionalTestHistoryScreen() {
  const user = useAuthStore((state: any) => state.user);

  const [results, setResults] = useState<
    EmotionalTestHistoryItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);

  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    const role = String(user?.role || "")
      .trim()
      .toLowerCase();

    if (
      role === "admin" ||
      role === "administrator"
    ) {
      router.replace("/(admin)" as any);
      return;
    }

    if (
      role === "event_organizer" ||
      role === "organizer" ||
      role === "event-organizer"
    ) {
      router.replace("/(organizer)" as any);
      return;
    }

    router.replace("/(tabs)" as any);
  };

  const loadHistory = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage(null);

        const data =
          await getMyEmotionalTestResults();

        setResults(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải lịch sử bài kiểm tra.";

        setErrorMessage(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const filteredResults = useMemo(() => {
    const keyword = searchText
      .trim()
      .toLowerCase();

    if (!keyword) {
      return results;
    }

    return results.filter((item) => {
      const searchableText = [
        getTestTitle(item),
        getLevelLabel(item.resultLevel),
        item.title || "",
        item.description || "",
        formatDate(
          item.completedAt || item.createdAt
        ),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [results, searchText]);

  const latestResult = results[0];

  function openResultDetail(
    item: EmotionalTestHistoryItem
  ) {
    const resultData = {
      ...item,
      testId: getTestId(item),
      testTitle: getTestTitle(item),
      maxScore: getMaxScore(item),
    };

    router.push({
      pathname: "/emotional-test/result" as any,
      params: {
        result: JSON.stringify(resultData),
      },
    });
  }

  function retakeTest(
    item: EmotionalTestHistoryItem
  ) {
    const testId = getTestId(item);

    router.push({
      pathname: "/emotional-test/assessment" as any,
      params: testId ? { testId } : {},
    });
  }

  async function handleDelete(
    item: EmotionalTestHistoryItem
  ) {
    const resultId = getResultId(item);

    try {
      setDeletingId(resultId);

      await deleteEmotionalTestResult(resultId);

      setResults((current) =>
        current.filter(
          (result) =>
            getResultId(result) !== resultId
        )
      );

      Alert.alert(
        "Đã xóa",
        "Kết quả bài kiểm tra đã được xóa khỏi lịch sử."
      );
    } catch (error) {
      Alert.alert(
        "Không thể xóa",
        error instanceof Error
          ? error.message
          : "Vui lòng thử lại."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(
    item: EmotionalTestHistoryItem
  ) {
    Alert.alert(
      "Xóa kết quả",
      `Bạn có chắc muốn xóa kết quả "${getTestTitle(
        item
      )}" không?\n\nHành động này không thể hoàn tác.`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => handleDelete(item),
        },
      ]
    );
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#DDFBE7", "#B9F5D0"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={GREEN}
        />

        <Text style={styles.loadingText}>
          Đang tải lịch sử bài test...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#DDFBE7", "#B9F5D0"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              tintColor={GREEN}
              colors={[GREEN]}
            />
          }
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>
                Lịch sử bài test
              </Text>

              <Text style={styles.headerSubtitle}>
                Xem lại quá trình của bạn
              </Text>
            </View>

            <View style={styles.totalPill}>
              <Text style={styles.totalNumber}>
                {results.length}
              </Text>

              <Text style={styles.totalLabel}>
                kết quả
              </Text>
            </View>
          </View>

          {latestResult && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconBox}>
                <Text style={styles.summaryEmoji}>
                  {getEmoji(
                    latestResult.resultLevel
                  )}
                </Text>
              </View>

              <View style={styles.summaryContent}>
                <Text style={styles.summaryLabel}>
                  Kết quả gần nhất
                </Text>

                <Text
                  style={styles.summaryTitle}
                  numberOfLines={1}
                >
                  {getTestTitle(latestResult)}
                </Text>

                <Text style={styles.summaryDate}>
                  {formatDate(
                    latestResult.completedAt ||
                      latestResult.createdAt
                  )}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.summaryButton}
                onPress={() =>
                  openResultDetail(latestResult)
                }
              >
                <Text
                  style={styles.summaryButtonText}
                >
                  Xem
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm theo tên hoặc kết quả..."
              placeholderTextColor="#6FAF83"
              style={styles.searchInput}
            />

            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText("")}
              >
                <Text style={styles.clearText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Các lần đã thực hiện
            </Text>

            <Text style={styles.sectionCount}>
              {filteredResults.length}
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorEmoji}>⚠️</Text>

              <Text style={styles.errorText}>
                {errorMessage}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadHistory()}
              >
                <Text style={styles.retryText}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!errorMessage &&
            filteredResults.length === 0 && (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <Text style={styles.emptyEmoji}>
                    📋
                  </Text>
                </View>

                <Text style={styles.emptyTitle}>
                  {results.length === 0
                    ? "Chưa có kết quả nào"
                    : "Không tìm thấy kết quả"}
                </Text>

                <Text style={styles.emptyDescription}>
                  {results.length === 0
                    ? "Sau khi hoàn thành bài kiểm tra, kết quả sẽ xuất hiện tại đây."
                    : "Hãy thử tìm kiếm bằng từ khóa khác."}
                </Text>

                {results.length === 0 && (
                  <TouchableOpacity
                    style={styles.startTestButton}
                    onPress={() =>
                      router.push(
                        "/emotional-test/assessment" as any
                      )
                    }
                  >
                    <Text
                      style={
                        styles.startTestButtonText
                      }
                    >
                      Làm bài test đầu tiên
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

          {!errorMessage &&
            filteredResults.map((item) => {
              const resultId = getResultId(item);
              const maxScore = getMaxScore(item);
              const levelStyle = getLevelStyle(
                item.resultLevel
              );

              const isDeleting =
                deletingId === resultId;

              return (
                <View
                  key={resultId}
                  style={styles.historyCard}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.resultEmojiBox}>
                      <Text style={styles.resultEmoji}>
                        {getEmoji(item.resultLevel)}
                      </Text>
                    </View>

                    <View style={styles.cardMain}>
                      <Text
                        style={styles.cardTestTitle}
                        numberOfLines={2}
                      >
                        {getTestTitle(item)}
                      </Text>

                      <Text style={styles.cardDate}>
                        {formatDate(
                          item.completedAt ||
                            item.createdAt
                        )}
                      </Text>
                    </View>

                    <View style={styles.scoreBox}>
                      <Text style={styles.scoreValue}>
                        {item.totalScore}
                      </Text>

                      <Text style={styles.scoreMax}>
                        /{maxScore || "?"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.resultInfoRow}>
                    <View
                      style={[
                        styles.levelPill,
                        {
                          backgroundColor:
                            levelStyle.backgroundColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          {
                            color:
                              levelStyle.textColor,
                          },
                        ]}
                      >
                        {getLevelLabel(
                          item.resultLevel
                        )}
                      </Text>
                    </View>

                    <Text
                      style={styles.resultSummary}
                      numberOfLines={1}
                    >
                      {item.title ||
                        "Kết quả bài kiểm tra cảm xúc"}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() =>
                        openResultDetail(item)
                      }
                    >
                      <Text
                        style={
                          styles.detailButtonIcon
                        }
                      >
                        ◉
                      </Text>

                      <Text
                        style={
                          styles.detailButtonText
                        }
                      >
                        Xem chi tiết
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.retakeButton}
                      onPress={() => retakeTest(item)}
                    >
                      <Text
                        style={
                          styles.retakeButtonText
                        }
                      >
                        Làm lại
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        isDeleting &&
                          styles.deleteButtonDisabled,
                      ]}
                      onPress={() =>
                        confirmDelete(item)
                      }
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator
                          size="small"
                          color={RED}
                        />
                      ) : (
                        <Text
                          style={
                            styles.deleteButtonText
                          }
                        >
                          🗑
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

          <TouchableOpacity
            style={styles.backToTestsButton}
            onPress={() =>
              router.push(
                "/emotional-test" as any
              )
            }
          >
            <Text
              style={styles.backToTestsButtonText}
            >
              Quay lại danh sách bài test
            </Text>
          </TouchableOpacity>

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
    paddingHorizontal: 20,
  },

  loadingContainer: {
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
    marginTop: 20,
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
    fontWeight: "800",
  },

  headerContent: {
    flex: 1,
    marginLeft: 14,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: TEXT_DARK,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#4E8C63",
  },

  totalPill: {
    minWidth: 62,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },

  totalNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: GREEN,
  },

  totalLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#6FAF83",
  },

  summaryCard: {
    marginTop: 22,
    minHeight: 94,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.82)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIconBox: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryEmoji: {
    fontSize: 31,
  },

  summaryContent: {
    flex: 1,
    marginLeft: 13,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: GREEN_DARK,
    textTransform: "uppercase",
  },

  summaryTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "900",
    color: TEXT_DARK,
  },

  summaryDate: {
    marginTop: 5,
    fontSize: 11,
    color: TEXT_MUTED,
  },

  summaryButton: {
    borderRadius: 18,
    backgroundColor: GREEN,
    paddingHorizontal: 17,
    paddingVertical: 10,
  },

  summaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },

  searchBox: {
    marginTop: 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.66)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchIcon: {
    color: GREEN_DARK,
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: "#2F6B48",
    fontSize: 13,
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  clearText: {
    color: "#6FAF83",
    fontSize: 20,
    lineHeight: 20,
  },

  sectionHeader: {
    marginTop: 21,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    color: TEXT_DARK,
  },

  sectionCount: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    color: GREEN_DARK,
    fontSize: 12,
    fontWeight: "900",
  },

  historyCard: {
    marginBottom: 14,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    padding: 15,
    shadowColor: GREEN,
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  resultEmojiBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  resultEmoji: {
    fontSize: 27,
  },

  cardMain: {
    flex: 1,
    marginLeft: 12,
  },

  cardTestTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: TEXT_DARK,
  },

  cardDate: {
    marginTop: 5,
    fontSize: 10,
    color: "#6FAF83",
  },

  scoreBox: {
    minWidth: 62,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "flex-end",
  },

  scoreValue: {
    fontSize: 25,
    fontWeight: "900",
    color: GREEN,
  },

  scoreMax: {
    fontSize: 12,
    fontWeight: "800",
    color: "#74A985",
  },

  cardDivider: {
    marginVertical: 13,
    height: 1,
    backgroundColor: "#EAF7EE",
  },

  resultInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },

  levelText: {
    fontSize: 11,
    fontWeight: "900",
  },

  resultSummary: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    color: TEXT_MUTED,
  },

  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },

  detailButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: GREEN,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  detailButtonIcon: {
    marginRight: 6,
    color: "#FFFFFF",
    fontSize: 11,
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  retakeButton: {
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  retakeButtonText: {
    color: GREEN_DARK,
    fontSize: 12,
    fontWeight: "900",
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF0F2",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonDisabled: {
    opacity: 0.55,
  },

  deleteButtonText: {
    fontSize: 17,
  },

  emptyCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.80)",
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: GREEN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 36,
  },

  emptyTitle: {
    marginTop: 17,
    fontSize: 18,
    fontWeight: "900",
    color: TEXT_DARK,
  },

  emptyDescription: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 19,
    color: TEXT_MUTED,
    textAlign: "center",
  },

  startTestButton: {
    marginTop: 19,
    height: 46,
    borderRadius: 23,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  startTestButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  errorCard: {
    borderRadius: 24,
    backgroundColor: "#FFF8E9",
    padding: 20,
    alignItems: "center",
  },

  errorEmoji: {
    fontSize: 30,
  },

  errorText: {
    marginTop: 9,
    color: "#855E1A",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 13,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 9,
  },

  retryText: {
    color: "#855E1A",
    fontSize: 12,
    fontWeight: "900",
  },

  backToTestsButton: {
    marginTop: 8,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.76)",
    justifyContent: "center",
    alignItems: "center",
  },

  backToTestsButtonText: {
    color: "#2F6B48",
    fontSize: 13,
    fontWeight: "900",
  },
  historyButton: {
  marginTop: 14,
  minHeight: 82,
  borderRadius: 24,
  backgroundColor: "#FFFFFF",
  padding: 12,
  flexDirection: "row",
  alignItems: "center",
  shadowColor: GREEN,
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 2,
},

historyIconBox: {
  width: 56,
  height: 56,
  borderRadius: 18,
  backgroundColor: "#EFFFF5",
  justifyContent: "center",
  alignItems: "center",
},

historyIcon: {
  fontSize: 27,
},

historyContent: {
  flex: 1,
  marginLeft: 13,
},

historyTitle: {
  fontSize: 15,
  fontWeight: "900",
  color: TEXT_DARK,
},

historyDescription: {
  marginTop: 5,
  fontSize: 11,
  lineHeight: 16,
  color: "#4E6B5A",
},

historyArrowBox: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#ECFFF4",
  justifyContent: "center",
  alignItems: "center",
},

historyArrow: {
  fontSize: 27,
  lineHeight: 28,
  color: GREEN,
  fontWeight: "700",
},
});