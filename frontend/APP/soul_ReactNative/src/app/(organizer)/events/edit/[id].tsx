import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

type EventTypeValue = "workshop" | "talkshow" | "webinar" | "community_event";
type EventModeValue = "online" | "offline";

const EVENT_TYPES: {
  label: string;
  value: EventTypeValue;
  icon: any;
  description: string;
}[] = [
  {
    label: "Workshop",
    value: "workshop",
    icon: "school-outline",
    description: "Buổi học / thực hành",
  },
  {
    label: "Talkshow",
    value: "talkshow",
    icon: "microphone-outline",
    description: "Chia sẻ cùng diễn giả",
  },
  {
    label: "Webinar",
    value: "webinar",
    icon: "video-outline",
    description: "Sự kiện online",
  },
  {
    label: "Community",
    value: "community_event",
    icon: "account-group-outline",
    description: "Hoạt động cộng đồng",
  },
];

const EVENT_MODES: {
  label: string;
  value: EventModeValue;
  icon: any;
  description: string;
}[] = [
  {
    label: "Offline",
    value: "offline",
    icon: "map-marker-outline",
    description: "Tổ chức tại địa điểm cụ thể",
  },
  {
    label: "Online",
    value: "online",
    icon: "video-outline",
    description: "Tổ chức qua Zoom/Meet",
  },
];

const initialForm = {
  title: "",
  description: "",
  speakerName: "",
  organizerName: "",
  contactEmail: "",
  bannerImage: "",
  eventType: "workshop" as EventTypeValue,
  eventMode: "offline" as EventModeValue,
  location: "",
  meetingLink: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  capacity: "",
};

function getSafeId(rawId: unknown) {
  if (Array.isArray(rawId)) return rawId[0] || "";
  if (typeof rawId === "string") return rawId;
  return "";
}

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

function normalizeText(value: string) {
  const text = value.trim();
  return text ? text : null;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function convertVietnamDateTimeToISO(dateText: string, timeText: string) {
  const date = dateText.trim();
  const time = timeText.trim();

  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  const dateMatch = date.match(dateRegex);
  const timeMatch = time.match(timeRegex);

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const [, day, month, year] = dateMatch;
  const [, hour, minute] = timeMatch;

  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0
  );

  if (Number.isNaN(localDate.getTime())) {
    return null;
  }

  return localDate.toISOString();
}

