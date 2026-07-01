import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import {
  formatEventDateTime,
  getComputedEventStatus,
  getEventModeLabel,
  getEventPlaceText,
  getFillRate,
} from "@/utils/eventPolicy";

const approvalMeta: Record<string, any> = {
  pending: {
    label: "Pending Review",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
    icon: "clock-outline",
  },
  approved: {
    label: "Approved",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
    icon: "check-decagram",
  },
  rejected: {
    label: "Rejected",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
    icon: "close-circle-outline",
  },
};

const scheduleMeta: Record<string, any> = {
  upcoming: {
    label: "Sắp diễn ra",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
  },
  ongoing: {
    label: "Đang diễn ra",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
  },
  completed: {
    label: "Đã kết thúc",
    bgStyle: s.badgeBlue,
    textStyle: s.badgeBlueText,
  },
  cancelled: {
    label: "Đã hủy",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
  },
};

function showMessage(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    const alertFn = (globalThis as any).alert;
    if (typeof alertFn === "function") alertFn(`${title}: ${message}`);
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
    return typeof promptFn === "function" ? promptFn(message, defaultValue) : defaultValue;
  }

  return defaultValue;
}

export default function AdminEventDetail() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchEvent = async () => {
    if (!id) return;

    setLoading(true);

    try {
      const response = await eventAdminService.getEventById(id);

      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        showMessage("Lỗi", "Không tìm thấy event.", () => {
          router.replace("/(admin)/events");
        });
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể tải event.", () => {
        router.replace("/(admin)/events");
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [id])
  );

  const handleApprove = async () => {
    if (!event || approving) return;

    const approveNow = async () => {
      setApproving(true);

      try {
        const response = await eventAdminService.approveEvent(id);

        if (response.success) {
          showMessage(
            "Thành công",
            "Event đã được duyệt và hiển thị cho user đăng ký.",
            () => fetchEvent()
          );
        } else {
          showMessage("Lỗi", response.message || "Không thể duyệt event.");
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

    const webConfirm = askConfirm(
      "Duyệt event này? Backend sẽ check trùng lịch cùng địa điểm/link meeting trước khi approve."
    );

    if (webConfirm === false) return;
    if (webConfirm === true) {
      await approveNow();
      return;
    }

    Alert.alert(
      "Duyệt event",
      "Backend sẽ check trùng lịch cùng địa điểm/link meeting trước khi approve.",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Duyệt", onPress: approveNow },
      ]
    );
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

        if (response.success) {
          showMessage("Thành công", "Đã từ chối event.", () => fetchEvent());
        } else {
          showMessage("Lỗi", response.message || "Không thể từ chối event.");
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

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.adminHeader}>
          <View style={s.adminHeaderTop}>
            <TouchableOpacity
              style={s.iconButtonLight}
              onPress={() => router.replace("/(admin)/events")}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
            </TouchableOpacity>
          </View>

          <Text style={s.adminTitle}>Event Detail</Text>
        </View>

        <View style={s.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={s.loadingText}>Đang tải event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) return null;

  const approval = approvalMeta[event.approvalStatus || "pending"];
  const computedStatus = getComputedEventStatus(event);
  const schedule = scheduleMeta[computedStatus] || scheduleMeta.upcoming;
  const registeredCount = event.registeredCount || 0;
  const fillRate = getFillRate(event.capacity, registeredCount);
  const isPending = event.approvalStatus === "pending";
  const isApproved = event.approvalStatus === "approved";

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.adminHeader}>
        <View style={s.adminHeaderTop}>
          <TouchableOpacity
            style={s.iconButtonLight}
            onPress={() => router.replace("/(admin)/events")}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <TouchableOpacity style={s.iconButtonGreen} onPress={() => fetchEvent()}>
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={s.adminTitle}>Event Detail</Text>
        <Text style={s.adminSubtitle}>
          Kiểm tra thông tin, duyệt hoặc từ chối event.
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.listContent}>
        <View style={s.card}>
          <View style={s.cardTop}>
            <View
              style={[
                s.eventIconWrap,
                event.approvalStatus === "pending" && s.eventIconWrapWarning,
                event.approvalStatus === "rejected" && s.eventIconWrapDanger,
              ]}
            >
              <MaterialCommunityIcons
                name={approval.icon}
                size={30}
                color={
                  event.approvalStatus === "approved"
                    ? "#00866B"
                    : event.approvalStatus === "rejected"
                    ? "#DC2626"
                    : "#B45309"
                }
              />
            </View>

            <View style={s.cardTitleBlock}>
              <Text style={s.cardTitle}>{event.title}</Text>
              <Text style={s.cardSubtitle}>
                Organizer: {event.createdBy?.fullName || "Unknown"}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 14, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <View style={[s.badge, approval.bgStyle]}>
              <Text style={[s.badgeText, approval.textStyle]}>
                {approval.label}
              </Text>
            </View>

            <View style={[s.badge, schedule.bgStyle]}>
              <Text style={[s.badgeText, schedule.textStyle]}>
                {schedule.label}
              </Text>
            </View>
          </View>

          {!!event.description && <Text style={s.description}>{event.description}</Text>}

          <View style={s.infoPanel}>
            <View style={s.infoRow}>
              <MaterialCommunityIcons name="calendar-clock" size={18} color="#00866B" />
              <Text style={s.infoText}>
                Bắt đầu: {formatEventDateTime(event.startDateTime)}
              </Text>
            </View>

            <View style={s.infoRow}>
              <MaterialCommunityIcons name="calendar-check" size={18} color="#00866B" />
              <Text style={s.infoText}>
                Kết thúc: {formatEventDateTime(event.endDateTime)}
              </Text>
            </View>

            <View style={s.infoRow}>
              <MaterialCommunityIcons
                name={event.eventMode === "online" ? "video-outline" : "map-marker"}
                size={18}
                color="#00866B"
              />
              <Text style={s.infoText}>
                {getEventModeLabel(event)} · {getEventPlaceText(event)}
              </Text>
            </View>

            <View style={[s.infoRow, { marginBottom: 0 }]}>
              <MaterialCommunityIcons name="link-variant" size={18} color="#00866B" />
              <Text style={s.infoText}>
                Location key: {event.locationKey || "Chưa có"}
              </Text>
            </View>
          </View>

          <View style={s.statsRow}>
            <View style={s.statMiniCard}>
              <Text style={s.statMiniValue}>{registeredCount}</Text>
              <Text style={s.statMiniLabel}>Đăng ký</Text>
            </View>

            <View style={s.statMiniCard}>
              <Text style={s.statMiniValue}>{event.capacity || "∞"}</Text>
              <Text style={s.statMiniLabel}>Sức chứa</Text>
            </View>

            <View style={s.statMiniCard}>
              <Text style={s.statMiniValue}>{fillRate}%</Text>
              <Text style={s.statMiniLabel}>Lấp đầy</Text>
            </View>
          </View>

          <View style={s.progressBlock}>
            <View style={s.progressHeader}>
              <Text style={s.progressText}>Fill rate</Text>
              <Text style={s.progressText}>{fillRate}%</Text>
            </View>

            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${fillRate}%` }]} />
            </View>
          </View>

          {!!event.rejectedReason && (
            <View
              style={[
                s.infoPanel,
                { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
              ]}
            >
              <View style={[s.infoRow, { marginBottom: 0 }]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={[s.infoText, { color: "#DC2626" }]}>
                  Lý do từ chối: {event.rejectedReason}
                </Text>
              </View>
            </View>
          )}

          {isPending && (
            <View style={s.adminActions}>
              <TouchableOpacity
                style={[s.approveButton, approving && s.disabled]}
                onPress={handleApprove}
                disabled={approving || rejecting}
              >
                {approving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                    <Text style={s.actionTextWhite}>Duyệt</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.rejectButton, rejecting && s.disabled]}
                onPress={handleReject}
                disabled={approving || rejecting}
              >
                {rejecting ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="close" size={20} color="#DC2626" />
                    <Text style={s.actionTextRed}>Từ chối</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {isApproved && (
            <TouchableOpacity
              style={s.primaryButton}
              onPress={() => router.push(`/(admin)/events/${id}/registrations`)}
            >
              <MaterialCommunityIcons name="account-group" size={20} color="#FFFFFF" />
              <Text style={s.primaryButtonText}>Xem người đăng ký</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}