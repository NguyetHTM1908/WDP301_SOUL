import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { diaryStyles as s } from "@/styles/diary.styles";

type DiaryCardProps = {
  item: any;
  onPressDetail: (item: any) => void;
  onPressEdit: (item: any) => void;
  onPressDelete: (diaryId: string) => void;
  getMoodInfo: (mood?: string) => any;
  getRiskLabel: (risk?: string | null) => string;
  getSentimentText: (sentiment?: string | null) => string;
  formatDate: (value?: string) => string;
  formatTime: (value?: string) => string;
};

export const DiaryCard: React.FC<DiaryCardProps> = ({
  item,
  onPressDetail,
  onPressEdit,
  onPressDelete,
  getMoodInfo,
  getRiskLabel,
  getSentimentText,
  formatDate,
  formatTime,
}) => {
  const moodInfo = getMoodInfo(item?.mood);
  const insight = item?.aiInsight || {};
  const risk = insight?.riskLevel;

  return (
    <View style={s.diaryCard}>
      {/* Phần thân thẻ bọc bằng Pressable để xem chi tiết */}
      <Pressable onPress={() => onPressDetail(item)}>
        <View style={s.diaryTop}>
          <View style={s.moodCircle}>
            <Text style={s.moodCircleText}>{moodInfo.emoji}</Text>
          </View>

          <View style={[s.diaryHeaderInfo, { marginRight: 80 }]}>
            <View style={s.diaryTitleRow}>
              <Text style={s.diaryMood}>{moodInfo.label}</Text>
            </View>

            <Text style={s.diaryDate}>
              {formatDate(item?.createdAt)} • {formatTime(item?.createdAt)}
            </Text>
          </View>
        </View>

        <View style={s.scoreRow}>
          <Text style={s.scoreLabel}>Mood score</Text>

          <View style={s.scoreBar}>
            <View
              style={[
                s.scoreBarFill,
                {
                  width: `${Math.min(Math.max(item?.moodScore || 1, 1), 10) * 10}%`,
                  backgroundColor: moodInfo.color,
                },
              ]}
            />
          </View>

          <Text style={s.scoreValue}>{item?.moodScore || 0}/10</Text>
        </View>

        {item?.note ? (
          <Text style={s.diaryNote} numberOfLines={3}>
            {item.note}
          </Text>
        ) : null}

        <View
          style={[
            s.aiInsightBox,
            risk === "high" && s.aiInsightHigh,
            risk === "medium" && s.aiInsightMedium,
          ]}
        >
          <View style={s.aiInsightHeader}>
            <MaterialCommunityIcons
              name={risk === "high" ? "alert-circle-outline" : "creation"}
              size={18}
              color={risk === "high" ? "#DC2626" : "#00866B"}
            />

            <Text
              style={[
                s.aiInsightTitle,
                risk === "high" && s.aiInsightTitleHigh,
              ]}
            >
              ✨ Lời nhắn từ Soul AI
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

          <View style={s.insightMetaRow}>
            <Text style={s.insightMeta}>
              Cảm xúc: {getSentimentText(insight?.sentiment)}
            </Text>

            {typeof insight?.emotionScore === "number" ? (
              <Text style={s.insightMeta}>Chỉ số: {insight.emotionScore}/100</Text>
            ) : null}
          </View>

          {insight?.summary ? (
            <Text style={s.insightText} numberOfLines={2}>
              {insight.summary}
            </Text>
          ) : (
            <Text style={s.insightText}>
              Đang phân tích phản hồi chữa lành từ AI...
            </Text>
          )}

          {insight?.suggestion ? (
            <Text style={s.suggestionText} numberOfLines={2}>
              💡 {insight.suggestion}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {/* Cụm sửa/xóa đặt tuyệt đối ở góc trên bên phải để không bị kích hoạt đè khi nhấn thẻ */}
      <View style={{ position: "absolute", right: 16, top: 16, flexDirection: "row", gap: 8 }}>
        <Pressable style={s.smallIconButton} onPress={() => onPressEdit(item)}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={20}
            color="#00866B"
          />
        </Pressable>

        <Pressable
          style={[s.smallIconButton, s.deleteIconButton]}
          onPress={() => onPressDelete(item?._id)}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={20}
            color="#EF4444"
          />
        </Pressable>
      </View>
    </View>
  );
};
