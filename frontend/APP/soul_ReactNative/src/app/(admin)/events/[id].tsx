import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { styles } from "@/styles/admin-events.styles";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";

export default function AdminEventDetail() {
  const params = useLocalSearchParams();
  // Đảm bảo id luôn là string, không phải string[]
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const fetchEvent = async () => {
        setLoading(true);
        try {
          const response = await eventAdminService.getEventById(id);
          if (response.success && response.data) {
            setEvent(response.data);
          } else {
            showAlert("Lỗi", "Không tìm thấy sự kiện");
            router.replace("/(admin)/events");
          }
        } catch (error: any) {
          const msg = error?.message || error?.error || "Không thể tải sự kiện";
          showAlert("Lỗi", msg);
          router.replace("/(admin)/events");
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }, [id])
  );

  // Helper hiển thị thông báo tương thích cả Web lẫn Mobile
  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      onOk?.();
    } else {
      Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
    }
  };

  const handleDelete = async () => {
    if (deleting) return; // Chặn bấm nhiều lần

    // Hỏi xác nhận
    const confirmed = await new Promise<boolean>((resolve) => {
      if (Platform.OS === "web") {
        resolve(window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?\nHành động này không thể hoàn tác."));
      } else {
        Alert.alert(
          "Xác nhận xóa",
          "Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.",
          [
            { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
            { text: "Xóa", style: "destructive", onPress: () => resolve(true) },
          ]
        );
      }
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      console.log("[Delete Event] Đang xóa id:", id);
      const response = await eventAdminService.deleteEvent(id);
      console.log("[Delete Event] Phản hồi:", JSON.stringify(response));

      if (response.success) {
        // Điều hướng TRƯỚC, tránh useFocusEffect kéo lại dữ liệu đã xóa
        router.replace("/(admin)/events");
        // Hiển thị thông báo sau khi điều hướng (trên mobile)
        if (Platform.OS !== "web") {
          Alert.alert("Thành công", "Đã xóa sự kiện thành công!");
        }
      } else {
        const msg = response.message || "Không thể xóa sự kiện";
        showAlert("Lỗi", msg);
      }
    } catch (error: any) {
      console.error("[Delete Event] Lỗi:", JSON.stringify(error));
      const msg = error?.message || error?.error || "Đã xảy ra lỗi khi xóa";
      showAlert("Lỗi xóa sự kiện", msg);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming": return "Sắp diễn ra";
      case "ongoing": return "Đang diễn ra";
      case "completed": return "Đã kết thúc";
      case "cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)/events")}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết Sự kiện</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (!event) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)/events")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Sự kiện</Text>
        <TouchableOpacity onPress={() => router.push(`/(admin)/events/edit/${id}`)}>
          <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>{event.title}</Text>

          <View style={[styles.statusBadge, { alignSelf: "flex-start", marginBottom: 16, backgroundColor: "#FEF3C7" }]}>
            <Text style={[styles.statusText, { color: "#D97706" }]}>{getStatusText(event.status)}</Text>
          </View>

          <View style={styles.eventInfoRow}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={colors.primary} />
            <Text style={styles.eventInfoText}>Bắt đầu: {formatDate(event.startDateTime)}</Text>
          </View>

          {event.endDateTime && (
            <View style={styles.eventInfoRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={colors.primary} />
              <Text style={styles.eventInfoText}>Kết thúc: {formatDate(event.endDateTime)}</Text>
            </View>
          )}

          <View style={styles.eventInfoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
            <Text style={styles.eventInfoText}>{event.location || "Chưa xác định"}</Text>
          </View>

          <View style={styles.eventInfoRow}>
            <MaterialCommunityIcons name="account-tie" size={20} color={colors.primary} />
            <Text style={styles.eventInfoText}>Diễn giả: {event.speakerName || "Chưa cập nhật"}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{event.registeredCount ?? 0}</Text>
            <Text style={styles.statLabel}>Đã đăng ký</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{event.capacity || "∞"}</Text>
            <Text style={styles.statLabel}>Sức chứa</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>
              {event.capacity ? Math.round(((event.registeredCount ?? 0) / event.capacity) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Lấp đầy</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.registrationManageButton}
          activeOpacity={0.82}
          onPress={() => router.push(`/(admin)/events/registrations/${id}`)}
        >
          <View style={styles.registrationManageIcon}>
            <MaterialCommunityIcons name="account-multiple-check" size={24} color={colors.dark} />
          </View>
          <View style={styles.registrationManageTextWrap}>
            <Text style={styles.registrationManageTitle}>Quản lý người đăng ký</Text>
            <Text style={styles.registrationManageSub}>
              Xem danh sách và cập nhật trạng thái tham gia
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.detailSection}>
          <Text style={styles.detailTitle}>Mô tả chi tiết</Text>
          <Text style={styles.descText}>{event.description || "Chưa có mô tả."}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/(admin)/events/edit/${id}`)}
          >
            <Text style={styles.btnText}>Cập nhật</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.btnText}>{deleting ? "Đang xóa..." : "Xóa Sự kiện"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
