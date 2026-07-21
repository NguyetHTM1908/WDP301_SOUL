import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";
import { getMyDiaries } from "@/api/diaryApi";

export function WeeklyInsight() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    async function fetchLatestSuggestion() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getMyDiaries(token, { page: 1, limit: 10 });
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          const latest = list[0];
          const aiSugg =
            latest?.aiInsight?.suggestion ||
            latest?.mentalHealth?.analysis?.suggestion ||
            latest?.suggestion ||
            null;
          if (aiSugg) {
            setSuggestion(aiSugg);
          }
        }
      } catch (e) {
        console.warn("Lỗi tải gợi ý AI cho WeeklyInsight:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestSuggestion();
  }, [token]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>
        {suggestion ? "✨ Lời khuyên hôm nay từ AI" : "✨ Gợi ý hôm nay"}
      </Text>

      <View style={styles.centerBox}>
        {loading ? (
          <ActivityIndicator size="small" color="#2A9D8F" style={{ marginVertical: 30 }} />
        ) : suggestion ? (
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
            <MaterialCommunityIcons name="meditation" size={120} color="#2A9D8F" />

            <Text style={styles.suggestionText}>
              Dành 5 phút để hít thở{"\n"}và thư giãn tâm trí.
            </Text>

            <TouchableOpacity style={styles.startButton} onPress={() => router.push("/diary")}>
              <Text style={styles.startButtonText}>Bắt đầu ngay ▶</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}