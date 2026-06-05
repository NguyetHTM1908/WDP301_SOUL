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
  buildRegistrationMap,
  eventStatusMeta,
  EventRegistrationMap,
  EventStatus,
  getComputedEventStatus,
  getFillRate,
  getRemainingSlots,
  registrationMeta,
} from "@/utils/eventRegistration";

type EventFilter = "all" | EventStatus;

type CommunityEvent = {
  _id: string;
  title: string;
  description?: string | null;
  speakerName?: string | null;
  organizerName?: string | null;
  eventType?: string | null;
  startDateTime: string;
  location?: string | null;
  meetingLink?: string | null;
  capacity?: number | null;
  registeredCount?: number;
  status: EventStatus;
};

const filters: { label: string; value: EventFilter }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

const typeLabels: Record<string, string> = {
  workshop: "Workshop",
  talkshow: "Talkshow",
  webinar: "Webinar",
  community_event: "Community Event",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UserEventListScreen() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [registrationMap, setRegistrationMap] = useState<EventRegistrationMap>({});
  const [filter, setFilter] = useState<EventFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [eventResponse, registeredResponse] = await Promise.allSettled([
        eventUserService.getEvents({ status: "all", page: 1, limit: 100 }),
        eventUserService.getRegisteredEvents("all", 1, 100),
      ]);

      if (eventResponse.status === "fulfilled" && eventResponse.value.success) {
        setEvents(eventResponse.value.data || []);
      }

      if (
        registeredResponse.status === "fulfilled" &&
        registeredResponse.value.success
      ) {
        setRegistrationMap(buildRegistrationMap(registeredResponse.value.data || []));
      } else {
        setRegistrationMap({});
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Unable to load events");
    } finally {
      setLoading(false);
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
      upcoming: events.filter((event) => getComputedEventStatus(event) === "upcoming").length,
      ongoing: events.filter((event) => getComputedEventStatus(event) === "ongoing").length,
      completed: events.filter((event) => getComputedEventStatus(event) === "completed").length,
      cancelled: events.filter((event) => getComputedEventStatus(event) === "cancelled").length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return events.filter((event) => {
      const searchableText = [
        event.title,
        event.description,
        event.location,
        event.speakerName,
        event.organizerName,
        event.eventType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const computedStatus = getComputedEventStatus(event);

      return (
        (filter === "all" || computedStatus === filter) &&
        (!keyword || searchableText.includes(keyword))
      );
    });
  }, [events, filter, searchText]);

  const renderEvent = ({ item }: { item: CommunityEvent }) => {
    const computedStatus = getComputedEventStatus(item);
    const eventStatus = eventStatusMeta[computedStatus] || eventStatusMeta.upcoming;
    const registration = registrationMap[item._id];
    const registrationStatus = registration?.status
      ? registrationMeta[registration.status]
      : null;
    const remainingSlots = getRemainingSlots(item.capacity, item.registeredCount || 0);
    const fillRate = getFillRate(item.capacity, item.registeredCount || 0);
    const capacityText =
      remainingSlots === null
        ? `${item.registeredCount || 0} registered`
        : `${item.registeredCount || 0}/${item.capacity} registered · ${remainingSlots} left`;

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
          <View style={screenStyles.typeIcon}>
            <MaterialCommunityIcons name="calendar-heart" size={24} color="#FF7A00" />
          </View>

          <View style={screenStyles.cardTitleWrap}>
            <Text style={screenStyles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={screenStyles.eventType}>
              {typeLabels[item.eventType || ""] || "Event"}
            </Text>
          </View>

          <View style={screenStyles.badgeColumn}>
            <View style={[screenStyles.statusPill, { backgroundColor: eventStatus.bg }]}>
              <Text style={[screenStyles.statusText, { color: eventStatus.color }]}>
                {eventStatus.label}
              </Text>
            </View>

            {registrationStatus && (
              <View
                style={[
                  screenStyles.statusPill,
                  { backgroundColor: registrationStatus.bg },
                ]}
              >
                <Text
                  style={[
                    screenStyles.statusText,
                    { color: registrationStatus.color },
                  ]}
                >
                  {registrationStatus.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={screenStyles.eventDescription} numberOfLines={3}>
          {item.description ||
            "SOUL emotional wellness event for reflection and safe community support."}
        </Text>

        <View style={screenStyles.infoGrid}>
          <InfoRow icon="clock-outline" text={formatDateTime(item.startDateTime)} />
          <InfoRow
            icon="map-marker-outline"
            text={item.location || item.meetingLink || "Location not updated"}
          />
          <InfoRow icon="account-group-outline" text={capacityText} />
          <InfoRow
            icon="account-tie-outline"
            text={item.speakerName || item.organizerName || "SOUL Community"}
          />
        </View>

        {item.capacity ? (
          <View style={screenStyles.progressBlock}>
            <View style={screenStyles.progressHeader}>
              <Text style={screenStyles.progressText}>
                {item.registeredCount || 0} / {item.capacity} người tham gia
              </Text>
              <Text style={screenStyles.progressPercent}>{fillRate}%</Text>
            </View>
            <View style={screenStyles.progressTrack}>
              <View style={[screenStyles.progressFill, { width: `${fillRate}%` }]} />
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <View style={screenStyles.header}>
        <TouchableOpacity
          style={screenStyles.iconButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>

        <View style={screenStyles.headerTextWrap}>
          <Text style={screenStyles.headerTitle}>Events</Text>
          <Text style={screenStyles.headerSubtitle}>
            Emotional wellness activities
          </Text>
        </View>

        <TouchableOpacity
          style={screenStyles.headerIcon}
          onPress={() => router.push("/user-events/registered")}
        >
          <MaterialCommunityIcons name="bookmark-check-outline" size={24} color="#0F766E" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        refreshing={loading}
        onRefresh={fetchEvents}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenStyles.listContent}
        ListHeaderComponent={
          <View>
            <View style={screenStyles.heroCard}>
              <View style={screenStyles.heroBadge}>
                <MaterialCommunityIcons name="sparkles" size={15} color="#FFFFFF" />
                <Text style={screenStyles.heroBadgeText}>SOUL Events</Text>
              </View>
              <Text style={screenStyles.heroTitle}>Find healing activities</Text>
              <Text style={screenStyles.heroText}>
                Explore workshops, talkshows, and community activities created for
                emotional wellness.
              </Text>
              <TouchableOpacity
                style={screenStyles.heroButton}
                onPress={() => router.push("/user-events/registered")}
              >
                <Text style={screenStyles.heroButtonText}>My registered events</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={screenStyles.searchBox}>
              <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Tìm tên sự kiện, địa điểm, diễn giả, loại sự kiện"
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
              <MaterialCommunityIcons name="calendar-blank" size={62} color="#B7C8C2" />
              <Text style={screenStyles.emptyTitle}>Hiện chưa có sự kiện nào</Text>
              <Text style={screenStyles.emptyText}>
                Hãy quay lại sau khi SOUL cập nhật lịch hoạt động mới.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View style={screenStyles.infoRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#0F766E" />
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
    fontSize: 22,
    fontWeight: "900",
    color: colors.dark,
    fontFamily: "Georgia",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "#70869E",
  },
  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#E5FBF4",
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  heroCard: {
    minHeight: 210,
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    backgroundColor: "#006B5C",
    justifyContent: "space-between",
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  heroTitle: {
    marginTop: 22,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  heroText: {
    marginTop: 10,
    maxWidth: 560,
    color: "#E8FFFA",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
  },
  heroButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    marginTop: 18,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroButtonText: {
    color: colors.dark,
    fontSize: 13,
    fontWeight: "900",
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
  typeIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "#FFF1E2",
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  badgeColumn: {
    alignItems: "flex-end",
    gap: 6,
  },
  eventTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: colors.dark,
  },
  eventType: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "800",
    color: "#FF7A00",
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  eventDescription: {
    marginTop: 13,
    color: "#466986",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  progressBlock: {
    marginTop: 14,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  progressText: {
    color: "#31576C",
    fontSize: 12,
    fontWeight: "800",
  },
  progressPercent: {
    color: colors.dark,
    fontSize: 12,
    fontWeight: "900",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#DFF7EF",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
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
});
