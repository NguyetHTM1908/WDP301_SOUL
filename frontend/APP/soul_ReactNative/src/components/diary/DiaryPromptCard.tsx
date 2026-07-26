import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

type DiaryPromptCardProps = {
  onPress: () => void;
};

export const DiaryPromptCard: React.FC<DiaryPromptCardProps> = ({ onPress }) => {
  // Chọn random 1 câu, giữ ổn định trong 1 lần render (useMemo)
  const prompt = useMemo(() => {
    const idx = Math.floor(Math.random() * AI_PROMPTS.length);
    return AI_PROMPTS[idx];
  }, []);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="creation" size={16} color="#00866B" />
        <Text style={styles.headerText}>Lời nhắc hôm nay từ AI</Text>
      </View>

      {/* Emoji lớn */}
      <Text style={styles.bigEmoji}>{prompt.emoji}</Text>

      {/* Nội dung câu nhắc */}
      <Text style={styles.promptText}>{prompt.text}</Text>

      {/* Nút CTA */}
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Viết nhật ký ▶</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    alignItems: "center",
    shadowColor: "#00866B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0F2EC",
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
    fontWeight: "600",
    color: "#00866B",
    letterSpacing: 0.1,
  },
  bigEmoji: {
    fontSize: 40,
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
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
