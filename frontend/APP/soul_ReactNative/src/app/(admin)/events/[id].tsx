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
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import { getFillRate } from "@/utils/eventRegistration";

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
  upcoming: { label: "Sắp diễn ra", bgStyle: s.badgeYellow, textStyle: s.badgeYellowText },
  ongoing: { label: "Đang diễn ra", bgStyle: s.badgeGreen, textStyle: s.badgeGreenText },
  completed: { label: "Đã kết thúc", bgStyle: s.badgeBlue, textStyle: s.badgeBlueText },
  cancelled: { label: "Đã hủy", bgStyle: s.badgeRed, textStyle: s.badgeRedText },
};

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Thời gian không hợp lệ";

  return date.toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
            "Event đã được duyệt, khóa chỉnh sửa và hiển thị cho user đăng ký.",
            () => fetchEvent()
          );
        } else {
          showMessage("Lỗi", response.message || "Không thể duyệt event.");
        }
      } catch (error: any) {
        showMessage(
          "Không thể duyệt event",
          error?.message ||
            "Event có thể đang trùng lịch tại cùng địa điểm hoặc dữ liệu chưa hợp lệ."
        );
      } finally {
        setApproving(false);
      }
    };

    const webConfirm = askConfirm(
      "Duyệt event này? Backend sẽ check trùng lịch cùng địa điểm trước khi approve."
    );

    if (webConfirm === false) return;
    if (webConfirm === true) {
      await approveNow();
      return;
    }

    Alert.alert(
      "Duyệt event",
      "Backend sẽ check trùng lịch cùng địa điểm trước khi approve.",
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

        <ActivityIndicator size="large" color="#00866B" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!event) return null;

  const approval = approvalMeta[event.approvalStatus || "pending"];
  const schedule = scheduleMeta[event.status || "upcoming"];
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

          <View style={[s.badge, approval.bgStyle]}>
            <MaterialCommunityIcons
              name={approval.icon}
              size={14}
              color={
                event.approvalStatus === "approved"
                  ? "#047857"
                  : event.approvalStatus === "rejected"
                  ? "#DC2626"
                  : "#B45309"
              }
            />
            <Text style={[s.badgeText, approval.textStyle]}>
              {approval.label}
            </Text>
          </View>
        </View>

        <Text style={s.adminTitle}>Event Detail</Text>
        <Text style={s.adminSubtitle}>
          Review schedule, location, owner information and approve only if there is no conflict.
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.listContent}>
        {isApproved ? (
          <TouchableOpacity
            style={s.registrationsButton}
            onPress={() => router.push(`/(admin)/events/registrations/${id}`)}
          >
            <View style={s.registrationsIcon}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={25}
                color="#00866B"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.registrationsTitle}>Quản lý người đăng ký</Text>
              <Text style={s.registrationsSubtitle}>
                Xem danh sách, trạng thái và thời gian đăng ký
              </Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={24} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}

        <View style={s.detailCard}>
          <Text style={s.detailTitle}>{event.title}</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
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

            {isApproved ? (
              <View style={[s.badge, s.badgeBlue]}>
                <Text style={[s.badgeText, s.badgeBlueText]}>
                  Locked after approval
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.infoPanel}>
            <View style={s.infoRow}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={19} color="#00866B" />
              <Text style={s.infoText}>Bắt đầu: {formatDate(event.startDateTime)}</Text>
            </View>

            <View style={s.infoRow}>
              <MaterialCommunityIcons name="calendar-check-outline" size={19} color="#00866B" />
              <Text style={s.infoText}>Kết thúc: {formatDate(event.endDateTime)}</Text>
            </View>

            <View style={s.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={19} color="#00866B" />
              <Text style={s.infoText}>
                {event.location || event.meetingLink || "Chưa xác định"}
              </Text>
            </View>

            <View style={s.infoRow}>
              <MaterialCommunityIcons name="account-outline" size={19} color="#00866B" />
              <Text style={s.infoText}>
                Owner: {event.createdBy?.fullName || "Chưa xác định"}
              </Text>
            </View>

            <View style={[s.infoRow, { marginBottom: 0 }]}>
              <MaterialCommunityIcons name="microphone-outline" size={19} color="#00866B" />
              <Text style={s.infoText}>
                Speaker: {event.speakerName || "Chưa cập nhật"}
              </Text>
            </View>
          </View>

          {event.rejectedReason ? (
            <View style={s.rejectionBox}>
              <Text style={s.rejectionTitle}>Lý do từ chối</Text>
              <Text style={s.rejectionText}>{event.rejectedReason}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.statsRow}>
          <View style={s.statMiniCard}>
            <Text style={s.statMiniValue}>{registeredCount}</Text>
            <Text style={s.statMiniLabel}>Đã đăng ký</Text>
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

        <View style={s.detailCard}>
          <Text style={s.detailSectionTitle}>Mô tả chi tiết</Text>
          <Text style={s.description}>
            {event.description || "Chưa có mô tả."}
          </Text>
        </View>

        {isPending ? (
          <View style={s.decisionBox}>
            <Text style={s.decisionTitle}>Admin Decision</Text>
            <Text style={s.decisionText}>
              Khi approve, backend sẽ kiểm tra trùng lịch cùng địa điểm và khóa event sau khi duyệt.
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[s.approveButton, approving && { opacity: 0.65 }]}
                onPress={handleApprove}
                disabled={approving || rejecting}
              >
                <Text style={s.actionButtonText}>
                  {approving ? "Approving..." : "Approve"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.rejectButton, rejecting && { opacity: 0.65 }]}
                onPress={handleReject}
                disabled={approving || rejecting}
              >
                <Text style={s.actionButtonText}>
                  {rejecting ? "Rejecting..." : "Reject"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.noticeBox}>
            <Text style={s.noticeText}>
              {isApproved
                ? "Event đã được duyệt, đã khóa chỉnh sửa và đang hiển thị cho user đăng ký."
                : "Event đã bị từ chối. Owner có thể chỉnh sửa lại và gửi admin duyệt lại."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}