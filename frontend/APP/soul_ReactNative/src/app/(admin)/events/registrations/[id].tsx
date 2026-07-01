import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import { formatEventDateTime } from "@/utils/eventPolicy";

type RegistrationStatusFilter = "all" | "registered" | "cancelled" | "attended";

type EventRegistration = {
  userId: any;
  status: "registered" | "cancelled" | "attended";
  registeredAt?: string;
  cancelledAt?: string | null;
};

const filters: { label: string; value: RegistrationStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Attended", value: "attended" },
];

function getUserInfo(registration: EventRegistration) {
  if (typeof registration.userId === "string") {
    return {
      name: "SOUL User",
      email: "Không có email",
      phone: "Không có số điện thoại",
    };
  }

  return {
    name: registration.userId?.fullName || "SOUL User",
    email: registration.userId?.email || "Không có email",
    phone: registration.userId?.phone || "Không có số điện thoại",
  };
}

function getStatusMeta(status: string) {
  if (status === "registered") {
    return {
      label: "Registered",
      bgStyle: s.badgeGreen,
      textStyle: s.badgeGreenText,
      icon: "account-check-outline",
      color: "#047857",
    };
  }

  if (status === "attended") {
    return {
      label: "Attended",
      bgStyle: s.badgeBlue,
      textStyle: s.badgeBlueText,
      icon: "check-circle-outline",
      color: "#0369A1",
    };
  }

  return {
    label: "Cancelled",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
    icon: "account-cancel-outline",
    color: "#DC2626",
  };
}

export default function AdminEventRegistrations() {
  const params = useLocalSearchParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<any>({
    totalRegistrations: 0,
    totalCancelled: 0,
    totalAttended: 0,
    remainingSlots: null,
  });

  const [filter, setFilter] = useState<RegistrationStatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);

    try {
      const response = await eventAdminService.getEventRegistrations(eventId, "all", {
        page: 1,
        limit: 300,
      });

      if (response.success && response.data) {
        const event = response.data.event || {};
        const resultStats = response.data.stats || {};

        setEventTitle(event.title || "Event registrations");
        setEventTime(
          `${formatEventDateTime(event.startDateTime)} - ${formatEventDateTime(
            event.endDateTime
          )}`
        );
        setRegistrations(response.data.registrations || []);

        setStats({
          totalRegistrations:
            resultStats.totalRegistrations ?? event.registeredCount ?? 0,
          totalCancelled: resultStats.totalCancelled ?? 0,
          totalAttended: resultStats.totalAttended ?? 0,
          capacity: resultStats.capacity ?? event.capacity,
          remainingSlots: resultStats.remainingSlots ?? null,
        });
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải danh sách người đăng ký.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      fetchRegistrations();
    }, [fetchRegistrations])
  );

  const counts = useMemo(() => {
    const registered = registrations.filter((item) => item.status === "registered").length;
    const cancelled = registrations.filter((item) => item.status === "cancelled").length;
    const attended = registrations.filter((item) => item.status === "attended").length;

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
      <View style={s.registrationCard}>
        <View style={s.registrationHeader}>
          <View style={s.avatarCircle}>
            <MaterialCommunityIcons
              name={meta.icon as any}
              size={24}
              color={meta.color}
            />
          </View>

          <View style={s.participantInfo}>
            <Text style={s.participantName}>{user.name}</Text>
            <Text style={s.participantMeta}>{user.email}</Text>
            <Text style={s.participantMeta}>{user.phone}</Text>
          </View>

          <View style={[s.badge, meta.bgStyle]}>
            <Text style={[s.badgeText, meta.textStyle]}>{meta.label}</Text>
          </View>
        </View>

        <View style={s.timelineRow}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#64748B" />
          <Text style={s.timelineText}>
            Đăng ký: {formatEventDateTime(item.registeredAt)}
          </Text>
        </View>

        {item.cancelledAt ? (
          <View style={s.timelineRow}>
            <MaterialCommunityIcons name="close-circle-outline" size={18} color="#DC2626" />
            <Text style={[s.timelineText, { color: "#DC2626" }]}>
              Hủy: {formatEventDateTime(item.cancelledAt)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.adminHeader}>
        <View style={s.adminHeaderTop}>
          <TouchableOpacity style={s.iconButtonLight} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <TouchableOpacity style={s.iconButtonGreen} onPress={fetchRegistrations}>
            <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={s.adminTitle}>Registrations</Text>
        <Text style={s.adminSubtitle}>{eventTitle}</Text>
        <Text style={s.adminSubtitle}>{eventTime}</Text>

        <View style={s.heroStats}>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{stats.totalRegistrations}</Text>
            <Text style={s.heroStatLabel}>Registered</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{stats.totalCancelled}</Text>
            <Text style={s.heroStatLabel}>Cancelled</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>
              {stats.remainingSlots === null ? "∞" : stats.remainingSlots}
            </Text>
            <Text style={s.heroStatLabel}>Còn trống</Text>
          </View>
        </View>
      </View>

      <TextInput
        style={s.searchInput}
        placeholder="Tìm theo tên, email hoặc số điện thoại..."
        placeholderTextColor="#8CA8A1"
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={s.filterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((item) => {
            const active = filter === item.value;
            const count = counts[item.value];

            return (
              <TouchableOpacity
                key={item.value}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setFilter(item.value)}
              >
                <Text style={[s.filterChipText, active && s.filterChipTextActive]}>
                  {item.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={s.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRegistrations}
          keyExtractor={(item, index) => {
            const userId =
              typeof item.userId === "string"
                ? item.userId
                : item.userId?._id || String(index);

            return `${userId}-${item.status}-${index}`;
          }}
          renderItem={renderRegistration}
          contentContainerStyle={filteredRegistrations.length ? s.listContent : undefined}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <MaterialCommunityIcons
                name="account-search-outline"
                size={44}
                color="#00866B"
              />
              <Text style={s.emptyTitle}>Không có người đăng ký</Text>
              <Text style={s.emptyText}>
                Chưa có dữ liệu phù hợp với bộ lọc hiện tại.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}