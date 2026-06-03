import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/admin-events.styles";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";

export default function AdminEditEvent() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "workshop",
    location: "",
    startDateTime: "",
    endDateTime: "",
    capacity: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAdminService.getEventById(id as string);
        if (response.success && response.data) {
          const ev = response.data;
          setFormData({
            title: ev.title || "",
            description: ev.description || "",
            eventType: ev.eventType || "workshop",
            location: ev.location || "",
            startDateTime: ev.startDateTime || "",
            endDateTime: ev.endDateTime || "",
            capacity: ev.capacity ? ev.capacity.toString() : "",
          });
        } else {
          if (Platform.OS === "web") {
            alert("Không tìm thấy sự kiện");
          } else {
            Alert.alert("Lỗi", "Không tìm thấy sự kiện");
          }
          router.back();
        }
      } catch (error: any) {
        if (Platform.OS === "web") {
          alert(error.message || "Không thể tải thông tin sự kiện");
        } else {
          Alert.alert("Lỗi", error.message || "Không thể tải thông tin sự kiện");
        }
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.startDateTime) {
      if (Platform.OS === "web") {
        alert("Vui lòng nhập Tiêu đề và Thời gian bắt đầu");
      } else {
        Alert.alert("Lỗi", "Vui lòng nhập Tiêu đề và Thời gian bắt đầu");
      }
      return;
    }

    setSaving(true);
    try {
      const response = await eventAdminService.updateEvent(id as string, formData);
      if (response.success) {
        if (Platform.OS === "web") {
          alert("Cập nhật sự kiện thành công!");
          router.back();
        } else {
          Alert.alert("Thành công", "Đã cập nhật sự kiện", [
            { text: "OK", onPress: () => router.back() }
          ]);
        }
      } else {
        if (Platform.OS === "web") {
          alert(response.message || "Không thể cập nhật sự kiện");
        } else {
          Alert.alert("Lỗi", response.message || "Không thể cập nhật sự kiện");
        }
      }
    } catch (error: any) {
      if (Platform.OS === "web") {
        alert(error.message || "Đã xảy ra lỗi khi cập nhật sự kiện");
      } else {
        Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi cập nhật sự kiện");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa Sự kiện</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa Sự kiện</Text>
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
              onChangeText={(text) => setFormData({...formData, title: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại sự kiện</Text>
            <TextInput
              style={styles.input}
              placeholder="workshop, talkshow, webinar..."
              value={formData.eventType}
              onChangeText={(text) => setFormData({...formData, eventType: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian bắt đầu * (ISO 8601)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-07-10T09:00:00.000Z"
              value={formData.startDateTime}
              onChangeText={(text) => setFormData({...formData, startDateTime: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thời gian kết thúc (ISO 8601)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-07-10T12:00:00.000Z"
              value={formData.endDateTime}
              onChangeText={(text) => setFormData({...formData, endDateTime: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa điểm / Link Online</Text>
            <TextInput
              style={styles.input}
              placeholder="Phòng A1, ĐH FPT / Zoom link"
              value={formData.location}
              onChangeText={(text) => setFormData({...formData, location: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sức chứa (Số người tối đa)</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={formData.capacity}
              onChangeText={(text) => setFormData({...formData, capacity: text})}
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
              onChangeText={(text) => setFormData({...formData, description: text})}
            />
          </View>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.submitButtonText}>
              {saving ? "Đang lưu..." : "Cập Nhật Sự Kiện"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
