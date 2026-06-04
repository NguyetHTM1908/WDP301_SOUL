import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";

type RegistrationStatusFilter = "all" | "registered" | "cancelled";

type RegistrationUser = {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string | null;
};

type EventRegistration = {
  userId: RegistrationUser | string;
  status: "registered" | "cancelled";
  registeredAt?: string;
  cancelledAt?: string | null;
};

type RegistrationStats = {
  totalRegistrations: number;
  totalCancelled: number;
};

const filters: { label: string; value: RegistrationStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Cancelled", value: "cancelled" },
];

const getUserId = (registration: EventRegistration) => {
  if (typeof registration.userId === "string") {
    return registration.userId;
  }

  return registration.userId._id || "";
};

const getUserInfo = (registration: EventRegistration) => {
  if (typeof registration.userId === "string") {
    return {
      name: "Nguoi dung",
      email: "Khong co email",
      phone: "Khong co so dien thoai",
    };
  }

  return {
    name: registration.userId.fullName || "Nguoi dung",
    email: registration.userId.email || "Khong co email",
    phone: registration.userId.phone || "Khong co so dien thoai",
  };
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chua cap nhat";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminEventRegistrations() {
  const params = useLocalSearchParams();
  const eventId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);

  const [eventTitle, setEventTitle] = useState("");
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<RegistrationStats>({
    totalRegistrations: 0,
    totalCancelled: 0,
  });
  const [filter, setFilter] = useState<RegistrationStatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const response = await eventAdminService.getEventRegistrations(
        eventId,
        "all",
      );

      if (response.success && response.data) {
        setEventTitle(response.data.event?.title || "");
        setRegistrations(response.data.registrations || []);
        setStats({
          totalRegistrations:
            response.data.stats?.totalRegistrations ??
            response.data.event?.registeredCount ??
            0,
          totalCancelled: response.data.stats?.totalCancelled ?? 0,
        });
      }
    } catch (error: any) {
      Alert.alert(
        "Loi",
        error.message || "Khong the tai danh sach nguoi dang ky",
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      fetchRegistrations();
    }, [fetchRegistrations]),
  );

  const counts = useMemo(() => {
    const registered = registrations.filter(
      (item) => item.status === "registered",
    ).length;
    const cancelled = registrations.filter(
      (item) => item.status === "cancelled",
    ).length;

    return {
      all: registrations.length,
      registered,
      cancelled,
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
    const isRegistered = item.status === "registered";

    return (
      <View style={screenStyles.registrationCard}>
        <View style={screenStyles.registrationHeader}>
          <View style={screenStyles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={screenStyles.userInfo}>
            <Text style={screenStyles.participantName}>{user.name}</Text>
            <Text style={screenStyles.participantMeta}>{user.email}</Text>
            <Text style={screenStyles.participantMeta}>{user.phone}</Text>
          </View>
          <View
            style={[
              screenStyles.statusPill,
              isRegistered
                ? screenStyles.registeredPill
                : screenStyles.cancelledPill,
            ]}
          >
            <Text
              style={[
                screenStyles.statusText,
                isRegistered
                  ? screenStyles.registeredText
                  : screenStyles.cancelledText,
              ]}
            >
              {isRegistered ? "Registered" : "Cancelled"}
            </Text>
          </View>
        </View>

        <View style={screenStyles.registeredAtRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={17}
            color="#64748B"
          />
          <View>
            <Text style={screenStyles.metaLabel}>Thoi gian dang ky</Text>
            <Text style={screenStyles.metaValue}>
              {formatDateTime(item.registeredAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <View style={screenStyles.header}>
        <TouchableOpacity
          style={screenStyles.iconButton}
          onPress={() => router.replace(`/(admin)/events/${eventId}`)}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.dark}
          />
        </TouchableOpacity>
        <View style={screenStyles.headerTextWrap}>
          <Text style={screenStyles.headerTitle}>Người đăng kí</Text>
          <Text
            style={screenStyles.headerSubtitle}
            numberOfLines={1}
          >
            {eventTitle || "Event registrations"}
          </Text>
        </View>
        <View style={screenStyles.headerSpacer} />
      </View>

      <FlatList
        data={filteredRegistrations}
        keyExtractor={(item) =>
          getUserId(item) || `${item.status}-${item.registeredAt}`
        }
        renderItem={renderRegistration}
        refreshing={loading}
        onRefresh={fetchRegistrations}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View>
            <View style={screenStyles.statsRow}>
              <View style={screenStyles.statCard}>
                <MaterialCommunityIcons
                  name="account-check-outline"
                  size={22}
                  color={colors.primary}
                />
                <Text style={screenStyles.statValue}>
                  {stats.totalRegistrations}
                </Text>
                <Text style={screenStyles.statLabel}>Registered Count</Text>
              </View>
              <View style={screenStyles.statCard}>
                <MaterialCommunityIcons
                  name="account-cancel-outline"
                  size={22}
                  color="#EF4444"
                />
                <Text style={screenStyles.statValue}>
                  {stats.totalCancelled}
                </Text>
                <Text style={screenStyles.statLabel}>Cancelled Count</Text>
              </View>
            </View>

            <View style={screenStyles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#64748B"
              />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tim theo ten, email, so dien thoai"
                placeholderTextColor="#94A3B8"
                style={screenStyles.searchInput}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={screenStyles.filterRow}>
              {filters.map((item) => {
                const active = filter === item.value;
                const count = counts[item.value];

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      screenStyles.filterButton,
                      active && screenStyles.activeFilter,
                    ]}
                    onPress={() => setFilter(item.value)}
                  >
                    <Text
                      style={[
                        screenStyles.filterText,
                        active && screenStyles.activeFilterText,
                      ]}
                    >
                      {item.label} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={screenStyles.loader}
            />
          ) : (
            <View style={screenStyles.emptyState}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={58}
                color="#B7C8C2"
              />
              <Text style={screenStyles.emptyTitle}>
                Khong co nguoi dang ky phu hop
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5F3EF",
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    fontFamily: "Georgia",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.dark,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  searchBox: {
    minHeight: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D9FBEF",
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#DFF7EF",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilter: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  activeFilterText: {
    color: colors.dark,
  },
  registrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },
  registrationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#E7FAF3",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  participantName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
  },
  participantMeta: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  registeredPill: {
    backgroundColor: "#D1FAE5",
  },
  cancelledPill: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  registeredText: {
    color: "#047857",
  },
  cancelledText: {
    color: "#DC2626",
  },
  registeredAtRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  metaValue: {
    marginTop: 2,
    fontSize: 13,
    color: "#111827",
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
  },
});
