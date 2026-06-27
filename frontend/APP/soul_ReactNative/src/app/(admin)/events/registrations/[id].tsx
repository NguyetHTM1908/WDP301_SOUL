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
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";

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

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Thời gian không hợp lệ";

  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUserId(registration: EventRegistration) {
  if (typeof registration.userId === "string") return registration.userId;
  return registration.userId?._id || "";
}

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
      const response = await eventAdminService.getEventRegistrations(eventId, "all");

      if (response.success && response.data) {
        const event = response.data.event || {};
        const resultStats = response.data.stats || {};

        setEventTitle(event.title || "Event registrations");
        setEventTime(`${formatDateTime(event.startDateTime)} - ${formatDateTime(event.endDateTime)}`);
        setRegistrations(response.data.registrations || []);

        setStats({
          totalRegistrations: resultStats.totalRegistrations ?? event.registeredCount ?? 0,
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
          <View>
            <Text style={s.timelineLabel}>Thời gian đăng ký</Text>
            <Text style={s.timelineValue}>{formatDateTime(item.registeredAt)}</Text>
          </View>
        </View>

        {item.cancelledAt ? (
          <View style={s.timelineRow}>
            <MaterialCommunityIcons name="close-circle-outline" size={18} color="#EF4444" />
            <View>
              <Text style={s.timelineLabel}>Thời gian hủy</Text>
              <Text style={s.timelineValue}>{formatDateTime(item.cancelledAt)}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.adminHeader}>
        <View style={s.adminHeaderTop}>
          <TouchableOpacity
            style={s.iconButtonLight}
            onPress={() => router.replace(`/(admin)/events/${eventId}`)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <View style={[s.badge, s.badgeGreen]}>
            <Text style={[s.badgeText, s.badgeGreenText]}>Registrations</Text>
          </View>
        </View>

        <Text style={s.adminTitle}>Participants</Text>
        <Text style={s.adminSubtitle} numberOfLines={2}>
          {eventTitle}
        </Text>
        <Text style={[s.adminSubtitle, { color: "#00866B" }]} numberOfLines={1}>
          {eventTime}
        </Text>

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
            <Text style={s.heroStatValue}>{stats.remainingSlots ?? "∞"}</Text>
            <Text style={s.heroStatLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredRegistrations}
        keyExtractor={(item) => getUserId(item) || `${item.status}-${item.registeredAt}`}
        renderItem={renderRegistration}
        refreshing={loading}
        onRefresh={fetchRegistrations}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View>
            <View style={s.searchBox}>
              <MaterialCommunityIcons name="magnify" size={21} color="#64748B" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tìm theo tên, email, số điện thoại"
                placeholderTextColor="#94A3B8"
                style={s.searchInput}
              />
              {searchText.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
            >
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
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#00866B" style={{ marginTop: 45 }} />
          ) : (
            <View style={s.emptyState}>
              <View style={s.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={46}
                  color="#8FB9AE"
                />
              </View>
              <Text style={s.emptyTitle}>Không có người đăng ký phù hợp</Text>
              <Text style={s.emptyText}>Thử đổi bộ lọc hoặc kéo xuống để làm mới.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}