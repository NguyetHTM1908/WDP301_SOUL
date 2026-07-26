import React, { useEffect, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";
import { getMyDiaries } from "@/api/diaryApi";

const AI_PROMPTS = [
  {
    emoji: "✨",
    text: "Có thể hôm nay là một ngày vui, một ngày mệt mỏi hoặc chỉ là một ngày bình thường. Mọi cảm xúc đều xứng đáng được lắng nghe.",
  },
  {
    emoji: "🌱",
    text: "Đôi khi chỉ vài phút viết ra suy nghĩ cũng giúp tâm trạng nhẹ nhàng hơn. Hôm nay có điều gì bạn muốn chia sẻ không?",
  },
  {
    emoji: "☁️",
    text: "Một cảm xúc nhỏ, một khoảnh khắc đáng nhớ hay một suy nghĩ thoáng qua cũng đều đáng được lưu lại.",
  },
  {
    emoji: "🌻",
    text: "AI chưa biết hôm nay của bạn thế nào rồi. Hãy kể AI nghe một chút về ngày hôm nay nhé!",
  },
  {
    emoji: "💭",
    text: "Một câu cũng được, một đoạn dài cũng được — hãy bắt đầu từ điều đang xuất hiện trong tâm trí bạn nhé.",
  },
];

function isTodayVN(dateStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const entryStr = new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  return entryStr === todayStr;
}

export function WeeklyInsight() {
  const [hasTodayDiary, setHasTodayDiary] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  const prompt = useMemo(() => {
    const idx = Math.floor(Math.random() * AI_PROMPTS.length);
    return AI_PROMPTS[idx];
  }, []);

  useEffect(() => {
    async function fetchLatestSuggestion() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getMyDiaries(token, { page: 1, limit: 10 });
        const list = res?.data || (Array.isArray(res) ? res : []);
        const todayEntry = list.find((d: any) => d?.createdAt && isTodayVN(d.createdAt));

        if (todayEntry) {
          setHasTodayDiary(true);
          const aiSugg =
            todayEntry?.aiInsight?.suggestion ||
            todayEntry?.mentalHealth?.analysis?.suggestion ||
            todayEntry?.suggestion ||
            null;
          setSuggestion(aiSugg);
        } else {
          setHasTodayDiary(false);
          setSuggestion(null);
        }
      } catch (e) {
        console.warn("Lỗi tải gợi ý AI cho WeeklyInsight:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestSuggestion();
  }, [token]);

  const showAdvice = hasTodayDiary && suggestion;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>
        {showAdvice ? "✨ Lời khuyên hôm nay từ AI" : "✨ Lời nhắc hôm nay từ AI"}
      </Text>

      <View style={styles.centerBox}>
        {loading ? (
          <ActivityIndicator size="small" color="#2A9D8F" style={{ marginVertical: 30 }} />
        ) : showAdvice ? (
          <>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={70} color="#00866B" />

            <Text style={[styles.suggestionText, { marginTop: 12, paddingHorizontal: 6 }]}>
              💡 {suggestion}
            </Text>

            <TouchableOpacity style={styles.startButton} onPress={() => router.push("/diary")}>
              <Text style={styles.startButtonText}>Viết nhật ký ▶</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 44, marginVertical: 8 }}>{prompt.emoji}</Text>

            <Text style={[styles.suggestionText, { paddingHorizontal: 6, fontWeight: "600" }]}>
              {prompt.text}
            </Text>

            <TouchableOpacity style={styles.startButton} onPress={() => router.push("/diary")}>
              <Text style={styles.startButtonText}>Viết nhật ký ▶</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}