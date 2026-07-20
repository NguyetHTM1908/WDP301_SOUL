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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { eventAdminService } from "@/services/eventApi";

type EventFilter = "all" | "pending" | "approved" | "rejected";

type EventItem = {
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
  organizerName?: string | null;
  speakerName?: string | null;
  createdBy?: any;
  createdAt?: string;
};

const filters: { label: string; value: EventFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
];

function getEventId(event: EventItem) {
  return event._id || event.id || "";
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

function getStatusMeta(status?: string) {
  if (status === "approved") {
    return {
      label: "Đã duyệt",
      icon: "check-circle-outline",
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

function getEventsFromResponse(response: any): EventItem[] {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.events)) return response.data.events;
  if (Array.isArray(response?.events)) return response.events;
  return [];
}

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<EventFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await eventAdminService.getAdminAllEvents();

      if (response?.success === false) {
        Alert.alert(
          "Lỗi",
          response?.message || "Không thể tải danh sách sự kiện."
        );
        return;
      }

      setEvents(getEventsFromResponse(response));
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error?.message || "Đã xảy ra lỗi khi tải danh sách sự kiện."
      );
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
    const keyword = searchText.trim().toLowerCase();

    return events.filter((event) => {
      const matchesFilter =
        filter === "all" || event.approvalStatus === filter;

      const searchableText = [
        event.title,
        event.description,
        event.organizerName,
        event.speakerName,
        event.createdBy?.fullName,
        event.createdBy?.email,
        event.location,
        event.eventType,
        event.eventMode,
        event.approvalStatus,
        event.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!keyword || searchableText.includes(keyword));
    });
  }, [events, filter, searchText]);

  const openEventDetail = (event: EventItem) => {
    const id = getEventId(event);

    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    router.push(`/(admin)/events/${id}` as any);
  };

  const renderEvent = ({ item }: { item: EventItem }) => {
    const meta = getStatusMeta(item.approvalStatus);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.85}
        onPress={() => openEventDetail(item)}
      >
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="calendar-heart"
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
            name="account-outline"
            size={18}
            color="#64748B"
          />
          <Text style={styles.infoText} numberOfLines={1}>
            Người tạo:{" "}
            {item.createdBy?.fullName || item.organizerName || "Không rõ"}
          </Text>
        </View>

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
            name={
              item.eventMode === "online"
                ? "video-outline"
                : "map-marker-outline"
            }
            size={18}
            color="#64748B"
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.eventMode === "online"
              ? item.meetingLink || "Chưa có link online"
              : item.location || "Chưa có địa điểm"}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailButton}
            activeOpacity={0.85}
            onPress={() => openEventDetail(item)}
          >
            <MaterialCommunityIcons
              name="eye-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
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
            onPress={() => fetchEvents(true)}
          >
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Quản lý sự kiện</Text>
        <Text style={styles.subtitle}>
          Admin xem tất cả event, duyệt event và từ chối event.
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

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sự kiện, người tổ chức, diễn giả..."
        placeholderTextColor="#8CA8A1"
        value={searchText}
        onChangeText={setSearchText}
      />

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
          <Text style={styles.loadingText}>Đang tải danh sách sự kiện...</Text>
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
                name="calendar-search"
                size={52}
                color="#00866B"
              />
              <Text style={styles.emptyTitle}>Không có sự kiện</Text>
              <Text style={styles.emptyText}>
                Chưa có sự kiện nào khớp với bộ lọc hiện tại.
              </Text>
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

  searchInput: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: "#064D3D",
    borderWidth: 1,
    borderColor: "#D8EFE8",
  },

  filterWrap: {
    marginTop: 14,
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

  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  detailButton: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
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