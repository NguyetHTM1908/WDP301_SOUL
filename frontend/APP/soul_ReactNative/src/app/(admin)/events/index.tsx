import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import { getComputedEventStatus, getFillRate } from "@/utils/eventRegistration";

const approvalFilters = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

const scheduleMeta: Record<string, any> = {
  upcoming: { label: "Upcoming", bgStyle: s.badgeYellow, textStyle: s.badgeYellowText },
  ongoing: { label: "Ongoing", bgStyle: s.badgeGreen, textStyle: s.badgeGreenText },
  completed: { label: "Completed", bgStyle: s.badgeBlue, textStyle: s.badgeBlueText },
  cancelled: { label: "Cancelled", bgStyle: s.badgeRed, textStyle: s.badgeRedText },
};

const approvalMeta: Record<string, any> = {
  pending: { label: "Pending Review", bgStyle: s.badgeYellow, textStyle: s.badgeYellowText },
  approved: { label: "Approved", bgStyle: s.badgeGreen, textStyle: s.badgeGreenText },
  rejected: { label: "Rejected", bgStyle: s.badgeRed, textStyle: s.badgeRedText },
};

function formatDate(value?: string) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Thời gian không hợp lệ";

  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getApprovalInfo(status?: string) {
  return approvalMeta[status || "pending"] || approvalMeta.pending;
}

export default function AdminEventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [approvalFilter, setApprovalFilter] = useState("pending");
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);

    try {
      const response = await eventAdminService.getAdminAllEvents({
        approvalStatus: approvalFilter === "all" ? undefined : (approvalFilter as any),
        page: 1,
        limit: 100,
      });

      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải danh sách event.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [approvalFilter])
  );

  const renderEvent = ({ item }: { item: any }) => {
    const approval = getApprovalInfo(item.approvalStatus);
    const computedStatus = getComputedEventStatus(item);
    const schedule = scheduleMeta[computedStatus] || scheduleMeta.upcoming;
    const fillRate = getFillRate(item.capacity, item.registeredCount || 0);

    return (
      <TouchableOpacity
        style={[
          s.card,
          item.approvalStatus === "approved" && s.cardApprovedGlow,
          item.approvalStatus === "pending" && s.cardPendingGlow,
          item.approvalStatus === "rejected" && s.cardRejectedGlow,
        ]}
        activeOpacity={0.8}
        onPress={() => router.push(`/(admin)/events/${item._id}`)}
      >
        <View style={s.cardTop}>
          <View
            style={[
              s.eventIconWrap,
              item.approvalStatus === "pending" && s.eventIconWrapWarning,
              item.approvalStatus === "rejected" && s.eventIconWrapDanger,
            ]}
          >
            <MaterialCommunityIcons
              name="calendar-search"
              size={28}
              color={
                item.approvalStatus === "approved"
                  ? "#00866B"
                  : item.approvalStatus === "rejected"
                  ? "#DC2626"
                  : "#B45309"
              }
            />
          </View>

          <View style={s.cardTitleBlock}>
            <Text style={s.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={s.cardSubtitle}>
              Owner: {item.createdBy?.fullName || "Unknown"}
            </Text>
          </View>

          <View style={[s.badge, approval.bgStyle]}>
            <Text style={[s.badgeText, approval.textStyle]}>
              {approval.label}
            </Text>
          </View>
        </View>

        <View style={s.infoPanel}>
          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar-clock-outline" size={18} color="#00866B" />
            <Text style={s.infoText}>Bắt đầu: {formatDate(item.startDateTime)}</Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons name="calendar-check-outline" size={18} color="#00866B" />
            <Text style={s.infoText}>Kết thúc: {formatDate(item.endDateTime)}</Text>
          </View>

          <View style={[s.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color="#00866B" />
            <Text style={s.infoText}>
              {item.location || item.meetingLink || "Chưa xác định"}
            </Text>
          </View>
        </View>

        <View style={s.statsRow}>
          <View style={s.statMiniCard}>
            <Text style={s.statMiniValue}>{item.registeredCount || 0}</Text>
            <Text style={s.statMiniLabel}>Đăng ký</Text>
          </View>

          <View style={s.statMiniCard}>
            <Text style={s.statMiniValue}>{item.capacity || "∞"}</Text>
            <Text style={s.statMiniLabel}>Sức chứa</Text>
          </View>

          <View style={s.statMiniCard}>
            <Text style={s.statMiniValue}>{fillRate}%</Text>
            <Text style={s.statMiniLabel}>Lấp đầy</Text>
          </View>
        </View>

        <View style={{ marginTop: 14, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <View style={[s.badge, schedule.bgStyle]}>
            <Text style={[s.badgeText, schedule.textStyle]}>
              {schedule.label}
            </Text>
          </View>

          {item.lockAfterApproval && item.approvalStatus === "approved" ? (
            <View style={[s.badge, s.badgeBlue]}>
              <Text style={[s.badgeText, s.badgeBlueText]}>Locked</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const pendingCount = events.filter((item) => item.approvalStatus === "pending").length;
  const approvedCount = events.filter((item) => item.approvalStatus === "approved").length;
  const rejectedCount = events.filter((item) => item.approvalStatus === "rejected").length;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.adminHeader}>
        <View style={s.adminHeaderTop}>
          <TouchableOpacity style={s.iconButtonLight} onPress={() => router.replace("/(admin)")}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <View style={[s.badge, s.badgeBlue]}>
            <MaterialCommunityIcons name="shield-check-outline" size={14} color="#0369A1" />
            <Text style={[s.badgeText, s.badgeBlueText]}>Admin Review</Text>
          </View>
        </View>

        <Text style={s.adminTitle}>Event Approval</Text>
        <Text style={s.adminSubtitle}>
          Review owner-created events, approve safe schedules, and prevent location/time conflicts.
        </Text>

        <View style={s.heroStats}>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{pendingCount}</Text>
            <Text style={s.heroStatLabel}>Pending</Text>
          </View>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{approvedCount}</Text>
            <Text style={s.heroStatLabel}>Approved</Text>
          </View>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{rejectedCount}</Text>
            <Text style={s.heroStatLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterScrollContent}
      >
        {approvalFilters.map((filter) => {
          const active = approvalFilter === filter.value;

          return (
            <TouchableOpacity
              key={filter.value}
              style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => setApprovalFilter(filter.value)}
            >
              <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#00866B" style={{ marginTop: 45 }} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchEvents}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View style={s.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="calendar-search"
                  size={45}
                  color="#8FB9AE"
                />
              </View>
              <Text style={s.emptyTitle}>Không có event phù hợp</Text>
              <Text style={s.emptyText}>Đổi filter hoặc kéo xuống để làm mới dữ liệu.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}