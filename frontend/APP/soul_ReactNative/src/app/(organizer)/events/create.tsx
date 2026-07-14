import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { eventOwnerService } from "@/services/eventApi";
import { eventStyles as s } from "@/styles/event.styles";

type EventTypeValue = "workshop" | "talkshow" | "webinar" | "community_event";
type EventModeValue = "online" | "offline";

const HOME_ROUTE = "/(tabs)" as any;

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

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatTimeInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

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

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);

  const localDate = new Date(
    yearNumber,
    monthNumber - 1,
    dayNumber,
    hourNumber,
    minuteNumber,
    0,
    0
  );

  const isInvalidDate =
    Number.isNaN(localDate.getTime()) ||
    localDate.getFullYear() !== yearNumber ||
    localDate.getMonth() !== monthNumber - 1 ||
    localDate.getDate() !== dayNumber ||
    localDate.getHours() !== hourNumber ||
    localDate.getMinutes() !== minuteNumber;

  if (isInvalidDate) {
    return null;
  }

  return localDate.toISOString();
}

export default function AdminCreateEvent() {
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

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

  const goHome = () => {
    router.replace(HOME_ROUTE);
  };

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
        "Vui lòng nhập ngày theo dạng DD/MM/YYYY và giờ theo dạng HH:mm. Ví dụ: 10/07/2026 và 09:00."
      );
      return false;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      showMessage(
        "Thời gian không hợp lệ",
        "Thời gian kết thúc phải sau thời gian bắt đầu."
      );
      return false;
    }

    if (formData.eventMode === "offline" && !formData.location.trim()) {
      showMessage("Thiếu địa điểm", "Vui lòng nhập địa điểm tổ chức sự kiện.");
      return false;
    }

    if (formData.eventMode === "online" && !formData.meetingLink.trim()) {
      showMessage(
        "Thiếu link",
        "Vui lòng nhập link Zoom/Meet cho sự kiện online."
      );
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
      const response = await eventOwnerService.createEvent(payload);

      if (response.success) {
        showMessage(
          "Tạo event thành công",
          "Event đã được tạo và đang chờ admin duyệt.",
          goHome
        );
        return;
      }

      showMessage("Lỗi", response.message || "Không thể tạo event.");
    } catch (error: any) {
      showMessage(
        "Lỗi tạo event",
        error?.message || "Đã xảy ra lỗi khi tạo sự kiện."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.adminHeader}>
          <View style={s.adminHeaderTop}>
            <TouchableOpacity
              style={s.iconButtonLight}
              activeOpacity={0.8}
              onPress={goHome}
              disabled={submitting}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#064D3D"
              />
            </TouchableOpacity>
          </View>

          <Text style={s.adminTitle}>Tạo sự kiện</Text>
          <Text style={s.adminSubtitle}>
            Tạo event mới, sau đó hệ thống sẽ đưa vào hàng chờ duyệt.
          </Text>
        </View>

        <ScrollView
          style={s.formContainer}
          contentContainerStyle={s.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.eventIconWrap}>
                <MaterialCommunityIcons
                  name={selectedType?.icon || "calendar-heart"}
                  size={30}
                  color="#00866B"
                />
              </View>

              <View style={s.cardTitleBlock}>
                <Text style={s.cardTitle}>
                  {formData.title.trim() || "Sự kiện SOUL mới"}
                </Text>

                <Text style={s.cardSubtitle}>
                  {selectedType?.label} · {selectedType?.description} ·{" "}
                  {selectedMode?.label}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.formSection}>
            <Text style={s.formSectionTitle}>Thông tin chính</Text>

            <Field
              label="Tiêu đề sự kiện *"
              placeholder="VD: Workshop Vượt Qua Lo Âu"
              value={formData.title}
              onChangeText={(text) => updateField("title", text)}
              editable={!submitting}
            />

            <Text style={s.label}>Loại sự kiện</Text>

            <View style={s.typeGrid}>
              {EVENT_TYPES.map((item) => {
                const active = formData.eventType === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.85}
                    style={[s.typeCard, active && s.typeCardActive]}
                    onPress={() => updateField("eventType", item.value)}
                    disabled={submitting}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={active ? "#FFFFFF" : "#00866B"}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={[s.typeTitle, active && s.typeTitleActive]}>
                        {item.label}
                      </Text>

                      <Text
                        style={[
                          s.typeDescription,
                          active && s.typeDescriptionActive,
                        ]}
                      >
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={s.label}>Hình thức sự kiện</Text>

            <View style={s.typeGrid}>
              {EVENT_MODES.map((item) => {
                const active = formData.eventMode === item.value;

                return (
                  <TouchableOpacity
                    key={item.value}
                    activeOpacity={0.85}
                    style={[s.typeCard, active && s.typeCardActive]}
                    onPress={() => updateField("eventMode", item.value)}
                    disabled={submitting}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={active ? "#FFFFFF" : "#00866B"}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={[s.typeTitle, active && s.typeTitleActive]}>
                        {item.label}
                      </Text>

                      <Text
                        style={[
                          s.typeDescription,
                          active && s.typeDescriptionActive,
                        ]}
                      >
                        {item.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Field
              label="Mô tả"
              placeholder="Mô tả nội dung, mục tiêu và lợi ích của sự kiện..."
              value={formData.description}
              onChangeText={(text) => updateField("description", text)}
              editable={!submitting}
              multiline
            />
          </View>

          <View style={s.formSection}>
            <Text style={s.formSectionTitle}>Thời gian</Text>

            <Field
              label="Ngày bắt đầu *"
              placeholder="VD: 10/07/2026"
              value={formData.startDate}
              onChangeText={(text) =>
                updateField("startDate", formatDateInput(text))
              }
              editable={!submitting}
              autoCapitalize="none"
              keyboardType="numeric"
            />

            <Field
              label="Giờ bắt đầu *"
              placeholder="VD: 09:00"
              value={formData.startTime}
              onChangeText={(text) =>
                updateField("startTime", formatTimeInput(text))
              }
              editable={!submitting}
              autoCapitalize="none"
              keyboardType="numeric"
            />

            <Field
              label="Ngày kết thúc *"
              placeholder="VD: 10/07/2026"
              value={formData.endDate}
              onChangeText={(text) =>
                updateField("endDate", formatDateInput(text))
              }
              editable={!submitting}
              autoCapitalize="none"
              keyboardType="numeric"
            />

            <Field
              label="Giờ kết thúc *"
              placeholder="VD: 11:00"
              value={formData.endTime}
              onChangeText={(text) =>
                updateField("endTime", formatTimeInput(text))
              }
              editable={!submitting}
              autoCapitalize="none"
              keyboardType="numeric"
            />

            
          </View>

          <View style={s.formSection}>
            <Text style={s.formSectionTitle}>Địa điểm & số lượng</Text>

            {formData.eventMode === "offline" ? (
              <Field
                label="Địa điểm offline *"
                placeholder="VD: Hội trường FPT University"
                value={formData.location}
                onChangeText={(text) => updateField("location", text)}
                editable={!submitting}
              />
            ) : (
              <Field
                label="Link online *"
                placeholder="VD: https://zoom.us/..."
                value={formData.meetingLink}
                onChangeText={(text) => updateField("meetingLink", text)}
                editable={!submitting}
                autoCapitalize="none"
              />
            )}

            <Field
              label="Sức chứa"
              placeholder="VD: 50"
              value={formData.capacity}
              onChangeText={(text) =>
                updateField("capacity", text.replace(/[^0-9]/g, ""))
              }
              editable={!submitting}
              keyboardType="numeric"
            />
          </View>

          <View style={s.formSection}>
            <Text style={s.formSectionTitle}>Diễn giả & liên hệ</Text>

            <Field
              label="Tên diễn giả"
              placeholder="VD: Dr. Minh"
              value={formData.speakerName}
              onChangeText={(text) => updateField("speakerName", text)}
              editable={!submitting}
            />

            <Field
              label="Đơn vị tổ chức"
              placeholder="VD: SOUL Team"
              value={formData.organizerName}
              onChangeText={(text) => updateField("organizerName", text)}
              editable={!submitting}
            />

            <Field
              label="Email liên hệ"
              placeholder="VD: events@soul.com"
              value={formData.contactEmail}
              onChangeText={(text) => updateField("contactEmail", text)}
              editable={!submitting}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Field
              label="Ảnh banner"
              placeholder="URL ảnh banner"
              value={formData.bannerImage}
              onChangeText={(text) => updateField("bannerImage", text)}
              editable={!submitting}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[s.submitButton, submitting && s.disabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={22}
                  color="#FFFFFF"
                />
                <Text style={s.submitButtonText}>Tạo event chờ duyệt</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryButton}
            activeOpacity={0.85}
            onPress={goHome}
            disabled={submitting}
          >
            <Text style={s.secondaryButtonText}>Quay lại trang chủ</Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: any;
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  autoCapitalize = "sentences",
  keyboardType = "default",
}: FieldProps) {
  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>

      <TextInput
        style={[s.input, multiline && s.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#8CA8A1"
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </View>
  );
}