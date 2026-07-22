import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, ActivityIndicator, Modal, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";
import { getMyDiaries } from "@/api/diaryApi";

export function MoodAnalytics() {
  const [diaries, setDiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const [selectedDay, setSelectedDay] = useState<{
    dayName: string;
    isFuture: boolean;
    date: Date;
    hasData: boolean;
    latestDiary: any;
  } | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  // Sinh màu và kiểu dáng dựa trên cảm xúc của ngày
  const getMoodColorInfo = (mood: string) => {
    if (mood === "happy") return { bg: "#E0F7EF", text: "#00866B" }; // xanh lá chữa lành
    if (mood === "neutral") return { bg: "#E0F2FE", text: "#0284C7" }; // xanh dương cân bằng
    if (mood === "stress") return { bg: "#FEF3C7", text: "#D97706" }; // vàng áp lực
    if (mood === "anxious") return { bg: "#FFF7ED", text: "#EA580C" }; // cam lo âu
    if (mood === "sad") return { bg: "#FEE2E2", text: "#DC2626" }; // đỏ buồn bã
    if (mood === "angry") return { bg: "#FEE2E2", text: "#DC2626" }; // đỏ tức giận
    return { bg: "#F1F5F9", text: "#64748B" };
  };

  const getBarColor = (score: number) => {
    if (score >= 7) return "#00866B"; // xanh lá đậm
    if (score >= 5) return "#36BFA6"; // xanh ngọc
    if (score >= 3) return "#F59E0B"; // vàng hổ phách
    return "#EF4444"; // đỏ coral
  };

  const handlePressDay = (day: any, hasData: boolean, latestDiary: any) => {
    setSelectedDay({
      dayName: day.dayName,
      isFuture: day.isFuture,
      date: day.date,
      hasData,
      latestDiary,
    });
    setShowDetailModal(true);
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
              const rawScore = latestDiary.finalMentalScore ?? latestDiary.moodScore ?? 50;
              const normalizedScore = rawScore <= 10 ? rawScore * 10 : rawScore;
              const clampedScore = Math.min(100, Math.max(0, normalizedScore));
              barHeight = Math.round((clampedScore / 100) * 45 + 12);
            }

            const today = new Date();
            const isToday = !day.isFuture && 
                            today.getDate() === day.date.getDate() &&
                            today.getMonth() === day.date.getMonth() &&
                            today.getFullYear() === day.date.getFullYear();

            return (
              <TouchableOpacity
                key={i}
                style={styles.chartItem}
                onPress={() => handlePressDay(day, hasData, latestDiary)}
                activeOpacity={0.7}
              >
                {/* 1. Emoji / Circle Header */}
                {emojiDisplay === "o" ? (
                  <View style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    borderWidth: 2,
                    borderColor: '#CBD5E1',
                    backgroundColor: '#F8FAFC',
                    marginBottom: 10,
                    marginTop: 8
                  }} />
                ) : !hasData ? (
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    opacity: 0.6
                  }}>
                    <Text style={{ fontSize: 15 }}>😶</Text>
                  </View>
                ) : (
                  <View style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: getMoodColorInfo(latestDiary.mood).bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    shadowColor: getMoodColorInfo(latestDiary.mood).text,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 2
                  }}>
                    <Text style={{ fontSize: 17 }}>{emojiDisplay}</Text>
                  </View>
                )}

                {/* 2. Chart Bar */}
                {isFuture ? (
                  <View style={{ height: 0 }} />
                ) : !hasData ? (
                  <View style={{
                    width: 6,
                    height: barHeight,
                    borderRadius: 3,
                    backgroundColor: "#CBD5E1",
                    opacity: 0.4
                  }} />
                ) : (
                  <View style={{
                    width: 20,
                    height: barHeight,
                    borderRadius: 10,
                    backgroundColor: getBarColor(latestDiary.moodScore),
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                    elevation: 1
                  }} />
                )}

                {/* 3. Day Text & Today Dot */}
                <Text style={[
                  styles.day,
                  isToday && { color: "#006B5C", fontWeight: "900", fontSize: 12, marginTop: 8 }
                ]}>
                  {day.dayName}
                </Text>
                
                {isToday ? (
                  <View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "#006B5C",
                    marginTop: 2
                  }} />
                ) : (
                  <View style={{ width: 4, height: 4, marginTop: 2 }} />
                )}
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

      {/* Custom Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
          onPress={() => setShowDetailModal(false)}
        >
          <Pressable
            style={{
              width: "100%",
              maxWidth: 320,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
              alignItems: "center",
            }}
            onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Header / Title */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#F1F5F9",
              paddingBottom: 10
            }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#0F172A" }}>
                {selectedDay?.isFuture 
                  ? "Bí ẩn tương lai 🌟" 
                  : `Nhật ký ${selectedDay?.dayName}`}
              </Text>
              
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            {selectedDay?.isFuture ? (
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <MaterialCommunityIcons name="compass-outline" size={54} color="#64748B" style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 22 }}>
                  Ngày này thuộc về tương lai. Hãy sống trọn vẹn và yêu thương bản thân hôm nay nhé! ✨
                </Text>
              </View>
            ) : !selectedDay?.hasData ? (
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <MaterialCommunityIcons name="notebook-edit-outline" size={54} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 22, marginBottom: 16 }}>
                  Chưa có dữ liệu cảm xúc trong ngày này. Hãy viết nhật ký để Soul AI hiểu bạn hơn 💚
                </Text>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: "#006B5C",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                  }}
                  onPress={() => {
                    setShowDetailModal(false);
                    router.push("/diary" as any);
                  }}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Viết nhật ký ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: "100%", alignItems: "center" }}>
                {/* Mood Icon Bubble */}
                <View style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: getMoodColorInfo(selectedDay.latestDiary.mood).bg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  shadowColor: getMoodColorInfo(selectedDay.latestDiary.mood).text,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 5,
                  elevation: 3
                }}>
                  <Text style={{ fontSize: 26 }}>
                    {moodEmojis[selectedDay.latestDiary.mood] || "🌱"}
                  </Text>
                </View>

                {/* Mood Name & Score */}
                <Text style={{ fontSize: 18, fontWeight: "900", color: getMoodColorInfo(selectedDay.latestDiary.mood).text }}>
                  {
                    selectedDay.latestDiary.mentalHealth?.displayStatusLabel ||
                    {
                      happy: "Tích cực",
                      sad: "Buồn bã",
                      stress: "Áp lực",
                      anxious: "Lo âu",
                      angry: "Giận dữ",
                      neutral: "Cân bằng"
                    }[selectedDay.latestDiary.mood as string] || "Cân bằng"
                  }
                </Text>
                
                <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4, fontWeight: "600" }}>
                  Chỉ số tâm trạng: {selectedDay.latestDiary.finalMentalScore ?? (selectedDay.latestDiary.moodScore <= 10 ? selectedDay.latestDiary.moodScore * 10 : selectedDay.latestDiary.moodScore)}/100
                </Text>

                {/* Divider */}
                <View style={{ width: "100%", height: 1, backgroundColor: "#F1F5F9", marginVertical: 14 }} />

                {/* Note content */}
                <Text style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: "800", color: "#64748B", marginBottom: 6 }}>
                  NỘI DUNG NHẬT KÝ
                </Text>
                
                <ScrollView 
                  style={{ width: "100%", maxHeight: 110 }} 
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 6 }}
                >
                  <Text style={{ fontSize: 14, color: "#334155", lineHeight: 22, fontStyle: "italic" }}>
                    "{selectedDay.latestDiary.note || "Không có ghi chú nào cho ngày này."}"
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* Bottom Button */}
            <TouchableOpacity
              style={{
                width: "100%",
                backgroundColor: "#F1F5F9",
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20
              }}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={{ color: "#475569", fontSize: 14, fontWeight: "800" }}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}