import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { forumStyles as s } from "@/styles/forum.styles";

export type ReportReason =
  | "toxic_language"
  | "harassment"
  | "spam"
  | "self_harm"
  | "other";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, description: string) => void | Promise<void>;
};

const reasons: Array<{
  value: ReportReason;
  label: string;
  icon: string;
}> = [
  {
    value: "toxic_language",
    label: "Ngôn từ độc hại",
    icon: "alert-circle-outline",
  },
  {
    value: "harassment",
    label: "Quấy rối",
    icon: "account-alert-outline",
  },
  {
    value: "spam",
    label: "Spam",
    icon: "email-alert-outline",
  },
  {
    value: "self_harm",
    label: "Nguy cơ tự hại",
    icon: "heart-alert-outline",
  },
  {
    value: "other",
    label: "Nội dung không phù hợp",
    icon: "flag-outline",
  },
];

export function ReportModal({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason>("toxic_language");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setReason("toxic_language");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await onSubmit(
        reason,
        description.trim() || "Nội dung có thể không phù hợp với cộng đồng."
      );
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={s.reportBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.reportModal}>
          <View style={s.reportIconCircle}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={30}
              color="#00866B"
            />
          </View>

          <Text style={s.reportTitle}>Báo cáo nội dung</Text>
          <Text style={s.reportSub}>
            Giúp SOUL giữ cộng đồng an toàn, tôn trọng và luôn hỗ trợ nhau.
          </Text>

          <View style={s.reasonList}>
            {reasons.map((item) => {
              const active = reason === item.value;

              return (
                <Pressable
                  key={item.value}
                  style={[s.reasonChip, active && s.reasonChipActive]}
                  onPress={() => setReason(item.value)}
                  disabled={submitting}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={16}
                    color={active ? "#FFFFFF" : "#064D3D"}
                  />
                  <Text style={[s.reasonText, active && s.reasonTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={s.reportInput}
            multiline
            placeholder="Mô tả thêm nếu cần..."
            placeholderTextColor="#8A9996"
            value={description}
            onChangeText={setDescription}
            editable={!submitting}
          />

          <Pressable
            style={[s.submitButton, submitting && { opacity: 0.65 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <MaterialCommunityIcons name="flag-outline" size={22} color="#FFFFFF" />
            <Text style={s.submitText}>
              {submitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Text>
          </Pressable>

          <Pressable onPress={handleClose} disabled={submitting}>
            <Text style={s.cancelText}>Hủy</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}