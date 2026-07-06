import React, { useCallback, useMemo, useState } from "react";
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
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import {
  formatEventDateTime,
  getComputedEventStatus,
  getEventModeLabel,
  getEventPlaceText,
  getFillRate,
} from "@/utils/eventPolicy";

const approvalFilters = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

const scheduleMeta: Record<string, any> = {
  upcoming: {
    label: "Upcoming",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
  },
  ongoing: {
    label: "Ongoing",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
  },
  completed: {
    label: "Completed",
    bgStyle: s.badgeBlue,
    textStyle: s.badgeBlueText,
  },
  cancelled: {
    label: "Cancelled",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
  },
};

const approvalMeta: Record<string, any> = {
  pending: {
    label: "Pending Review",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
  },
  approved: {
    label: "Approved",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
  },
  rejected: {
    label: "Rejected",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
  },
};

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
        approvalStatus:
          approvalFilter === "all" ? undefined : (approvalFilter as any),
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

  const stats = useMemo(() => {
    return {
      total: events.length,
      pending: events.filter((item) => item.approvalStatus === "pending").length,
      approved: events.filter((item) => item.approvalStatus === "approved").length,
    };
  }, [events]);

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
              name={
                item.eventMode === "online"
                  ? "video-outline"
                  : "map-marker-outline"
              }
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
              Organizer: {item.createdBy?.fullName || "Unknown"}
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
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              Bắt đầu: {formatEventDateTime(item.startDateTime)}
            </Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              Kết thúc: {formatEventDateTime(item.endDateTime)}
            </Text>
          </View>

          <View style={[s.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons
              name={
                item.eventMode === "online"
                  ? "video-outline"
                  : "map-marker-outline"
              }
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              {getEventModeLabel(item)} · {getEventPlaceText(item)}
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

        <View style={{ marginTop: 14, flexDirection: "row", gap: 8 }}>
          <View style={[s.badge, schedule.bgStyle]}>
            <Text style={[s.badgeText, schedule.textStyle]}>
              {schedule.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.adminHeader}>
        <View style={s.adminHeaderTop}>
          <TouchableOpacity
            style={s.iconButtonLight}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={s.iconButtonGreen}
            onPress={fetchEvents}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={s.adminTitle}>Event Management</Text>
        <Text style={s.adminSubtitle}>
          Admin chỉ duyệt, từ chối và xem danh sách người đăng ký.
        </Text>

        <View style={s.heroStats}>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{stats.total}</Text>
            <Text style={s.heroStatLabel}>Tổng</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{stats.pending}</Text>
            <Text style={s.heroStatLabel}>Chờ duyệt</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{stats.approved}</Text>
            <Text style={s.heroStatLabel}>Đã duyệt</Text>
          </View>
        </View>
      </View>

      <View style={s.filterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {approvalFilters.map((item) => {
            const active = approvalFilter === item.value;

            return (
              <TouchableOpacity
                key={item.value}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setApprovalFilter(item.value)}
                activeOpacity={0.85}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={s.loadingText}>Đang tải event...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEvent}
          contentContainerStyle={events.length ? s.listContent : undefined}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-remove-outline"
                size={42}
                color="#00866B"
              />
              <Text style={s.emptyTitle}>Chưa có event</Text>
              <Text style={s.emptyText}>
                Không tìm thấy event phù hợp với bộ lọc hiện tại.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}