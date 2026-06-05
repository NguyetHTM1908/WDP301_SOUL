import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { eventUserService } from "@/services/eventApi";
import {
  eventStatusMeta,
  EventRegistration,
  EventStatus,
  getComputedEventStatus,
  getFillRate,
  getRemainingSlots,
  isEventFull,
  registrationMeta,
  RegistrationStatus,
} from "@/utils/eventRegistration";

type CommunityEvent = {
  _id: string;
  title: string;
  description?: string | null;
  speakerName?: string | null;
  organizerName?: string | null;
  contactEmail?: string | null;
  eventType?: string | null;
  startDateTime: string;
  endDateTime?: string | null;
  location?: string | null;
  meetingLink?: string | null;
  capacity?: number | null;
  registeredCount?: number;
  status: EventStatus;
};

type RegisteredEvent = CommunityEvent & {
  registration?: EventRegistration;
};

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

const typeLabels: Record<string, string> = {
  workshop: "Workshop",
  talkshow: "Talkshow",
  webinar: "Webinar",
  community_event: "Community Event",
};

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

export default function UserEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const optimisticRegistrationRef = useRef<EventRegistration | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const loadEvent = useCallback(
    async (showLoader = true) => {
      if (!id) return;

      if (showLoader) {
        setLoading(true);
      }

      try {
        const [eventResponse, registeredResponse] = await Promise.allSettled([
          eventUserService.getEventById(id),
          eventUserService.getRegisteredEvents("all", 1, 100),
        ]);

        if (eventResponse.status === "fulfilled" && eventResponse.value.success) {
          const nextEvent = eventResponse.value.data;

          setEvent((current) => {
            if (!showLoader && optimisticRegistrationRef.current && current) {
              return {
                ...nextEvent,
                registeredCount: current.registeredCount,
              };
            }

            return nextEvent;
          });
        } else {
          throw new Error("Unable to load event detail");
        }

        if (
          registeredResponse.status === "fulfilled" &&
          registeredResponse.value.success
        ) {
          const matched = (registeredResponse.value.data || []).find(
            (item: RegisteredEvent) => item._id === id
          );
          const matchedRegistration = matched?.registration || null;

          if (!showLoader && optimisticRegistrationRef.current) {
            if (matchedRegistration?.status === optimisticRegistrationRef.current.status) {
              optimisticRegistrationRef.current = null;
              setRegistration(matchedRegistration);
            }
          } else {
            setRegistration(matchedRegistration);
          }
        } else if (!optimisticRegistrationRef.current) {
          setRegistration(null);
        }
      } catch (error: any) {
        showToast(error.message || "Unable to load event detail", "error");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [id, showToast]
  );

  useFocusEffect(
    useCallback(() => {
      loadEvent();
    }, [loadEvent])
  );

  const registeredCount = event?.registeredCount || 0;
  const remainingSlots = getRemainingSlots(event?.capacity, registeredCount);
  const computedStatus = event ? getComputedEventStatus(event) : "upcoming";
  const eventStatus = eventStatusMeta[computedStatus];
  const fillRate = getFillRate(event?.capacity, registeredCount);
  const full = isEventFull(event?.capacity, registeredCount);
  const registrationClosed = computedStatus === "completed" || computedStatus === "cancelled";
  const registrationStatus = registration?.status
    ? registrationMeta[registration.status]
    : null;

  const participantCountText = useMemo(() => {
    if (!event) return "";

    if (event.capacity === null || event.capacity === undefined) {
      return `${registeredCount} registered participants`;
    }

    return `${registeredCount}/${event.capacity} registered participants`;
  }, [event, registeredCount]);

  const remainingSlotsText =
    remainingSlots === null ? "Unlimited" : `${remainingSlots} remaining slots`;

  const canRegister =
    computedStatus === "upcoming" &&
    registration?.status !== "registered" &&
    !full &&
    !registrationClosed;
  const canCancel =
    registration?.status === "registered" &&
    computedStatus !== "completed" &&
    computedStatus !== "cancelled";

  const applyRegistrationState = (
    nextStatus: RegistrationStatus,
    nextRegisteredCount?: number
  ) => {
    const now = new Date().toISOString();
    const nextRegistration: EventRegistration = {
      status: nextStatus,
      registeredAt:
        nextStatus === "registered" ? now : registration?.registeredAt || now,
      cancelledAt: nextStatus === "cancelled" ? now : null,
    };

    optimisticRegistrationRef.current = nextRegistration;
    setRegistration(nextRegistration);

    setEvent((current) => {
      if (!current) return current;

      return {
        ...current,
        registeredCount:
          nextRegisteredCount !== undefined
            ? nextRegisteredCount
            : Math.max((current.registeredCount || 0) + (nextStatus === "registered" ? 1 : -1), 0),
      };
    });
  };

  const syncAfterAction = () => {
    setTimeout(() => {
      loadEvent(false);
    }, 600);
  };

  const handleRegister = async () => {
    if (!event) return;

    setSubmitting(true);
    try {
      const response = await eventUserService.registerEvent(event._id);
      applyRegistrationState("registered", response.data?.registeredCount);
      showToast("Đăng ký sự kiện thành công", "success");
      syncAfterAction();
    } catch (error: any) {
      showToast(error.message || "Đăng ký sự kiện thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const performCancelRegistration = async () => {
    if (!event) return;

    setSubmitting(true);
    try {
      const response = await eventUserService.cancelRegistration(event._id);
      applyRegistrationState("cancelled", response.data?.registeredCount);
      showToast("Hủy đăng ký thành công", "success");
      syncAfterAction();
    } catch (error: any) {
      showToast(error.message || "Không thể hủy đăng ký", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!event) return;

    if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
      const confirmed = globalThis.confirm(
        "Bạn có chắc muốn hủy đăng ký sự kiện này không?"
      );

      if (confirmed) {
        performCancelRegistration();
      }

      return;
    }

    Alert.alert(
      "Hủy đăng ký",
      "Bạn có chắc muốn hủy đăng ký sự kiện này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: "destructive",
          onPress: performCancelRegistration,
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={screenStyles.safeArea}>
        <View style={screenStyles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={screenStyles.centerText}>Loading event detail...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={screenStyles.safeArea}>
        <View style={screenStyles.centerState}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#B7C8C2" />
          <Text style={screenStyles.centerTitle}>Event not found</Text>
          <TouchableOpacity style={screenStyles.secondaryButton} onPress={() => router.back()}>
            <Text style={screenStyles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyles.safeArea}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.iconButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <View style={screenStyles.headerTextWrap}>
          <Text style={screenStyles.headerTitle} numberOfLines={1}>
            Event Detail
          </Text>
          <Text style={screenStyles.headerSubtitle} numberOfLines={1}>
            {typeLabels[event.eventType || ""] || "SOUL Event"}
          </Text>
        </View>
        <TouchableOpacity
          style={screenStyles.headerIcon}
          onPress={() => router.push("/user-events/registered")}
        >
          <MaterialCommunityIcons name="bookmark-check-outline" size={23} color="#0F766E" />
        </TouchableOpacity>
      </View>

      {toast && (
        <View
          style={[
            screenStyles.toast,
            toast.type === "success" ? screenStyles.successToast : screenStyles.errorToast,
          ]}
        >
          <MaterialCommunityIcons
            name={toast.type === "success" ? "check-circle" : "alert-circle"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={screenStyles.toastText}>{toast.message}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={screenStyles.content}>
        <View style={screenStyles.heroCard}>
          <View style={screenStyles.heroTop}>
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

          <Text style={screenStyles.eventTitle}>{event.title}</Text>
          <Text style={screenStyles.eventDescription}>
            {event.description ||
              "SOUL emotional wellness event for reflection and safe community support."}
          </Text>
        </View>

        <View style={screenStyles.statsRow}>
          <StatCard label="Capacity" value={event.capacity ? `${event.capacity}` : "Open"} icon="seat-outline" />
          <StatCard label="Participants" value={`${registeredCount}`} icon="account-group-outline" />
          <StatCard
            label="Remaining"
            value={remainingSlots === null ? "Open" : `${remainingSlots}`}
            icon="ticket-confirmation-outline"
          />
        </View>

        <View style={screenStyles.progressCard}>
          <View style={screenStyles.progressHeader}>
            <Text style={screenStyles.progressTitle}>
              {registeredCount} / {event.capacity || "∞"} người tham gia
            </Text>
            <Text style={screenStyles.progressPercent}>{fillRate}%</Text>
          </View>
          <View style={screenStyles.progressTrack}>
            <View style={[screenStyles.progressFill, { width: `${fillRate}%` }]} />
          </View>
          <Text style={screenStyles.registrationNotice}>
            {full
              ? "Đã đủ số lượng"
              : registrationClosed
                ? "Đã đóng đăng ký"
                : `Status: ${registrationStatus?.label || "Not registered"}`}
          </Text>
        </View>

        <View style={screenStyles.infoCard}>
          <InfoRow icon="clock-outline" label="Start" value={formatDateTime(event.startDateTime)} />
          <InfoRow icon="calendar-end-outline" label="End" value={formatDateTime(event.endDateTime)} />
          <InfoRow
            icon="map-marker-outline"
            label="Location"
            value={event.location || event.meetingLink || "Not updated"}
          />
          <InfoRow
            icon="account-tie-outline"
            label="Speaker"
            value={event.speakerName || event.organizerName || "SOUL Community"}
          />
          <InfoRow icon="account-group-outline" label="Registered" value={participantCountText} />
          <InfoRow icon="seat-outline" label="Capacity" value={event.capacity ? `${event.capacity}` : "Unlimited"} />
          <InfoRow icon="seat-outline" label="Remaining Slots" value={remainingSlotsText} />
          <InfoRow
            icon="email-outline"
            label="Contact"
            value={event.contactEmail || "Not updated"}
          />
        </View>

        {registration && (
          <View style={screenStyles.registrationCard}>
            <Text style={screenStyles.sectionTitle}>Registration Information</Text>
            <InfoRow
              icon="bookmark-check-outline"
              label="Status"
              value={registrationMeta[registration.status].label}
            />
            <InfoRow
              icon="calendar-check-outline"
              label="Registered At"
              value={formatDateTime(registration.registeredAt)}
            />
            {registration.status === "cancelled" && (
              <InfoRow
                icon="calendar-remove-outline"
                label="Cancelled At"
                value={formatDateTime(registration.cancelledAt)}
              />
            )}
          </View>
        )}
      </ScrollView>

      <View style={screenStyles.actionBar}>
        {canCancel ? (
          <TouchableOpacity
            style={[screenStyles.primaryButton, screenStyles.cancelButton]}
            onPress={handleCancel}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="calendar-remove" size={20} color="#FFFFFF" />
            )}
            <Text style={screenStyles.primaryButtonText}>
              {submitting ? "Đang hủy..." : "Cancel Registration"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[screenStyles.primaryButton, !canRegister && screenStyles.disabledButton]}
            onPress={handleRegister}
            disabled={!canRegister || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="calendar-plus" size={20} color="#FFFFFF" />
            )}
            <Text style={screenStyles.primaryButtonText}>
              {submitting
                ? "Đang đăng ký..."
                : full
                  ? "Đã đủ số lượng"
                  : registrationClosed
                    ? "Đã đóng đăng ký"
                    : registration?.status === "cancelled"
                      ? "Register Again"
                      : "Register Event"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={screenStyles.infoRow}>
      <View style={screenStyles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={18} color="#0F766E" />
      </View>
      <View style={screenStyles.infoTextWrap}>
        <Text style={screenStyles.infoLabel}>{label}</Text>
        <Text style={screenStyles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={screenStyles.statCard}>
      <MaterialCommunityIcons name={icon} size={20} color="#0F766E" />
      <Text style={screenStyles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={screenStyles.statLabel}>{label}</Text>
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
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.dark,
    fontFamily: "Georgia",
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
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
  toast: {
    position: "absolute",
    top: 72,
    left: 16,
    right: 16,
    zIndex: 10,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successToast: {
    backgroundColor: "#0F766E",
  },
  errorToast: {
    backgroundColor: "#EF4444",
  },
  toastText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#006B5C",
  },
  heroTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    fontFamily: "Georgia",
  },
  eventDescription: {
    marginTop: 12,
    color: "#E8FFFA",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
  },
  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 86,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },
  statValue: {
    marginTop: 8,
    color: colors.dark,
    fontSize: 17,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 3,
    color: "#70869E",
    fontSize: 11,
    fontWeight: "800",
  },
  progressCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressTitle: {
    flex: 1,
    color: colors.dark,
    fontSize: 14,
    fontWeight: "900",
  },
  progressPercent: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  progressTrack: {
    height: 10,
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: "#DFF7EF",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  registrationNotice: {
    marginTop: 10,
    color: "#31576C",
    fontSize: 13,
    fontWeight: "800",
  },
  infoCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5F3EF",
    gap: 13,
  },
  registrationCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5F3EF",
    gap: 13,
  },
  sectionTitle: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Georgia",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5FBF4",
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: "#70869E",
    fontSize: 12,
    fontWeight: "700",
  },
  infoValue: {
    marginTop: 3,
    color: "#26465A",
    fontSize: 14,
    fontWeight: "800",
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5F3EF",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 44,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9FBEF",
  },
  secondaryButtonText: {
    color: colors.dark,
    fontWeight: "900",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  centerText: {
    marginTop: 12,
    color: "#70869E",
    fontWeight: "700",
  },
  centerTitle: {
    marginTop: 12,
    color: colors.dark,
    fontSize: 17,
    fontWeight: "900",
  },
});
