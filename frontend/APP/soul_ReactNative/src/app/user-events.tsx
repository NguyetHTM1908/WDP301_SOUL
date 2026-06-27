import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors } from "@/constants/colors";
import { eventOwnerService, eventService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";
import { getFillRate } from "@/utils/eventRegistration";

type TabKey = "upcoming" | "mine" | "registered";

type EventTypeValue = "workshop" | "talkshow" | "webinar" | "community_event";

const tabs: { label: string; value: TabKey; icon: any }[] = [
  { label: "Explore", value: "upcoming", icon: "calendar-star" },
  { label: "My Events", value: "mine", icon: "calendar-edit" },
  { label: "Joined", value: "registered", icon: "calendar-check" },
];

const eventTypes: { label: string; value: EventTypeValue; icon: any }[] = [
  { label: "Workshop", value: "workshop", icon: "school-outline" },
  { label: "Talkshow", value: "talkshow", icon: "microphone-outline" },
  { label: "Webinar", value: "webinar", icon: "video-outline" },
  { label: "Community", value: "community_event", icon: "account-group-outline" },
];

const defaultForm = {
  title: "",
  description: "",
  speakerName: "",
  organizerName: "",
  contactEmail: "",
  bannerImage: "",
  eventType: "workshop",
  location: "",
  meetingLink: "",
  startDateTime: "",
  endDateTime: "",
  capacity: "",
};

const approvalMeta: Record<string, any> = {
  pending: {
    label: "Pending",
    bgStyle: s.badgeYellow,
    textStyle: s.badgeYellowText,
    icon: "clock-outline",
  },
  approved: {
    label: "Approved",
    bgStyle: s.badgeGreen,
    textStyle: s.badgeGreenText,
    icon: "check-decagram",
  },
  rejected: {
    label: "Rejected",
    bgStyle: s.badgeRed,
    textStyle: s.badgeRedText,
    icon: "close-circle-outline",
  },
};

function normalizeList(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.events)) return res.events;
  return [];
}

