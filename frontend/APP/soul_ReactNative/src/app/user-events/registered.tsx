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
import { router, useFocusEffect } from "expo-router";
import { colors } from "@/constants/colors";
import { eventUserService } from "@/services/eventApi";
import {
  eventStatusMeta,
  EventRegistration,
  EventStatus,
  getComputedEventStatus,
  registrationMeta,
  RegistrationStatus,
} from "@/utils/eventRegistration";

type RegistrationFilter = "all" | RegistrationStatus;

type RegisteredEvent = {
  _id: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  startDateTime: string;
  location?: string | null;
  meetingLink?: string | null;
  registeredCount?: number;
  status: EventStatus;
  registration?: EventRegistration;
};

const filters: { label: string; value: RegistrationFilter }[] = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Cancelled", value: "cancelled" },
];

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not updated";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function RegisteredEventsScreen() {
  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [filter, setFilter] = useState<RegistrationFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRegisteredEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventUserService.getRegisteredEvents("all", 1, 100);

      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Unable to load registered events"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRegisteredEvents();
    }, [loadRegisteredEvents])
  );

  const counts = useMemo(() => {
    const registered = events.filter(
      (event) => event.registration?.status === "registered"
    ).length;
    const cancelled = events.filter(
      (event) => event.registration?.status === "cancelled"
    ).length;

    return {
      all: events.length,
      registered,
      cancelled,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return events.filter((event) => {
      const registrationStatus = event.registration?.status;
      const searchableText = [
        event.title,
        event.description,
        event.location,
        event.meetingLink,
        event.eventType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (filter === "all" || registrationStatus === filter) &&
        (!keyword || searchableText.includes(keyword))
      );
    });
  }, [events, filter, searchText]);

  const renderEvent = ({ item }: { item: RegisteredEvent }) => {
    const registrationStatus = item.registration?.status || "registered";
    const registration = registrationMeta[registrationStatus];
    const eventStatus =
      eventStatusMeta[getComputedEventStatus(item)] || eventStatusMeta.upcoming;

    return (
      <TouchableOpacity
        style={screenStyles.eventCard}
        activeOpacity={0.86}
        onPress={() =>
          router.push({
            pathname: "/user-events/[id]",
            params: { id: item._id },
          })
        }
      >
        <View style={screenStyles.cardTop}>
          <View style={screenStyles.eventIcon}>
            <MaterialCommunityIcons name="calendar-check" size={23} color="#0F766E" />
          </View>

          <View style={screenStyles.cardTitleWrap}>
            <Text style={screenStyles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={screenStyles.eventStatus}>{eventStatus.label}</Text>
          </View>

          <View style={[screenStyles.statusPill, { backgroundColor: registration.bg }]}>
            <Text style={[screenStyles.statusText, { color: registration.color }]}>
              {registration.label}
            </Text>
          </View>
        </View>

        <View style={screenStyles.infoGrid}>
          <InfoRow icon="clock-outline" text={formatDateTime(item.startDateTime)} />
          <InfoRow
            icon="bookmark-check-outline"
            text={`Registered at: ${formatDateTime(item.registration?.registeredAt)}`}
          />

          {registrationStatus === "cancelled" && (
            <InfoRow
              icon="calendar-remove-outline"
              text={`Cancelled at: ${formatDateTime(item.registration?.cancelledAt)}`}
              danger
            />
          )}

          <InfoRow
            icon="map-marker-outline"
            text={item.location || item.meetingLink || "Location not updated"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>

        <View style={screenStyles.headerTextWrap}>
          <Text style={screenStyles.headerTitle}>Registered Events</Text>
          <Text style={screenStyles.headerSubtitle}>
            Track your event participation status
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        refreshing={loading}
        onRefresh={loadRegisteredEvents}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View>
            <View style={screenStyles.summaryCard}>
              <SummaryItem label="Total Events" value={counts.all} />
              <View style={screenStyles.summaryDivider} />
              <SummaryItem label="Registered" value={counts.registered} />
              <View style={screenStyles.summaryDivider} />
              <SummaryItem label="Cancelled" value={counts.cancelled} />
            </View>

            <View style={screenStyles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tìm sự kiện hoặc địa điểm"
                placeholderTextColor="#94A3B8"
                style={screenStyles.searchInput}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
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
                    style={[screenStyles.filterButton, active && screenStyles.activeFilter]}
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
            <ActivityIndicator size="large" color={colors.primary} style={screenStyles.loader} />
          ) : (
            <View style={screenStyles.emptyState}>
              <MaterialCommunityIcons name="calendar-heart" size={62} color="#B7C8C2" />
              <Text style={screenStyles.emptyTitle}>Bạn chưa đăng ký sự kiện nào</Text>
              <Text style={screenStyles.emptyText}>
                Hãy khám phá lịch hoạt động của SOUL và chọn sự kiện phù hợp.
              </Text>
              <TouchableOpacity
                style={screenStyles.emptyButton}
                onPress={() => router.push("/user-events")}
              >
                <Text style={screenStyles.emptyButtonText}>Khám phá sự kiện</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={screenStyles.summaryItem}>
      <Text style={screenStyles.summaryLabel}>{label}</Text>
      <Text style={screenStyles.summaryValue}>{value}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  text,
  danger,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  danger?: boolean;
}) {
  return (
    <View style={screenStyles.infoRow}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={danger ? "#EF4444" : "#0F766E"}
      />
      <Text style={screenStyles.infoText}>{text}</Text>
    </View>
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
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5F3EF",
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F2FFFB",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.dark,
    fontFamily: "Georgia",
  },
  headerSubtitle: {
    marginTop: 3,
    color: "#70869E",
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  summaryCard: {
    minHeight: 94,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#006B5C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    color: "#D7FFF6",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  summaryValue: {
    marginTop: 5,
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 46,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  searchBox: {
    minHeight: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
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
    minHeight: 44,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    minHeight: 38,
    paddingHorizontal: 13,
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
    fontWeight: "800",
    color: "#64748B",
  },
  activeFilterText: {
    color: colors.dark,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eventIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#E5FBF4",
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    color: colors.dark,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
  },
  eventStatus: {
    marginTop: 4,
    color: "#70869E",
    fontSize: 12,
    fontWeight: "800",
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  infoGrid: {
    marginTop: 14,
    gap: 9,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: "#31576C",
    fontSize: 13,
    fontWeight: "700",
  },
  loader: {
    marginTop: 42,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: colors.dark,
  },
  emptyText: {
    marginTop: 7,
    maxWidth: 320,
    textAlign: "center",
    color: "#70869E",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  emptyButton: {
    minHeight: 42,
    marginTop: 16,
    paddingHorizontal: 17,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