function splitISOToVietnamInput(value?: string | null) {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      date: "",
      time: "",
    };
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}:${minute}`,
  };
}

export default function OrganizerEditEvent() {
  const params = useLocalSearchParams();
  const id = getSafeId(params.id);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string>("pending");

  const selectedType = useMemo(() => {
    return EVENT_TYPES.find((item) => item.value === formData.eventType);
  }, [formData.eventType]);

  const selectedMode = useMemo(() => {
    return EVENT_MODES.find((item) => item.value === formData.eventMode);
  }, [formData.eventMode]);

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      Alert.alert("Lỗi", "Không tìm thấy ID sự kiện.");
      return;
    }

    setLoading(true);

    try {
      const response = await eventOwnerService.getMyEventById(id);
      const event = response?.data?.event || response?.data;

      if (response?.success === false || !event) {
        Alert.alert("Lỗi", response?.message || "Không tìm thấy event.");
        router.replace("/(organizer)/events" as any);
        return;
      }

      if (event.approvalStatus === "approved") {
        Alert.alert(
          "Không thể chỉnh sửa",
          "Event đã được admin duyệt nên không thể chỉnh sửa."
        );
        router.replace(`/(organizer)/events/${id}` as any);
        return;
      }

      const start = splitISOToVietnamInput(event.startDateTime);
      const end = splitISOToVietnamInput(event.endDateTime);

      setApprovalStatus(event.approvalStatus || "pending");

      setFormData({
        title: event.title || "",
        description: event.description || "",
        speakerName: event.speakerName || "",
        organizerName: event.organizerName || "",
        contactEmail: event.contactEmail || "",
        bannerImage: event.bannerImage || "",
        eventType: event.eventType || "workshop",
        eventMode: event.eventMode || "offline",
        location: event.location || "",
        meetingLink: event.meetingLink || "",
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        capacity:
          event.capacity === null || event.capacity === undefined
            ? ""
            : String(event.capacity),
      });
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải event.");
      router.replace("/(organizer)/events" as any);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchEvent();
    }, [fetchEvent])
  );

  const buildPayload = () => {
    const startDateTime =
      convertVietnamDateTimeToISO(formData.startDate, formData.startTime) || "";

    const endDateTime =
      convertVietnamDateTimeToISO(formData.endDate, formData.endTime) || "";

    return {
      title: formData.title.trim(),
      description: normalizeText(formData.description),
      speakerName: normalizeText(formData.speakerName),
      organizerName: normalizeText(formData.organizerName),
      contactEmail: normalizeText(formData.contactEmail),
      bannerImage: normalizeText(formData.bannerImage),
      eventType: formData.eventType,
      eventMode: formData.eventMode,
      location:
        formData.eventMode === "offline"
          ? normalizeText(formData.location)
          : null,
      meetingLink:
        formData.eventMode === "online"
          ? normalizeText(formData.meetingLink)
          : null,
      startDateTime,
      endDateTime,
      capacity: formData.capacity.trim() ? Number(formData.capacity) : null,
    };
  };

  const validateForm = () => {
    if (approvalStatus === "approved") {
      showMessage(
        "Không thể chỉnh sửa",
        "Event đã được admin duyệt nên không thể chỉnh sửa."
      );
      return false;
    }

    if (!formData.title.trim()) {
      showMessage("Thiếu thông tin", "Vui lòng nhập tiêu đề sự kiện.");
      return false;
    }

    const startDateTime = convertVietnamDateTimeToISO(
      formData.startDate,
      formData.startTime
    );

    const endDateTime = convertVietnamDateTimeToISO(
      formData.endDate,
      formData.endTime
    );

    if (!startDateTime || !endDateTime) {
      showMessage(
        "Thời gian không hợp lệ",
        "Vui lòng nhập ngày DD/MM/YYYY và giờ HH:mm."
      );
      return false;
    }

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      showMessage(
        "Thời gian không hợp lệ",
        "Thời gian kết thúc phải sau thời gian bắt đầu."
      );
      return false;
    }

    if (formData.eventMode === "offline" && !formData.location.trim()) {
      showMessage("Thiếu địa điểm", "Vui lòng nhập địa điểm.");
      return false;
    }

    if (formData.eventMode === "online" && !formData.meetingLink.trim()) {
      showMessage("Thiếu link", "Vui lòng nhập link Zoom/Meet.");
      return false;
    }

    if (formData.capacity.trim()) {
      const capacity = Number(formData.capacity);

      if (!Number.isInteger(capacity) || capacity < 1) {
        showMessage(
          "Sức chứa không hợp lệ",
          "Sức chứa phải là số nguyên lớn hơn 0."
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = buildPayload();
      const response = await eventOwnerService.updateEvent(id, payload);

      if (response?.success === false) {
        showMessage("Lỗi", response?.message || "Không thể cập nhật event.");
        return;
      }

      showMessage("Thành công", "Đã cập nhật event.", () => {
        router.replace(`/(organizer)/events/${id}` as any);
      });
    } catch (error: any) {
      showMessage("Lỗi", error?.message || "Không thể cập nhật event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00866B" />
          <Text style={styles.loadingText}>Đang tải event...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.iconButtonLight}
              onPress={() => router.replace(`/(organizer)/events/${id}` as any)}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#064D3D"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Sửa event</Text>
          <Text style={styles.subtitle}>
            Chỉ event chưa được admin duyệt mới được chỉnh sửa.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            <Text style={styles.label}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Workshop Chánh niệm"
              placeholderTextColor="#8CA8A1"
              value={formData.title}
              onChangeText={(value) => updateField("title", value)}
            />

            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập mô tả sự kiện..."
              placeholderTextColor="#8CA8A1"
              multiline
              value={formData.description}
              onChangeText={(value) => updateField("description", value)}
            />

            <Text style={styles.label}>Diễn giả</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên diễn giả"
              placeholderTextColor="#8CA8A1"
              value={formData.speakerName}
              onChangeText={(value) => updateField("speakerName", value)}
            />

            <Text style={styles.label}>Đơn vị tổ chức</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên CLB / tổ chức"
              placeholderTextColor="#8CA8A1"
              value={formData.organizerName}
              onChangeText={(value) => updateField("organizerName", value)}
            />

            <Text style={styles.label}>Email liên hệ</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#8CA8A1"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.contactEmail}
              onChangeText={(value) => updateField("contactEmail", value)}
            />

            <Text style={styles.label}>Ảnh banner URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              placeholderTextColor="#8CA8A1"
              autoCapitalize="none"
              value={formData.bannerImage}
              onChangeText={(value) => updateField("bannerImage", value)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Loại event</Text>

            <View style={styles.optionGrid}>
              {EVENT_TYPES.map((item) => {
                const active = formData.eventType === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.optionCard, active && styles.optionActive]}
                    onPress={() => updateField("eventType", item.value)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={25}
                      color={active ? "#FFFFFF" : "#00866B"}
                    />
                    <Text
                      style={[
                        styles.optionTitle,
                        active && styles.optionTitleActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionSub,
                        active && styles.optionSubActive,
                      ]}
                    >
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.selectedHint}>
              Đang chọn: {selectedType?.label}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Hình thức tổ chức</Text>

            <View style={styles.optionGrid}>
              {EVENT_MODES.map((item) => {
                const active = formData.eventMode === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.optionCard, active && styles.optionActive]}
                    onPress={() => updateField("eventMode", item.value)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={25}
                      color={active ? "#FFFFFF" : "#00866B"}
                    />
                    <Text
                      style={[
                        styles.optionTitle,
                        active && styles.optionTitleActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionSub,
                        active && styles.optionSubActive,
                      ]}
                    >
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.selectedHint}>
              Đang chọn: {selectedMode?.label}
            </Text>

            {formData.eventMode === "offline" ? (
              <>
                <Text style={styles.label}>Địa điểm *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: FPT University, Hội trường..."
                  placeholderTextColor="#8CA8A1"
                  value={formData.location}
                  onChangeText={(value) => updateField("location", value)}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Link Zoom/Meet *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://meet.google.com/..."
                  placeholderTextColor="#8CA8A1"
                  autoCapitalize="none"
                  value={formData.meetingLink}
                  onChangeText={(value) => updateField("meetingLink", value)}
                />
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thời gian & sức chứa</Text>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Ngày bắt đầu *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#8CA8A1"
                  keyboardType="number-pad"
                  value={formData.startDate}
                  onChangeText={(value) =>
                    updateField("startDate", formatDateInput(value))
                  }
                />
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.label}>Giờ bắt đầu *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:mm"
                  placeholderTextColor="#8CA8A1"
                  keyboardType="number-pad"
                  value={formData.startTime}
                  onChangeText={(value) =>
                    updateField("startTime", formatTimeInput(value))
                  }
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Ngày kết thúc *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#8CA8A1"
                  keyboardType="number-pad"
                  value={formData.endDate}
                  onChangeText={(value) =>
                    updateField("endDate", formatDateInput(value))
                  }
                />
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.label}>Giờ kết thúc *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:mm"
                  placeholderTextColor="#8CA8A1"
                  keyboardType="number-pad"
                  value={formData.endTime}
                  onChangeText={(value) =>
                    updateField("endTime", formatTimeInput(value))
                  }
                />
              </View>
            </View>

            <Text style={styles.label}>Sức chứa</Text>
            <TextInput
              style={styles.input}
              placeholder="Bỏ trống nếu không giới hạn"
              placeholderTextColor="#8CA8A1"
              keyboardType="number-pad"
              value={formData.capacity}
              onChangeText={(value) => updateField("capacity", value)}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={styles.submitText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3FBF8",
  },

  keyboard: {
    flex: 1,
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
    alignItems: "center",
    marginBottom: 14,
  },

  iconButtonLight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
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

  content: {
    padding: 18,
    paddingBottom: 36,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2F3EE",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#064D3D",
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#064D3D",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D8EFE8",
    paddingHorizontal: 13,
    fontSize: 14,
    color: "#064D3D",
  },

  textArea: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  optionCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D8EFE8",
    padding: 14,
  },

  optionActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  optionTitle: {
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },

  optionTitleActive: {
    color: "#FFFFFF",
  },

  optionSub: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },

  optionSubActive: {
    color: "#E8FFF7",
  },

  selectedHint: {
    marginTop: 12,
    color: "#49756C",
    fontSize: 13,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  rowItem: {
    flex: 1,
  },

  submitButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.65,
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
});