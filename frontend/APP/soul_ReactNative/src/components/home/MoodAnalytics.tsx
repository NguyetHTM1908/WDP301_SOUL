import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";
import { getMyDiaries } from "@/api/diaryApi";

export function MoodAnalytics() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  // Lấy ngày Thứ 2 đến Chủ nhật của tuần hiện tại
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: CN, 1: T2, ..., 6: T6
    const todayIndex = currentDay === 0 ? 6 : currentDay - 1; // 0: T2, ..., 6: CN
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      const diff = i - todayIndex;
      d.setDate(today.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        isFuture: i > todayIndex,
        dayName: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i],
      });
    }
    return days;
  };

  const fetchWeekData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getMyDiaries(token, { page: 1, limit: 50 });
      if (res && res.data) {
        setDiaries(res.data);
      } else if (Array.isArray(res)) {
        setDiaries(res);
      }
    } catch (e) {
      console.warn("Lỗi tải nhật ký cho mood chart:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekData();
  }, [token]);

  const weekDays = getWeekDays();

  // Map mood value to emoji
  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😔",
    stress: "😵",
    anxious: "😟",
    angry: "😤",
    neutral: "🌱",
  };

  const handlePressDay = (day: any, hasData: boolean, latestDiary: any) => {
    if (day.isFuture) {
      Alert.alert("Soul AI", "Ngày này thuộc về tương lai. Hãy sống trọn vẹn hôm nay nhé! ✨");
      return;
    }
    if (!hasData) {
      Alert.alert("Thông báo", "Chưa có dữ liệu cảm xúc trong ngày này. Hãy viết nhật ký để Soul AI hiểu bạn hơn 💚");
      return;
    }
    
    const vietnameseMoods: Record<string, string> = {
      happy: "Tích cực",
      sad: "Buồn bã",
      stress: "Áp lực",
      anxious: "Lo âu",
      angry: "Giận dữ",
      neutral: "Cân bằng",
    };
    const moodName = vietnameseMoods[latestDiary.mood] || "Cân bằng";
    Alert.alert(
      "Chi tiết cảm xúc",
      `Ngày ${day.dayName}: Bạn cảm thấy "${moodName}" (${latestDiary.moodScore}/10 điểm).\n\nNội dung nhật ký: "${latestDiary.note || "Không có ghi chú"}"`
    );
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>📊 Tổng quan cảm xúc</Text>
        <Text style={styles.panelLink}>Tuần này⌄</Text>
      </View>

      {loading ? (
        <View style={{ height: 150, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="small" color="#006B5C" />
        </View>
      ) : (
        <View style={styles.chartRow}>
          {weekDays.map((day, i) => {
            const dayDiaries = diaries.filter((d) => {
              const dDate = new Date(d.createdAt);
              return dDate.getDate() === day.date.getDate() &&
                     dDate.getMonth() === day.date.getMonth() &&
                     dDate.getFullYear() === day.date.getFullYear();
            });

            const hasData = dayDiaries.length > 0;
            const latestDiary = hasData ? dayDiaries[dayDiaries.length - 1] : null;

            let emojiDisplay = "";
            let barHeight = 0;
            let isFuture = day.isFuture;

            if (isFuture) {
              emojiDisplay = "o";
              barHeight = 0;
            } else if (!hasData) {
              emojiDisplay = "😶";
              barHeight = 15;
            } else {
              emojiDisplay = moodEmojis[latestDiary.mood] || "🌱";
              const score = latestDiary.moodScore || 5;
              barHeight = score * 8 + 15;
            }

            return (
              <TouchableOpacity
                key={i}
                style={styles.chartItem}
                onPress={() => handlePressDay(day, hasData, latestDiary)}
                activeOpacity={0.7}
              >
                {emojiDisplay === "o" ? (
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: '#A0AEC0',
                    marginBottom: 10,
                    marginTop: 4
                  }} />
                ) : (
                  <Text style={[styles.emoji, !hasData && { opacity: 0.5 }]}>
                    {emojiDisplay}
                  </Text>
                )}

                <View style={[
                  styles.chartBar,
                  { height: barHeight },
                  !hasData && { backgroundColor: "#CBD5E1", opacity: 0.5 }
                ]} />

                <Text style={styles.day}>
                  {day.dayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.noteBox}>
        <MaterialCommunityIcons name="leaf" size={38} color="#52B788" />

        <Text style={styles.noteText}>
          Mọi cảm xúc của bạn đều đáng được lắng nghe.{"\n"}
          Mỗi cảm xúc là một bước trên hành trình chữa lành.
        </Text>
      </View>
    </View>
  );
}