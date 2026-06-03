import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { styles } from "@/styles/admin-events.styles";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";

export default function AdminCreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "workshop",
    location: "",
    startDateTime: "",
    endDateTime: "",
    capacity: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Helper hiển thị thông báo tương thích Web & Mobile
  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      onOk?.();
    } else {
      Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return; // Chặn bấm nhiều lần

    if (!formData.title.trim()) {
      showAlert("Lỗi", "Vui lòng nhập Tiêu đề sự kiện");
      return;
    }
    if (!formData.startDateTime.trim()) {
      showAlert("Lỗi", "Vui lòng nhập Thời gian bắt đầu (định dạng ISO 8601)");
      return;
    }

    setSubmitting(true);
    try {
      console.log("[Create Event] Đang gửi dữ liệu:", JSON.stringify(formData));
      const response = await eventAdminService.createEvent(formData);
      console.log("[Create Event] Phản hồi:", JSON.stringify(response));

      if (response.success) {
        // Điều hướng về danh sách TRƯỚC để tránh vòng lặp
        router.replace("/(admin)/events");
        // Hiển thị thông báo sau trên mobile
        if (Platform.OS !== "web") {
          Alert.alert("Thành công", "Đã tạo sự kiện mới thành công!");
        }
      } else {
        const msg = response.message || "Không thể tạo sự kiện";
        showAlert("Lỗi", msg);
      }
    } catch (error: any) {
      console.error("[Create Event] Lỗi:", JSON.stringify(error));
      const msg = error?.message || error?.error || "Đã xảy ra lỗi khi tạo sự kiện";
      showAlert("Lỗi tạo sự kiện", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)/events")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Sự kiện mới</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiêu đề sự kiện *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Workshop Vượt Qua Lo Âu"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại sự kiện</Text>
            <TextInput
              style={styles.input}
              placeholder="workshop, talkshow, webinar..."
              value={formData.eventType}
              onChangeText={(text) => setFormData({ ...formData, eventType: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian bắt đầu * (ISO 8601)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-07-10T09:00:00.000Z"
              value={formData.startDateTime}
              onChangeText={(text) => setFormData({ ...formData, startDateTime: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian kết thúc (ISO 8601)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-07-10T12:00:00.000Z"
              value={formData.endDateTime}
              onChangeText={(text) => setFormData({ ...formData, endDateTime: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa điểm / Link Online</Text>
            <TextInput
              style={styles.input}
              placeholder="Phòng A1, ĐH FPT / Zoom link"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sức chứa (Số người tối đa)</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={formData.capacity}
              onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Thông tin chi tiết về sự kiện..."
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              editable={!submitting}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Đang lưu..." : "Lưu Sự Kiện"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
