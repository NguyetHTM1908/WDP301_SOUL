import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { diaryStyles as s } from "@/styles/diary.styles";

type DiaryDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  diary: any | null;
  getMoodInfo: (mood?: string) => any;
  getRiskLabel: (risk?: string | null) => string;
  getSentimentText: (sentiment?: string | null) => string;
  formatDate: (value?: string) => string;
  formatTime: (value?: string) => string;
};

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  visible,
  onClose,
  diary,
  getMoodInfo,
  getRiskLabel,
  getSentimentText,
  formatDate,
  formatTime,
}) => {
  if (!diary) return null;

  const moodInfo = getMoodInfo(diary.mood);
  const insight = diary.aiInsight || {};
  const risk = insight.riskLevel;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={s.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[s.modalBox, { maxHeight: "88%", width: "100%" }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={s.modalHandle} />

          <Pressable style={s.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#1F332F" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text
              style={[
                s.modalTitle,
                { fontSize: 24, textAlign: "left", marginTop: 10 },
              ]}
            >
              Chi tiết nhật ký ngày
            </Text>
            <Text
              style={[
                s.diaryDate,
                { fontSize: 14, marginTop: 4, marginBottom: 20 },
              ]}
            >
              {formatDate(diary.createdAt)} • {formatTime(diary.createdAt)}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <View
                style={[
                  s.moodCircle,
                  { backgroundColor: moodInfo.color + "15" },
                ]}
              >
                <Text style={s.moodCircleText}>{moodInfo.emoji}</Text>
              </View>
              <View>
                <Text style={[s.diaryMood, { fontSize: 19 }]}>
                  {moodInfo.label}
                </Text>
                <Text
                  style={[
                    s.scoreValue,
                    { fontSize: 13, color: "#60706C", marginTop: 2 },
                  ]}
                >
                  Mood score: {diary.moodScore || 0}/10
                </Text>
              </View>
            </View>

            <View
              style={[
                s.scoreBar,
                { height: 8, marginBottom: 20, width: "100%" },
              ]}
            >
              <View
                style={[
                  s.scoreBarFill,
                  {
                    width: `${Math.min(Math.max(diary.moodScore || 1, 1), 10) * 10}%`,
                    backgroundColor: moodInfo.color,
                  },
                ]}
              />
            </View>

            <Text style={[s.sectionLabel, { marginTop: 10, fontSize: 16 }]}>
              Nội dung nhật ký
            </Text>
            <View
              style={{
                backgroundColor: "#F7FAF9",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E3ECE9",
              }}
            >
              <Text
                style={[
                  s.diaryNote,
                  { marginTop: 0, fontSize: 16, lineHeight: 26, color: "#172F2B" },
                ]}
              >
                {diary.note}
              </Text>
            </View>

            <Text style={[s.sectionLabel, { marginTop: 24, fontSize: 16 }]}>
              ✨ Phản hồi từ Soul AI
            </Text>
            <View
              style={[
                s.aiInsightBox,
                {
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: risk === "high" ? "#DC2626" : "#00866B",
                },
                risk === "high" && s.aiInsightHigh,
                risk === "medium" && s.aiInsightMedium,
              ]}
            >
              <View style={s.aiInsightHeader}>
                <MaterialCommunityIcons
                  name={risk === "high" ? "alert-circle-outline" : "creation"}
                  size={20}
                  color={risk === "high" ? "#DC2626" : "#00866B"}
                />
                <Text
                  style={[
                    s.aiInsightTitle,
                    { fontSize: 15 },
                    risk === "high" && s.aiInsightTitleHigh,
                  ]}
                >
                  Góc nhìn từ Soul
                </Text>
                <View
                  style={[
                    s.riskBadge,
                    risk === "high" && s.riskBadgeHigh,
                    risk === "medium" && s.riskBadgeMedium,
                  ]}
                >
                  <Text
                    style={[
                      s.riskBadgeText,
                      risk === "high" && s.riskBadgeTextHigh,
                    ]}
                  >
                    {getRiskLabel(risk)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  s.insightMetaRow,
                  {
                    marginTop: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#E3ECE9",
                    paddingBottom: 10,
                  },
                ]}
              >
                <Text style={[s.insightMeta, { fontSize: 13 }]}>
                  Cảm xúc: {getSentimentText(insight.sentiment)}
                </Text>
                <Text style={[s.insightMeta, { fontSize: 13 }]}>
                  Chỉ số: {insight.emotionScore || 50}/100
                </Text>
              </View>

              {insight.summary ? (
                <Text
                  style={[
                    s.insightText,
                    { fontSize: 15, lineHeight: 22, color: "#2D3748", marginTop: 12 },
                  ]}
                >
                  {insight.summary}
                </Text>
              ) : (
                <Text
                  style={[
                    s.insightText,
                    { fontSize: 15, color: "#718096", marginTop: 12 },
                  ]}
                >
                  Đang phân tích phản hồi chữa lành từ AI...
                </Text>
              )}

              {insight.suggestion ? (
                <View
                  style={{
                    marginTop: 16,
                    backgroundColor: "#E6FFFA",
                    padding: 12,
                    borderRadius: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: "#319795",
                  }}
                >
                  <Text
                    style={[
                      s.suggestionText,
                      { marginTop: 0, fontSize: 14, lineHeight: 21, color: "#234E52" },
                    ]}
                  >
                    💡 {insight.suggestion}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
