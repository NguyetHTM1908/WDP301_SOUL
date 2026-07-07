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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { eventOwnerService } from "@/services/eventApi";

type RegistrationStatusFilter = "all" | "registered" | "cancelled" | "attended";

type EventRegistration = {
  userId: any;
  status: "registered" | "cancelled" | "attended";
  registeredAt?: string;
  cancelledAt?: string | null;
};

const filters: { label: string; value: RegistrationStatusFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Đã đăng ký", value: "registered" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Đã tham dự", value: "attended" },
];

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

function getUserInfo(registration: EventRegistration) {
  if (typeof registration.userId === "string") {
    return {
      name: "Người dùng SOUL",
      email: "Không có email",
      phone: "Không có số điện thoại",
    };
  }

  return {
    name:
      registration.userId?.fullName ||
      registration.userId?.name ||
      "Người dùng SOUL",
    email: registration.userId?.email || "Không có email",
    phone: registration.userId?.phone || "Không có số điện thoại",
  };
}

function getStatusMeta(status: string) {
  if (status === "registered") {
    return {
      label: "Đã đăng ký",
      icon: "account-check-outline",
      color: "#047857",
      bg: "#DCFCE7",
    };
  }

  if (status === "attended") {
    return {
      label: "Đã tham dự",
      icon: "check-circle-outline",
      color: "#0369A1",
      bg: "#DBEAFE",
    };
  }

  return {
    label: "Đã hủy",
    icon: "account-cancel-outline",
    color: "#DC2626",
    bg: "#FEE2E2",
  };
}

export default function OrganizerEventRegistrations() {
  const params = useLocalSearchParams();
  const eventId = getSafeId(params.id);

  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<any>({
    totalRegistrations: 0,
    totalCancelled: 0,
    totalAttended: 0,
    capacity: null,
    remainingSlots: null,
  });

  const [filter, setFilter] = useState<RegistrationStatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRegistrations = useCallback(
    async (isRefresh = false) => {
      if (!eventId) {
        setLoading(false);
        Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await eventOwnerService.getEventRegistrations(
          eventId,
          "all",
          {
            page: 1,
            limit: 300,
          }
        );

        if (response?.success === false) {
          Alert.alert(
            "Lỗi",
            response?.message || "Không thể tải danh sách người tham dự."
          );
          return;
        }

        const event = response?.data?.event || {};
        const resultStats = response?.data?.stats || {};

        setEventTitle(event.title || "Danh sách người tham dự");

        setEventTime(
          `${formatDateTime(event.startDateTime)} - ${formatDateTime(
            event.endDateTime
          )}`
        );

        setRegistrations(response?.data?.registrations || []);

        setStats({
          totalRegistrations:
            resultStats.totalRegistrations ?? event.registeredCount ?? 0,
          totalCancelled: resultStats.totalCancelled ?? 0,
          totalAttended: resultStats.totalAttended ?? 0,
          capacity: resultStats.capacity ?? event.capacity ?? null,
          remainingSlots: resultStats.remainingSlots ?? null,
        });
      } catch (error: any) {
        Alert.alert(
          "Lỗi",
          error?.message || "Không thể tải danh sách người tham dự."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchRegistrations();
    }, [fetchRegistrations])
  );

  const counts = useMemo(() => {
    const registered = registrations.filter(
      (item) => item.status === "registered"
    ).length;

    const cancelled = registrations.filter(
      (item) => item.status === "cancelled"
    ).length;

    const attended = registrations.filter(
      (item) => item.status === "attended"
    ).length;

    return {
      all: registrations.length,
      registered,
      cancelled,
      attended,
    };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return registrations.filter((registration) => {
      const user = getUserInfo(registration);

      const matchesStatus = filter === "all" || registration.status === filter;

      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [filter, registrations, searchText]);

  const renderRegistration = ({ item }: { item: EventRegistration }) => {
    const user = getUserInfo(item);
    const meta = getStatusMeta(item.status);

    return (
      <View style={styles.registrationCard}>
        <View style={styles.registrationHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: meta.bg }]}>
            <MaterialCommunityIcons
              name={meta.icon as any}
              size={24}
              color={meta.color}
            />
          </View>

          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{user.name}</Text>
            <Text style={styles.participantMeta}>{user.email}</Text>
            <Text style={styles.participantMeta}>{user.phone}</Text>
          </View>

          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <View style={styles.timelineRow}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={17}
            color="#64748B"
          />
          <Text style={styles.timelineText}>
            Đăng ký lúc: {formatDateTime(item.registeredAt)}
          </Text>
        </View>

        {item.cancelledAt ? (
          <View style={styles.timelineRow}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={17}
              color="#DC2626"
            />
            <Text style={[styles.timelineText, { color: "#DC2626" }]}>
              Hủy lúc: {formatDateTime(item.cancelledAt)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const capacityText =
    stats.capacity === null || stats.capacity === undefined
      ? "Không giới hạn"
      : String(stats.capacity);

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
            onPress={() => fetchRegistrations(true)}
          >
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Người tham dự</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {eventTitle || "Danh sách người tham dự event"}
        </Text>

        <Text style={styles.timeText}>{eventTime}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalRegistrations || 0}</Text>
            <Text style={styles.statLabel}>Đăng ký</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalAttended || 0}</Text>
            <Text style={styles.statLabel}>Tham dự</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>{capacityText}</Text>
            <Text style={styles.statLabel}>Sức chứa</Text>
          </View>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm theo tên, email, số điện thoại..."
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
          <Text style={styles.loadingText}>
            Đang tải danh sách người tham dự...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRegistrations}
          keyExtractor={(item, index) => {
            const userId =
              typeof item.userId === "string" ? item.userId : item.userId?._id;

            return `${userId || "user"}-${item.status}-${index}`;
          }}
          renderItem={renderRegistration}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRegistrations(true)}
              tintColor="#00866B"
            />
          }
          contentContainerStyle={
            filteredRegistrations.length
              ? styles.listContent
              : styles.emptyListContent
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={54}
                color="#00866B"
              />
              <Text style={styles.emptyTitle}>Chưa có người tham dự</Text>
              <Text style={styles.emptyText}>
                Chưa có ai đăng ký hoặc không có dữ liệu khớp bộ lọc.
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
    fontSize: 15,
    color: "#49756C",
    marginTop: 6,
    lineHeight: 21,
    fontWeight: "700",
  },

  timeText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    fontWeight: "600",
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
    fontSize: 19,
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

  registrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2F3EE",
  },

  registrationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  participantInfo: {
    flex: 1,
  },

  participantName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#064D3D",
  },

  participantMeta: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },

  timelineText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
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