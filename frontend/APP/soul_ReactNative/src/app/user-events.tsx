import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { eventService, normalizeListResponse } from "@/services/eventApi";
import { scheduleEventReminder } from "@/services/eventNotification";
import { eventStyles as s } from "@/styles/event.styles";
import {
  canCancelRegistration,
  canRegisterEvent,
  formatEventDateTime,
  getCancelDeadlineText,
  getComputedEventStatus,
  getEventModeLabel,
  getEventPlaceText,
  getFillRate,
  getHoursUntilEvent,
} from "@/utils/eventPolicy";

type TabKey = "explore" | "calendar";

const tabs: { label: string; value: TabKey }[] = [
  { label: "Sự kiện", value: "explore" },
  { label: "Lịch của tôi", value: "calendar" },
];

const scheduleMeta: Record<string, any> = {
  upcoming: {
    label: "Sắp diễn ra",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
  },
  ongoing: {
    label: "Đang diễn ra",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
  },
  completed: {
    label: "Đã kết thúc",
    bgStyle: s.badgeBlue,
    textStyle: s.badgeBlueText,
  },
  cancelled: {
    label: "Đã hủy",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
  },
};

function showMessage(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    const alertFn = (globalThis as any).alert;

    if (typeof alertFn === "function") {
      alertFn(`${title}: ${message}`);
    }

    onOk?.();
    return;
  }

  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
}

function askConfirm(message: string) {
  if (Platform.OS === "web") {
    const confirmFn = (globalThis as any).confirm;
    return typeof confirmFn === "function" ? confirmFn(message) : true;
  }

  return null;
}

function getEventIcon(event: any) {
  if (event.eventMode === "online" || event.meetingLink) {
    return "video-outline";
  }

  if (event.eventType === "talkshow") return "microphone-outline";
  if (event.eventType === "workshop") return "school-outline";
  if (event.eventType === "community_event") return "account-group-outline";

  return "calendar-heart";
}

