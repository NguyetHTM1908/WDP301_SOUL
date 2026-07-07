import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { eventOwnerService } from "@/services/eventApi";

function getSafeId(rawId: unknown) {
  if (Array.isArray(rawId)) return rawId[0] || "";
  if (typeof rawId === "string") return rawId;
  return "";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Thời gian không hợp lệ";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getApprovalMeta(status?: string) {
  if (status === "approved") {
    return {
      label: "Đã duyệt",
      icon: "lock-check-outline",
      color: "#047857",
      bg: "#DCFCE7",
    };
  }

  if (status === "rejected") {
    return {
      label: "Từ chối",
      icon: "close-circle-outline",
      color: "#DC2626",
      bg: "#FEE2E2",
    };
  }

  return {
    label: "Chờ duyệt",
    icon: "clock-outline",
    color: "#D97706",
    bg: "#FEF3C7",
  };
}

function getEventModeLabel(mode?: string) {
  if (mode === "online") return "Online";
  if (mode === "offline") return "Offline";
  return "Chưa rõ";
}

function getEventPlaceText(event: any) {
  if (event?.eventMode === "online") {
    return event?.meetingLink || "Chưa có link online";
  }

  return event?.location || "Chưa có địa điểm";
}

export default function OrganizerEventDetail() {
  const params = useLocalSearchParams();
  const id = getSafeId(params.id);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    setLoading(true);

    try {
      const response = await eventOwnerService.getMyEventById(id);
      const eventData = response?.data?.event || response?.data;

      if (response?.success === false || !eventData) {
        Alert.alert("Lỗi", response?.message || "Không tìm thấy event.");
        router.replace("/(organizer)/events" as any);
        return;
      }

      setEvent(eventData);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải event.");
      router.replace("/(organizer)/events" as any);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [fetchEvent])
  );

  const handleEdit = () => {
    if (!event) return;

    if (event.approvalStatus === "approved") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Event đã được admin duyệt nên không thể chỉnh sửa."
      );
      return;
    }

    router.push(`/(organizer)/events/edit/${id}` as any);
  };

  const handleRegistrations = () => {
    router.push(`/(organizer)/events/registrations/${id}` as any);
  };

  const handleDelete = () => {
    if (!event || deleting) return;

    if (event.approvalStatus === "approved") {
      Alert.alert(
        "Không thể hủy",
        "Event đã được admin duyệt nên không thể hủy."
      );
      return;
    }

    const deleteNow = async () => {
      setDeleting(true);

      try {
        const response = await eventOwnerService.deleteEvent(id);

        if (response?.success === false) {
          Alert.alert("Lỗi", response?.message || "Không thể hủy event.");
          return;
        }

        Alert.alert("Thành công", "Đã hủy event.");
        router.replace("/(organizer)/events" as any);
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể hủy event.");
      } finally {
        setDeleting(false);
      }
    };

    Alert.alert("Hủy event", "Bạn có chắc muốn hủy event này?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy", style: "destructive", onPress: deleteNow },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={styles.loadingText}>Đang tải event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Không tìm thấy event</Text>
        </View>
      </SafeAreaView>
    );
  }

  const approval = getApprovalMeta(event.approvalStatus);
  const isApproved = event.approvalStatus === "approved";
  const registeredCount = event.registeredCount ?? 0;
  const capacityText =
    event.capacity === null || event.capacity === undefined
      ? "Không giới hạn"
      : String(event.capacity);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconButtonLight}
            onPress={() => router.replace("/(organizer)/events" as any)}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#064D3D"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButtonGreen} onPress={fetchEvent}>
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Chi tiết event</Text>
        <Text style={styles.subtitle}>
          Người tổ chức xem thông tin event và danh sách người tham dự.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={[styles.eventIcon, { backgroundColor: approval.bg }]}>
              <MaterialCommunityIcons
                name={approval.icon as any}
                size={32}
                color={approval.color}
              />
            </View>

            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>
                {event.title || "Sự kiện SOUL"}
              </Text>
              <Text style={styles.cardSubtitle}>
                {event.organizerName || event.createdBy?.fullName || "SOUL"}
              </Text>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: approval.bg }]}>
            <Text style={[styles.badgeText, { color: approval.color }]}>
              {approval.label}
            </Text>
          </View>

          {!!event.description && (
            <Text style={styles.description}>{event.description}</Text>
          )}

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={18}
                color="#00866B"
              />
              <Text style={styles.infoText}>
                Bắt đầu: {formatDateTime(event.startDateTime)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={18}
                color="#00866B"
              />
              <Text style={styles.infoText}>
                Kết thúc: {formatDateTime(event.endDateTime)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name={
                  event.eventMode === "online"
                    ? "video-outline"
                    : "map-marker"
                }
                size={18}
                color="#00866B"
              />
              <Text style={styles.infoText}>
                {getEventModeLabel(event.eventMode)} · {getEventPlaceText(event)}
              </Text>
            </View>

            <View style={[styles.infoRow, { marginBottom: 0 }]}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={18}
                color="#00866B"
              />
              <Text style={styles.infoText}>
                Người đăng ký: {registeredCount}/{capacityText}
              </Text>
            </View>
          </View>

          {isApproved ? (
            <View style={styles.lockBox}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color="#047857"
              />
              <Text style={styles.lockText}>
                Event đã được admin duyệt. Không thể sửa hoặc hủy.
              </Text>
            </View>
          ) : null}

          {event.rejectedReason ? (
            <View style={styles.rejectBox}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />
              <Text style={styles.rejectText}>
                Lý do từ chối: {event.rejectedReason}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.registrationButton}
            onPress={handleRegistrations}
          >
            <MaterialCommunityIcons
              name="account-search-outline"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.whiteButtonText}>Xem người tham dự</Text>
          </TouchableOpacity>

          {!isApproved ? (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color="#00866B"
                />
                <Text style={styles.editButtonText}>Sửa event</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={20}
                      color="#DC2626"
                    />
                    <Text style={styles.deleteButtonText}>Hủy event</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FBF8",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: "#DDF5EC",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  iconButtonLight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonGreen: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#064D3D",
  },

  subtitle: {
    fontSize: 14,
    color: "#49756C",
    marginTop: 6,
    lineHeight: 20,
  },

  content: {
    padding: 18,
    paddingBottom: 34,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2F3EE",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  eventIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitleBlock: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064D3D",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "800",
  },

  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 21,
    marginTop: 14,
  },

  infoPanel: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },

  lockBox: {
    marginTop: 16,
    backgroundColor: "#DCFCE7",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 8,
  },

  lockText: {
    flex: 1,
    color: "#047857",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  rejectBox: {
    marginTop: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 8,
  },

  rejectText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  registrationButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  whiteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#E6F7F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButtonText: {
    color: "#00866B",
    fontSize: 14,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064D3D",
  },
});