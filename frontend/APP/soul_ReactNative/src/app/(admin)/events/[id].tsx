import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { eventAdminService } from "@/services/eventApi";

function showMessage(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    const alertFn = (globalThis as any).alert;

    if (typeof alertFn === "function") {
      alertFn(`${title}: ${message}`);
    }

    onOk?.();
    return;
  }

  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
}

function askConfirm(message: string) {
  if (Platform.OS === "web") {
    const confirmFn = (globalThis as any).confirm;
    return typeof confirmFn === "function" ? confirmFn(message) : true;
  }

  return null;
}

function askPrompt(message: string, defaultValue: string) {
  if (Platform.OS === "web") {
    const promptFn = (globalThis as any).prompt;
    return typeof promptFn === "function"
      ? promptFn(message, defaultValue)
      : defaultValue;
  }

  return defaultValue;
}

function getSafeId(rawId: unknown) {
  if (Array.isArray(rawId)) return rawId[0] || "";
  if (typeof rawId === "string") return rawId;
  return "";
}

function isInvalidRouteId(id: string) {
  return !id || id === "[id]" || id === "undefined" || id === "null";
}

function formatDateTime(value?: string) {
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
      icon: "check-decagram",
      color: "#047857",
      bg: "#DCFCE7",
    };
  }

  if (status === "rejected") {
    return {
      label: "Đã từ chối",
      icon: "close-circle-outline",
      color: "#DC2626",
      bg: "#FEE2E2",
    };
  }

  return {
    label: "Chờ duyệt",
    icon: "clock-outline",
    color: "#B45309",
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

function getOrganizerName(event: any) {
  return (
    event?.createdBy?.fullName ||
    event?.organizerName ||
    event?.owner?.fullName ||
    "Không rõ"
  );
}

export default function AdminEventDetail() {
  const params = useLocalSearchParams();
  const id = getSafeId(params.id);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (isInvalidRouteId(id)) {
      setLoading(false);
      showMessage("Lỗi", "Không tìm thấy ID sự kiện.", () => {
        router.replace("/(admin)/events" as any);
      });
      return;
    }

    setLoading(true);

    try {
      const response = await eventAdminService.getEventById(id);
      const eventData = response?.data?.event || response?.data;

      if (response?.success && eventData) {
        setEvent(eventData);
      } else {
        showMessage(
          "Lỗi",
          response?.message || "Không tìm thấy event.",
          () => {
            router.replace("/(admin)/events" as any);
          }
        );
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể tải event.", () => {
        router.replace("/(admin)/events" as any);
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [fetchEvent])
  );

  const handleApprove = async () => {
    if (!event || approving) return;

    const approveNow = async () => {
      setApproving(true);

      try {
        const response = await eventAdminService.approveEvent(id);

        if (response?.success) {
          showMessage(
            "Thành công",
            "Event đã được duyệt và hiển thị cho user đăng ký.",
            () => fetchEvent()
          );
        } else {
          showMessage("Lỗi", response?.message || "Không thể duyệt event.");
        }
      } catch (error: any) {
        showMessage(
          "Không thể duyệt event",
          error?.message ||
            "Event có thể đang trùng lịch tại cùng địa điểm/link meeting hoặc dữ liệu chưa hợp lệ."
        );
      } finally {
        setApproving(false);
      }
    };

    const webConfirm = askConfirm("Bạn có chắc muốn duyệt event này?");

    if (webConfirm === false) return;

    if (webConfirm === true) {
      await approveNow();
      return;
    }

    Alert.alert("Duyệt event", "Bạn có chắc muốn duyệt event này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Duyệt", onPress: approveNow },
    ]);
  };

  const handleReject = async () => {
    if (!event || rejecting) return;

    const defaultReason = "Event không phù hợp hoặc thiếu thông tin.";
    const inputReason = askPrompt("Nhập lý do từ chối:", defaultReason);

    if (Platform.OS === "web" && inputReason === null) return;

    const reason =
      typeof inputReason === "string" && inputReason.trim()
        ? inputReason.trim()
        : defaultReason;

    const rejectNow = async () => {
      setRejecting(true);

      try {
        const response = await eventAdminService.rejectEvent(id, reason);

        if (response?.success) {
          showMessage("Thành công", "Đã từ chối event.", () => fetchEvent());
        } else {
          showMessage("Lỗi", response?.message || "Không thể từ chối event.");
        }
      } catch (error: any) {
        showMessage("Lỗi", error?.message || "Không thể từ chối event.");
      } finally {
        setRejecting(false);
      }
    };

    if (Platform.OS === "web") {
      await rejectNow();
      return;
    }

    Alert.alert("Từ chối event", "Bạn có chắc muốn từ chối event này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Từ chối", style: "destructive", onPress: rejectNow },
    ]);
  };

  const goBackToEventList = () => {
    router.replace("/(admin)/events" as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButtonLight}
            onPress={goBackToEventList}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#064D3D"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Chi tiết sự kiện</Text>
        </View>

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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButtonLight}
            onPress={goBackToEventList}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#064D3D"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Không tìm thấy event</Text>
          <Text style={styles.subtitle}>Event không tồn tại hoặc đã bị xóa.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const approval = getApprovalMeta(event.approvalStatus);
  const isPending = event.approvalStatus === "pending";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconButtonLight}
            onPress={goBackToEventList}
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

        <Text style={styles.title}>Chi tiết sự kiện</Text>
        <Text style={styles.subtitle}>
          Admin kiểm tra thông tin, duyệt hoặc từ chối event.
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
                Người tạo: {getOrganizerName(event)}
              </Text>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: approval.bg }]}>
            <MaterialCommunityIcons
              name={approval.icon as any}
              size={16}
              color={approval.color}
            />
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
                name="account-outline"
                size={18}
                color="#00866B"
              />
              <Text style={styles.infoText}>
                Người tổ chức: {getOrganizerName(event)}
              </Text>
            </View>
          </View>

          {!!event.rejectedReason && (
            <View style={styles.rejectReasonBox}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
              />
              <Text style={styles.rejectReasonText}>
                Lý do từ chối: {event.rejectedReason}
              </Text>
            </View>
          )}

          {isPending ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.approveButton, approving && styles.disabled]}
                onPress={handleApprove}
                disabled={approving || rejecting}
              >
                {approving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionTextWhite}>Duyệt</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectButton, rejecting && styles.disabled]}
                onPress={handleReject}
                disabled={approving || rejecting}
              >
                {rejecting ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color="#DC2626"
                    />
                    <Text style={styles.actionTextRed}>Từ chối</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lockBox}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color="#00866B"
              />
              <Text style={styles.lockText}>
                Event đã được xử lý. Admin không cần xem danh sách người đăng ký.
              </Text>
            </View>
          )}
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
    marginBottom: 12,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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

  rejectReasonBox: {
    marginTop: 16,
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 8,
  },

  rejectReasonText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  approveButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  rejectButton: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  actionTextWhite: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },

  actionTextRed: {
    color: "#DC2626",
    fontWeight: "800",
    fontSize: 14,
  },

  disabled: {
    opacity: 0.6,
  },

  lockBox: {
    marginTop: 18,
    backgroundColor: "#E6F7F1",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 8,
  },

  lockText: {
    flex: 1,
    color: "#006B5C",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
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
});