export default function UserEventsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("explore");

  const [events, setEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const registeredIds = useMemo(() => {
    return new Set(registeredEvents.map((item) => item._id));
  }, [registeredEvents]);

  const loadPublicEvents = async () => {
    const [eventsRes, registeredRes] = await Promise.all([
      eventService.getEvents({
        page: 1,
        limit: 100,
      }),
      eventService
        .getRegisteredEvents({
          status: "registered",
          page: 1,
          limit: 100,
        })
        .catch(() => ({ data: [] })),
    ]);

    setEvents(normalizeListResponse(eventsRes));
    setRegisteredEvents(normalizeListResponse(registeredRes));
  };

  const loadRegisteredEvents = async () => {
    const res = await eventService.getRegisteredEvents({
      status: "registered",
      page: 1,
      limit: 100,
    });

    setRegisteredEvents(normalizeListResponse(res));
  };

  const loadData = async () => {
    setLoading(true);

    try {
      if (activeTab === "explore") {
        await loadPublicEvents();
      }

      if (activeTab === "calendar") {
        await loadRegisteredEvents();
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể tải danh sách sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeTab])
  );

  const currentData = useMemo(() => {
    if (activeTab === "explore") return events;
    return registeredEvents;
  }, [activeTab, events, registeredEvents]);

  const openDetail = (event: any) => {
    setSelectedEvent(event);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedEvent(null);
  };

  const handleRegister = async (event: any) => {
    if (registeredIds.has(event._id)) {
      showMessage("Đã đăng ký", "Sự kiện này đã có trong lịch của bạn.");
      return;
    }

    if (!canRegisterEvent(event)) {
      showMessage("Không thể đăng ký", "Sự kiện này không còn mở đăng ký.");
      return;
    }

    setActionLoadingId(event._id);

    try {
      const response = await eventService.registerEvent(event._id);

      if (response.success) {
        await scheduleEventReminder(event);

        showMessage(
          "Đăng ký thành công",
          "Sự kiện đã được thêm vào lịch của bạn. Hệ thống sẽ nhắc trước 24 giờ nếu thiết bị cho phép thông báo."
        );

        await loadPublicEvents();
        closeDetail();
      } else {
        showMessage("Lỗi", response.message || "Không thể đăng ký sự kiện.");
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể đăng ký sự kiện.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (event: any) => {
    if (!canCancelRegistration(event)) {
      showMessage(
        "Không thể hủy",
        "Bạn chỉ được hủy đăng ký trước khi sự kiện diễn ra ít nhất 24 giờ."
      );
      return;
    }

    const cancelNow = async () => {
      setActionLoadingId(event._id);

      try {
        const response = await eventService.cancelRegistration(event._id);

        if (response.success) {
          setRegisteredEvents((prev) =>
            prev.filter((item) => item._id !== event._id)
          );

          showMessage(
            "Đã hủy đăng ký",
            "Bạn đã hủy tham dự sự kiện thành công."
          );
          closeDetail();
        } else {
          showMessage("Lỗi", response.message || "Không thể hủy đăng ký.");
        }
      } catch (error: any) {
        showMessage("Lỗi", error?.message || "Không thể hủy đăng ký.");
      } finally {
        setActionLoadingId(null);
      }
    };

    const webConfirm = askConfirm("Bạn có chắc muốn hủy đăng ký sự kiện này?");
    if (webConfirm === false) return;
    if (webConfirm === true) {
      await cancelNow();
      return;
    }

    Alert.alert("Hủy đăng ký", "Bạn có chắc muốn hủy đăng ký sự kiện này?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy đăng ký", style: "destructive", onPress: cancelNow },
    ]);
  };

  const renderEventCard = ({ item }: { item: any }) => {
    const status = getComputedEventStatus(item);
    const schedule = scheduleMeta[status] || scheduleMeta.upcoming;
    const fillRate = getFillRate(item.capacity, item.registeredCount || 0);
    const registerable = canRegisterEvent(item);
    const cancelable = canCancelRegistration(item);
    const loadingThis = actionLoadingId === item._id;
    const hoursLeft = getHoursUntilEvent(item.startDateTime);
    const isRegistered = registeredIds.has(item._id);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={s.card}
        onPress={() => openDetail(item)}
      >
        <View style={s.cardTop}>
          <View style={s.eventIconWrap}>
            <MaterialCommunityIcons
              name={getEventIcon(item) as any}
              size={28}
              color="#00866B"
            />
          </View>

          <View style={s.cardTitleBlock}>
            <Text style={s.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={s.cardSubtitle}>
              {item.organizerName || item.createdBy?.fullName || "Sự kiện SOUL"}
            </Text>
          </View>

          <View style={[s.badge, schedule.bgStyle]}>
            <Text style={[s.badgeText, schedule.textStyle]}>
              {schedule.label}
            </Text>
          </View>
        </View>

        {!!item.description && (
          <Text style={s.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={s.infoPanel}>
          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              {formatEventDateTime(item.startDateTime)}
            </Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name={
                item.eventMode === "online"
                  ? "video-outline"
                  : "map-marker-outline"
              }
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>{getEventPlaceText(item)}</Text>
          </View>

          <View style={[s.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              Nhắc trước 24h · Còn {hoursLeft > 0 ? hoursLeft : 0} giờ
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

        {activeTab === "explore" ? (
          <TouchableOpacity
            style={[
              s.primaryButton,
              (!registerable || loadingThis || isRegistered) && s.disabled,
            ]}
            onPress={() => handleRegister(item)}
            disabled={!registerable || loadingThis || isRegistered}
          >
            {loadingThis ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isRegistered ? "calendar-check" : "calendar-plus"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={s.primaryButtonText}>
                  {isRegistered
                    ? "Đã có trong lịch"
                    : registerable
                      ? "Đăng ký tham dự"
                      : "Không thể đăng ký"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.cancelButton, (!cancelable || loadingThis) && s.disabled]}
            onPress={() => handleCancel(item)}
            disabled={!cancelable || loadingThis}
          >
            {loadingThis ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="calendar-remove"
                  size={20}
                  color="#DC2626"
                />
                <Text style={s.cancelButtonText}>
                  {cancelable ? "Hủy đăng ký" : "Quá hạn hủy"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.hero}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.replace("/(tabs)" as any)}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
        </TouchableOpacity>

        <Text style={s.heroTitle}>Sự kiện SOUL</Text>
        <Text style={s.heroSubtitle}>
          Xem sự kiện đã được duyệt, đăng ký tham dự và theo dõi lịch cá nhân.
        </Text>

        <View style={s.heroStats}>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{events.length}</Text>
            <Text style={s.heroStatLabel}>Sự kiện</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{registeredEvents.length}</Text>
            <Text style={s.heroStatLabel}>Đã đăng ký</Text>
          </View>

          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>24h</Text>
            <Text style={s.heroStatLabel}>Nhắc lịch</Text>
          </View>
        </View>
      </View>

      <View style={s.tabWrap}>
        <View style={s.tabContainer}>
          {tabs.map((tab) => {
            const active = activeTab === tab.value;

            return (
              <TouchableOpacity
                key={tab.value}
                style={[s.tabButton, active && s.tabButtonActive]}
                onPress={() => setActiveTab(tab.value)}
              >
                <Text style={[s.tabText, active && s.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={s.loadingText}>Đang tải sự kiện...</Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item._id}
          renderItem={renderEventCard}
          contentContainerStyle={currentData.length ? s.listContent : undefined}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={44}
                color="#00866B"
              />
              <Text style={s.emptyTitle}>Chưa có sự kiện</Text>
              <Text style={s.emptyText}>
                {activeTab === "explore"
                  ? "Hiện chưa có sự kiện nào được admin duyệt."
                  : "Bạn chưa đăng ký tham dự sự kiện nào."}
              </Text>
            </View>
          }
        />
      )}

      <EventDetailBubbleModal
        visible={detailVisible}
        event={selectedEvent}
        mode={activeTab}
        actionLoading={!!selectedEvent && actionLoadingId === selectedEvent._id}
        isRegistered={!!selectedEvent && registeredIds.has(selectedEvent._id)}
        onClose={closeDetail}
        onRegister={() => selectedEvent && handleRegister(selectedEvent)}
        onCancel={() => selectedEvent && handleCancel(selectedEvent)}
      />
    </SafeAreaView>
  );
}

function Bubble({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "#F6FFFC",
        borderWidth: 1,
        borderColor: "#DDEFEA",
        borderRadius: 20,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "#E8FAF3",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name={icon} size={20} color="#00866B" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: "#64748B", fontSize: 12, fontWeight: "800" }}>
          {label}
        </Text>

        <Text
          style={{
            color: "#0A3F36",
            fontSize: 14,
            fontWeight: "900",
            marginTop: 3,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function EventDetailBubbleModal({
  visible,
  event,
  mode,
  actionLoading,
  isRegistered,
  onClose,
  onRegister,
  onCancel,
}: any) {
  if (!event) return null;

  const registerable = canRegisterEvent(event);
  const cancelable = canCancelRegistration(event);
  const eventMode = getEventModeLabel(event);
  const place = getEventPlaceText(event);
  const cancelDeadline = getCancelDeadlineText(event);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          style={{
            maxHeight: "88%",
            backgroundColor: "#EEFDF8",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: "hidden",
          }}
        >
          <View style={s.adminHeader}>
            <View style={s.adminHeaderTop}>
              <TouchableOpacity style={s.iconButtonLight} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color="#064D3D" />
              </TouchableOpacity>
            </View>

            <Text style={s.adminTitle}>Chi tiết sự kiện</Text>
            <Text style={s.adminSubtitle}>{event.title}</Text>
          </View>

          <ScrollView contentContainerStyle={s.formContent}>
            <Bubble
              icon="calendar-clock"
              label="Thời gian bắt đầu"
              value={formatEventDateTime(event.startDateTime)}
            />

            <Bubble
              icon="calendar-check"
              label="Thời gian kết thúc"
              value={formatEventDateTime(event.endDateTime)}
            />

            <Bubble
              icon={
                eventMode === "Online" ? "video-outline" : "map-marker-outline"
              }
              label={eventMode === "Online" ? "Link Zoom/Meet" : "Địa điểm"}
              value={place}
            />

            <Bubble
              icon="account-group-outline"
              label="Số lượng"
              value={`${event.registeredCount || 0}/${
                event.capacity || "∞"
              } người`}
            />

            <Bubble
              icon="bell-ring-outline"
              label="Nhắc lịch"
              value="Thông báo trước 24 giờ nếu thiết bị cho phép"
            />

            <Bubble
              icon="calendar-remove-outline"
              label="Hạn hủy đăng ký"
              value={`Trước ${cancelDeadline}`}
            />

            {!!event.speakerName && (
              <Bubble
                icon="account-tie-voice-outline"
                label="Diễn giả"
                value={event.speakerName}
              />
            )}

            {!!event.contactEmail && (
              <Bubble
                icon="email-outline"
                label="Email liên hệ"
                value={event.contactEmail}
              />
            )}

            {!!event.description && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Mô tả</Text>
                <Text style={s.description}>{event.description}</Text>
              </View>
            )}

            {mode === "explore" ? (
              <TouchableOpacity
                style={[
                  s.primaryButton,
                  (!registerable || actionLoading || isRegistered) &&
                    s.disabled,
                ]}
                onPress={onRegister}
                disabled={!registerable || actionLoading || isRegistered}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.primaryButtonText}>
                    {isRegistered
                      ? "Đã có trong lịch"
                      : registerable
                        ? "Đăng ký tham dự"
                        : "Không thể đăng ký"}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  s.cancelButton,
                  (!cancelable || actionLoading) && s.disabled,
                ]}
                onPress={onCancel}
                disabled={!cancelable || actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#DC2626" />
                ) : (
                  <Text style={s.cancelButtonText}>
                    {cancelable ? "Hủy đăng ký" : "Quá hạn hủy đăng ký"}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}