function formatDate(value?: string) {
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

function showMessage(title: string, message: string, onOk?: () => void) {
  if (Platform.OS === "web") {
    const alertFn = (globalThis as any).alert;
    if (typeof alertFn === "function") alertFn(`${title}: ${message}`);
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

function getApprovalInfo(status?: string) {
  return approvalMeta[status || "pending"] || approvalMeta.pending;
}

function getEventTypeLabel(type?: string) {
  return eventTypes.find((item) => item.value === type)?.label || "Event";
}

function getEventIcon(type?: string) {
  return eventTypes.find((item) => item.value === type)?.icon || "calendar-heart";
}

export default function UserEventsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const loadUpcomingEvents = async () => {
    const res = await eventService.getEvents({
      page: 1,
      limit: 50,
    });

    setUpcomingEvents(normalizeList(res));
  };

  const loadMyEvents = async () => {
    const res = await eventOwnerService.getMyEvents();
    setMyEvents(normalizeList(res));
  };

  const loadRegisteredEvents = async () => {
    const res = await eventService.getRegisteredEvents({
      status: "registered",
      page: 1,
      limit: 50,
    });

    setRegisteredEvents(normalizeList(res));
  };

  const loadData = async () => {
    setLoading(true);

    try {
      if (activeTab === "upcoming") await loadUpcomingEvents();
      if (activeTab === "mine") await loadMyEvents();
      if (activeTab === "registered") await loadRegisteredEvents();
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể tải danh sách event.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activeTab])
  );

  const resetForm = () => {
    setEditingEvent(null);
    setFormData(defaultForm);
  };

  const openCreateModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);

    setFormData({
      title: event.title || "",
      description: event.description || "",
      speakerName: event.speakerName || "",
      organizerName: event.organizerName || "",
      contactEmail: event.contactEmail || "",
      bannerImage: event.bannerImage || "",
      eventType: event.eventType || "workshop",
      location: event.location || "",
      meetingLink: event.meetingLink || "",
      startDateTime: event.startDateTime || "",
      endDateTime: event.endDateTime || "",
      capacity: event.capacity ? String(event.capacity) : "",
    });

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const buildPayload = () => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      speakerName: formData.speakerName.trim() || null,
      organizerName: formData.organizerName.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      bannerImage: formData.bannerImage.trim() || null,
      eventType: formData.eventType.trim() || null,
      location: formData.location.trim() || null,
      meetingLink: formData.meetingLink.trim() || null,
      startDateTime: formData.startDateTime.trim(),
      endDateTime: formData.endDateTime.trim(),
      capacity: formData.capacity.trim() ? Number(formData.capacity) : null,
    };
  };

  const handleSaveEvent = async () => {
    if (submitting) return;

    if (!formData.title.trim()) {
      showMessage("Thiếu thông tin", "Vui lòng nhập tiêu đề event.");
      return;
    }

    if (!formData.startDateTime.trim() || !formData.endDateTime.trim()) {
      showMessage("Thiếu thời gian", "Vui lòng nhập thời gian bắt đầu và kết thúc.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = buildPayload();

      const response = editingEvent
        ? await eventOwnerService.updateEvent(editingEvent._id, payload)
        : await eventOwnerService.createEvent(payload);

      if (response.success) {
        closeModal();
        setActiveTab("mine");
        await loadMyEvents();

        showMessage(
          "Thành công",
          editingEvent
            ? "Cập nhật event thành công."
            : "Tạo event thành công. Event đang chờ admin duyệt."
        );
      } else {
        showMessage("Lỗi", response.message || "Không thể lưu event.");
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể lưu event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOwnerEvent = async (eventId: string) => {
    const deleteNow = async () => {
      try {
        const response = await eventOwnerService.deleteEvent(eventId);

        if (response.success) {
          setMyEvents((prev) => prev.filter((item) => item._id !== eventId));
          showMessage("Đã xóa", "Event đã được xóa thành công.");
        } else {
          showMessage("Lỗi", response.message || "Không thể xóa event.");
        }
      } catch (error: any) {
        showMessage("Lỗi", error?.message || "Không thể xóa event.");
      }
    };

    const webConfirm = askConfirm("Bạn có chắc muốn xóa event này không?");
    if (webConfirm === false) return;
    if (webConfirm === true) {
      await deleteNow();
      return;
    }

    Alert.alert("Xóa event", "Bạn có chắc muốn xóa event này không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: deleteNow },
    ]);
  };

  const handleRegister = async (eventId: string) => {
    try {
      const response = await eventService.registerEvent(eventId);

      if (response.success) {
        showMessage("Thành công", "Đăng ký event thành công.");
        await loadUpcomingEvents();
      } else {
        showMessage("Lỗi", response.message || "Không thể đăng ký event.");
      }
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể đăng ký event.");
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    const cancelNow = async () => {
      try {
        const response = await eventService.cancelRegistration(eventId);

        if (response.success) {
          setRegisteredEvents((prev) => prev.filter((item) => item._id !== eventId));
          showMessage("Thành công", "Đã hủy đăng ký event.");
        } else {
          showMessage("Lỗi", response.message || "Không thể hủy đăng ký.");
        }
      } catch (error: any) {
        showMessage("Lỗi", error?.message || "Không thể hủy đăng ký.");
      }
    };

    const webConfirm = askConfirm("Bạn có chắc muốn hủy đăng ký event này?");
    if (webConfirm === false) return;
    if (webConfirm === true) {
      await cancelNow();
      return;
    }

    Alert.alert("Hủy đăng ký", "Bạn có chắc muốn hủy đăng ký event này?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy đăng ký", style: "destructive", onPress: cancelNow },
    ]);
  };

  const currentData = useMemo(() => {
    if (activeTab === "upcoming") return upcomingEvents;
    if (activeTab === "mine") return myEvents;
    return registeredEvents;
  }, [activeTab, upcomingEvents, myEvents, registeredEvents]);

  const renderEventCard = ({ item }: { item: any }) => {
    const approval = getApprovalInfo(item.approvalStatus);
    const registeredCount = item.registeredCount || 0;
    const fillRate = getFillRate(item.capacity, registeredCount);
    const locked = item.approvalStatus === "approved" && item.lockAfterApproval;

    return (
      <View
        style={[
          s.card,
          item.approvalStatus === "approved" && s.cardApprovedGlow,
          item.approvalStatus === "pending" && s.cardPendingGlow,
          item.approvalStatus === "rejected" && s.cardRejectedGlow,
        ]}
      >
        <View style={s.cardTop}>
          <View
            style={[
              s.eventIconWrap,
              item.approvalStatus === "pending" && s.eventIconWrapWarning,
              item.approvalStatus === "rejected" && s.eventIconWrapDanger,
            ]}
          >
            <MaterialCommunityIcons
              name={getEventIcon(item.eventType)}
              size={27}
              color={
                item.approvalStatus === "rejected"
                  ? "#DC2626"
                  : item.approvalStatus === "pending"
                  ? "#B45309"
                  : "#00866B"
              }
            />
          </View>

          <View style={s.cardTitleBlock}>
            <Text style={s.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={s.cardSubtitle}>
              {getEventTypeLabel(item.eventType)}
            </Text>
          </View>

          {activeTab === "mine" ? (
            <View style={[s.badge, approval.bgStyle]}>
              <MaterialCommunityIcons
                name={approval.icon}
                size={13}
                color={
                  item.approvalStatus === "approved"
                    ? "#047857"
                    : item.approvalStatus === "rejected"
                    ? "#DC2626"
                    : "#B45309"
                }
              />
              <Text style={[s.badgeText, approval.textStyle]}>
                {approval.label}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={s.infoPanel}>
          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="calendar-clock-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>Bắt đầu: {formatDate(item.startDateTime)}</Text>
          </View>

          <View style={s.infoRow}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>Kết thúc: {formatDate(item.endDateTime)}</Text>
          </View>

          <View style={[s.infoRow, { marginBottom: 0 }]}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color="#00866B"
            />
            <Text style={s.infoText}>
              {item.location || item.meetingLink || "Chưa xác định"}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={s.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        <View style={s.statsRow}>
          <View style={s.statMiniCard}>
            <Text style={s.statMiniValue}>{registeredCount}</Text>
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

        {item.capacity ? (
          <View style={s.progressBlock}>
            <View style={s.progressHeader}>
              <Text style={s.progressText}>
                {registeredCount} / {item.capacity} người đăng ký
              </Text>
              <Text style={s.progressText}>{fillRate}%</Text>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${fillRate}%` }]} />
            </View>
          </View>
        ) : null}

        {activeTab === "upcoming" ? (
          <TouchableOpacity
            style={s.primaryButton}
            onPress={() => handleRegister(item._id)}
          >
            <MaterialCommunityIcons name="calendar-plus" size={21} color="#FFFFFF" />
            <Text style={s.primaryButtonText}>Đăng ký tham gia</Text>
          </TouchableOpacity>
        ) : null}

        {activeTab === "registered" ? (
          <TouchableOpacity
            style={s.cancelButton}
            onPress={() => handleCancelRegistration(item._id)}
          >
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={21}
              color="#DC2626"
            />
            <Text style={s.cancelButtonText}>Hủy đăng ký</Text>
          </TouchableOpacity>
        ) : null}

        {activeTab === "mine" ? (
          <View style={s.ownerActions}>
            {locked ? (
              <View style={s.lockBox}>
                <MaterialCommunityIcons name="lock-outline" size={18} color="#0369A1" />
                <Text style={s.lockText}>Approved - đã khóa chỉnh sửa</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={s.editButton}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={s.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.deleteButton}
                  onPress={() => handleDeleteOwnerEvent(item._id)}
                >
                  <Text style={s.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
      </View>
    );
  };

  const upcomingCount = upcomingEvents.length;
  const mineCount = myEvents.length;
  const registeredCount = registeredEvents.length;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.hero}>
        <View style={s.heroCircleOne} />
        <View style={s.heroCircleTwo} />

        <View style={s.heroTop}>
          <TouchableOpacity style={s.iconButtonLight} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </TouchableOpacity>

          <TouchableOpacity style={s.iconButtonGreen} onPress={openCreateModal}>
            <MaterialCommunityIcons name="plus" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={s.heroTitle}>SOUL Events</Text>
        <Text style={s.heroSubtitle}>
          Join healing workshops, create your own event, and keep track of your emotional wellness schedule.
        </Text>

        <View style={s.heroStats}>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{upcomingCount}</Text>
            <Text style={s.heroStatLabel}>Available</Text>
          </View>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{mineCount}</Text>
            <Text style={s.heroStatLabel}>Created</Text>
          </View>
          <View style={s.heroStatCard}>
            <Text style={s.heroStatValue}>{registeredCount}</Text>
            <Text style={s.heroStatLabel}>Joined</Text>
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
        <ActivityIndicator
          size="large"
          color="#00866B"
          style={{ marginTop: 46 }}
        />
      ) : (
        <FlatList
          data={currentData}
          renderItem={renderEventCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View style={s.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={46}
                  color="#8FB9AE"
                />
              </View>
              <Text style={s.emptyTitle}>
                {activeTab === "upcoming"
                  ? "Chưa có event đã duyệt"
                  : activeTab === "mine"
                  ? "Bạn chưa tạo event nào"
                  : "Bạn chưa đăng ký event nào"}
              </Text>
              <Text style={s.emptyText}>
                {activeTab === "mine"
                  ? "Bấm dấu + để tạo event mới và gửi admin duyệt."
                  : "Kéo xuống để làm mới danh sách event."}
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={s.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.modalPanel}>
            <View style={s.modalHandle} />

            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>
                  {editingEvent ? "Edit Event" : "Create Event"}
                </Text>
                <Text style={s.modalSubtitle}>
                  Event sẽ được admin duyệt trước khi hiển thị công khai.
                </Text>
              </View>

              <Pressable style={s.closeButton} onPress={closeModal}>
                <MaterialCommunityIcons name="close" size={25} color="#064D3D" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.formLabel}>Loại event</Text>
              <View style={s.selectRow}>
                {eventTypes.map((type) => {
                  const active = formData.eventType === type.value;

                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[s.selectChip, active && s.selectChipActive]}
                      onPress={() =>
                        setFormData({ ...formData, eventType: type.value })
                      }
                    >
                      <Text style={[s.selectText, active && s.selectTextActive]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.formLabel}>Tiêu đề *</Text>
              <TextInput
                style={s.input}
                placeholder="Workshop chăm sóc cảm xúc"
                placeholderTextColor="#94A3B8"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <Text style={s.formLabel}>Thời gian bắt đầu *</Text>
              <TextInput
                style={s.input}
                placeholder="2026-08-10T09:00:00.000Z"
                placeholderTextColor="#94A3B8"
                value={formData.startDateTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, startDateTime: text })
                }
              />

              <Text style={s.formLabel}>Thời gian kết thúc *</Text>
              <TextInput
                style={s.input}
                placeholder="2026-08-10T11:00:00.000Z"
                placeholderTextColor="#94A3B8"
                value={formData.endDateTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, endDateTime: text })
                }
              />

              <Text style={s.formLabel}>Địa điểm</Text>
              <TextInput
                style={s.input}
                placeholder="FPT University Hall"
                placeholderTextColor="#94A3B8"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <Text style={s.formLabel}>Link online</Text>
              <TextInput
                style={s.input}
                placeholder="Zoom / Google Meet link"
                placeholderTextColor="#94A3B8"
                value={formData.meetingLink}
                onChangeText={(text) =>
                  setFormData({ ...formData, meetingLink: text })
                }
              />

              <Text style={s.formLabel}>Diễn giả</Text>
              <TextInput
                style={s.input}
                placeholder="Ms. Lan"
                placeholderTextColor="#94A3B8"
                value={formData.speakerName}
                onChangeText={(text) =>
                  setFormData({ ...formData, speakerName: text })
                }
              />

              <Text style={s.formLabel}>Đơn vị tổ chức</Text>
              <TextInput
                style={s.input}
                placeholder="SOUL Community"
                placeholderTextColor="#94A3B8"
                value={formData.organizerName}
                onChangeText={(text) =>
                  setFormData({ ...formData, organizerName: text })
                }
              />

              <Text style={s.formLabel}>Email liên hệ</Text>
              <TextInput
                style={s.input}
                placeholder="events@soul.com"
                placeholderTextColor="#94A3B8"
                value={formData.contactEmail}
                onChangeText={(text) =>
                  setFormData({ ...formData, contactEmail: text })
                }
              />

              <Text style={s.formLabel}>Sức chứa</Text>
              <TextInput
                style={s.input}
                placeholder="50"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={formData.capacity}
                onChangeText={(text) => setFormData({ ...formData, capacity: text })}
              />

              <Text style={s.formLabel}>Mô tả</Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Mô tả nội dung, mục tiêu và lợi ích của event..."
                placeholderTextColor="#94A3B8"
                multiline
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
              />

              <TouchableOpacity
                style={[s.saveButton, submitting && { opacity: 0.65 }]}
                onPress={handleSaveEvent}
                disabled={submitting}
              >
                <Text style={s.saveButtonText}>
                  {submitting
                    ? "Đang lưu..."
                    : editingEvent
                    ? "Save Changes"
                    : "Create Event"}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}