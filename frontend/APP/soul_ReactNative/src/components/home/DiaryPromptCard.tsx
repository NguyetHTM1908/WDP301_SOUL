import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getMyDiaries } from "@/api/diaryApi";

const AI_PROMPTS = [
  {
    emoji: "✨",
    text: "Một ngày mới đã bắt đầu rồi. Bạn đang cảm thấy thế nào? Hãy ghi lại vài dòng để AI cùng bạn khám phá cảm xúc hôm nay nhé.",
  },
  {
    emoji: "🌱",
    text: "Đôi khi chỉ vài phút viết ra suy nghĩ cũng giúp tâm trạng nhẹ nhàng hơn. Hôm nay có điều gì bạn muốn chia sẻ không?",
  },
  {
    emoji: "☁️",
    text: "Không cần một ngày đặc biệt mới cần viết nhật ký. Một cảm xúc nhỏ, một khoảnh khắc đáng nhớ hay một suy nghĩ thoáng qua cũng đều đáng được lưu lại.",
  },
  {
    emoji: "🌻",
    text: "AI chưa biết hôm nay của bạn thế nào rồi. Hãy kể AI nghe một chút về ngày hôm nay nhé!",
  },
  {
    emoji: "✨",
    text: "Có thể hôm nay là một ngày vui, một ngày mệt mỏi hoặc chỉ là một ngày bình thường. Mọi cảm xúc đều xứng đáng được lắng nghe.",
  },
  {
    emoji: "💭",
    text: "Này, hôm nay bạn chưa kể AI nghe chuyện gì rồi. Một câu cũng được, một đoạn dài cũng được — hãy bắt đầu từ điều đang xuất hiện trong tâm trí bạn nhé.",
  },
  {
    emoji: "🤍",
    text: "Trước khi kết thúc ngày hôm nay, hãy dành một chút thời gian nhìn lại cảm xúc của mình. AI sẽ ở đây để lắng nghe và đồng hành cùng bạn.",
  },
];

function normalizeList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.diaries)) return res.diaries;
  return [];
}

function isTodayVN(dateStr: string): boolean {
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

export function DiaryPromptCard() {
  const [hasTodayDiary, setHasTodayDiary] = useState<boolean | null>(null);

  // Random 1 câu khi mount
  const prompt = useMemo(() => {
    const idx = Math.floor(Math.random() * AI_PROMPTS.length);
    return AI_PROMPTS[idx];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setHasTodayDiary(true); // ẩn nếu chưa login
          return;
        }
        const res = await getMyDiaries(token, { page: 1, limit: 10 });
        const list = normalizeList(res);
        const hasToday = list.some((d: any) => d?.createdAt && isTodayVN(d.createdAt));
        setHasTodayDiary(hasToday);
      } catch {
        setHasTodayDiary(true); // ẩn nếu lỗi
      }
    })();
  }, []);

  // Chưa kiểm tra xong hoặc đã có diary hôm nay → không hiển thị
  if (hasTodayDiary !== false) return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="creation" size={15} color="#00866B" />
        <Text style={styles.headerText}>Lời nhắc hôm nay từ AI</Text>
      </View>

      {/* Emoji */}
      <Text style={styles.bigEmoji}>{prompt.emoji}</Text>

      {/* Câu nhắc random */}
      <Text style={styles.promptText}>{prompt.text}</Text>

      {/* Nút CTA */}
      <Pressable
        style={styles.button}
        onPress={() => router.push("/diary" as any)}
      >
        <Text style={styles.buttonText}>Viết nhật ký ▶</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#00866B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00866B",
  },
  bigEmoji: {
    fontSize: 38,
    marginBottom: 14,
  },
  promptText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#064D3D",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 36,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
