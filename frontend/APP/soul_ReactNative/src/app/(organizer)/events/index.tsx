import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { eventOwnerService } from "@/services/eventApi";

type EventFilter = "all" | "pending" | "approved" | "rejected";

type OwnerEventItem = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string | null;
  eventType?: string;
  eventMode?: "online" | "offline";
  location?: string | null;
  meetingLink?: string | null;
  startDateTime?: string;
  endDateTime?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  status?: string;
  rejectedReason?: string | null;
  registeredCount?: number;
  capacity?: number | null;
  createdAt?: string;
};

const filters: { label: string; value: EventFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
];

function getEventId(event: OwnerEventItem) {
  return event._id || event.id || "";
}

function getEventsFromResponse(response: any): OwnerEventItem[] {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.events)) return response.data.events;
  if (Array.isArray(response?.events)) return response.events;
  return [];
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

function getEventTypeLabel(type?: string) {
  if (type === "workshop") return "Workshop";
  if (type === "talkshow") return "Talkshow";
  if (type === "webinar") return "Webinar";
  if (type === "community_event") return "Cộng đồng";
  return "Sự kiện";
}

function getEventModeLabel(mode?: string) {
  if (mode === "online") return "Online";
  if (mode === "offline") return "Offline";
  return "Chưa rõ";
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

export default function OrganizerEventsScreen() {
  const [events, setEvents] = useState<OwnerEventItem[]>([]);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await eventOwnerService.getMyEvents();

      if (response?.success === false) {
        Alert.alert(
          "Lỗi",
          response?.message || "Không thể tải event của bạn."
        );
        return;
      }

      setEvents(getEventsFromResponse(response));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải event của bạn.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [fetchEvents])
  );

  const counts = useMemo(() => {
    return {
      all: events.length,
      pending: events.filter((item) => item.approvalStatus === "pending")
        .length,
      approved: events.filter((item) => item.approvalStatus === "approved")
        .length,
      rejected: events.filter((item) => item.approvalStatus === "rejected")
        .length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((item) => item.approvalStatus === filter);
  }, [events, filter]);

  const openDetail = (event: OwnerEventItem) => {
    const id = getEventId(event);

    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    router.push(`/(organizer)/events/${id}` as any);
  };

  const openRegistrations = (event: OwnerEventItem) => {
    const id = getEventId(event);

    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    router.push(`/(organizer)/events/registrations/${id}` as any);
  };

  const openEdit = (event: OwnerEventItem) => {
    const id = getEventId(event);

    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    if (event.approvalStatus === "approved") {
      Alert.alert(
        "Không thể chỉnh sửa",
        "Event đã được admin duyệt nên không thể chỉnh sửa."
      );
      return;
    }

    router.push(`/(organizer)/events/edit/${id}` as any);
  };

  const handleDelete = async (event: OwnerEventItem) => {
    const id = getEventId(event);

    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    if (event.approvalStatus === "approved") {
      Alert.alert(
        "Không thể hủy",
        "Event đã được admin duyệt nên không thể hủy."
      );
      return;
    }

    const deleteNow = async () => {
      setDeletingId(id);

      try {
        const response = await eventOwnerService.deleteEvent(id);

        if (response?.success === false) {
          Alert.alert("Lỗi", response?.message || "Không thể hủy event.");
          return;
        }

        Alert.alert("Thành công", "Đã hủy event.");
        fetchEvents(true);
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể hủy event.");
      } finally {
        setDeletingId("");
      }
    };

    Alert.alert(
      "Hủy event",
      "Bạn có chắc muốn hủy event này? Chỉ event chưa được duyệt mới được hủy.",
      [
        { text: "Không", style: "cancel" },
        { text: "Hủy event", style: "destructive", onPress: deleteNow },
      ]
    );
  };

  const renderEvent = ({ item }: { item: OwnerEventItem }) => {
    const meta = getApprovalMeta(item.approvalStatus);
    const id = getEventId(item);
    const isApproved = item.approvalStatus === "approved";
    const canModify = !isApproved;
    const registeredCount = item.registeredCount ?? 0;
    const capacityText =
      item.capacity === null || item.capacity === undefined
        ? "Không giới hạn"
        : String(item.capacity);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.85}
        onPress={() => openDetail(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="calendar-star"
              size={28}
              color="#00866B"
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title || "Sự kiện chưa có tiêu đề"}
            </Text>

            <Text style={styles.eventMeta}>
              {getEventTypeLabel(item.eventType)} ·{" "}
              {getEventModeLabel(item.eventMode)}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <MaterialCommunityIcons
              name={meta.icon as any}
              size={15}
              color={meta.color}
            />
            <Text style={[styles.statusText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color="#64748B"
          />
          <Text style={styles.infoText}>
            {formatDateTime(item.startDateTime)} -{" "}
            {formatDateTime(item.endDateTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={18}
            color="#64748B"
          />
          <Text style={styles.infoText}>
            Số lượng đăng ký: {registeredCount}/{capacityText}
          </Text>
        </View>

        {isApproved ? (
          <View style={styles.lockBox}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={18}
              color="#047857"
            />
            <Text style={styles.lockText}>
              Event đã được admin duyệt. Không thể sửa hoặc hủy.
            </Text>
          </View>
        ) : null}

        {item.rejectedReason ? (
          <View style={styles.rejectBox}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color="#DC2626"
            />
            <Text style={styles.rejectText}>
              Lý do từ chối: {item.rejectedReason}
            </Text>
          </View>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailButton}
            activeOpacity={0.85}
            onPress={() => openDetail(item)}
          >
            <MaterialCommunityIcons
              name="eye-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.detailButtonText}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registrationButton}
            activeOpacity={0.85}
            onPress={() => openRegistrations(item)}
          >
            <MaterialCommunityIcons
              name="account-search-outline"
              size={18}
              color="#00866B"
            />
            <Text style={styles.registrationButtonText}>Người tham dự</Text>
          </TouchableOpacity>

          {canModify ? (
            <>
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.85}
                onPress={() => openEdit(item)}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={18}
                  color="#00866B"
                />
                <Text style={styles.editButtonText}>Sửa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.85}
                onPress={() => handleDelete(item)}
                disabled={deletingId === id}
              >
                {deletingId === id ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color="#DC2626"
                    />
                    <Text style={styles.deleteButtonText}>Hủy</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.iconButtonLight}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#064D3D"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButtonGreen}
            activeOpacity={0.8}
            onPress={() => router.push("/(organizer)/events/create" as any)}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Event của tôi</Text>
        <Text style={styles.subtitle}>
          Người tổ chức xem event đã tạo, số lượng đăng ký và chỉ được sửa/hủy
          khi admin chưa duyệt.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Chờ duyệt</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{counts.approved}</Text>
            <Text style={styles.statLabel}>Đã duyệt</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{counts.rejected}</Text>
            <Text style={styles.statLabel}>Từ chối</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((item) => {
            const active = filter === item.value;
            const count = counts[item.value];

            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.85}
                onPress={() => setFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={styles.loadingText}>Đang tải event của bạn...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item, index) => getEventId(item) || String(index)}
          renderItem={renderEvent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchEvents(true)}
              tintColor="#00866B"
            />
          }
          contentContainerStyle={
            filteredEvents.length ? styles.listContent : styles.emptyListContent
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-plus"
                size={54}
                color="#00866B"
              />
              <Text style={styles.emptyTitle}>Chưa có event nào</Text>
              <Text style={styles.emptyText}>
                Bấm nút + để tạo event mới cho cộng đồng SOUL.
              </Text>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("/(organizer)/events/create" as any)}
              >
                <Text style={styles.createButtonText}>+ Tạo event</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },

  statValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#064D3D",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "600",
  },

  filterWrap: {
    marginTop: 16,
    paddingLeft: 18,
    paddingBottom: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D8EFE8",
  },

  filterChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#49756C",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 34,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2F3EE",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E6F7F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#064D3D",
  },

  eventMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },

  lockBox: {
    marginTop: 12,
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },

  lockText: {
    flex: 1,
    color: "#047857",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  rejectBox: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },

  rejectText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },

  detailButton: {
    flexGrow: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  registrationButton: {
    flexGrow: 1,
    minWidth: 126,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E6F7F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
  },

  registrationButtonText: {
    color: "#00866B",
    fontSize: 13,
    fontWeight: "800",
  },

  editButton: {
    minWidth: 78,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#E6F7F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
  },

  editButtonText: {
    color: "#00866B",
    fontSize: 13,
    fontWeight: "800",
  },

  deleteButton: {
    minWidth: 78,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
  },

  createButton: {
    marginTop: 18,
    backgroundColor: "#00866B",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },

  createButtonText: {
    color: "#FFFFFF",
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

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064D3D",
    marginTop: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },
});