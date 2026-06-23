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

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
};

const reasons = [
  {
    value: "toxic_behavior",
    label: "Toxic",
    icon: "alert-circle-outline",
  },
  {
    value: "harassment",
    label: "Harassment",
    icon: "account-alert-outline",
  },
  {
    value: "spam",
    label: "Spam",
    icon: "email-alert-outline",
  },
  {
    value: "self_harm_risk",
    label: "Self-harm risk",
    icon: "heart-alert-outline",
  },
  {
    value: "negative_content",
    label: "Not suitable",
    icon: "flag-outline",
  },
];

export function ReportModal({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("toxic_behavior");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit(reason, description || "Nội dung có thể không phù hợp với cộng đồng.");
    setReason("toxic_behavior");
    setDescription("");
  };

  const handleClose = () => {
    setReason("toxic_behavior");
    setDescription("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
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

          <Text style={s.reportTitle}>Report content</Text>

          <Text style={s.reportSub}>
            Help us keep SOUL safe, respectful, and supportive.
          </Text>

          <View style={s.reasonList}>
            {reasons.map((item) => {
              const active = reason === item.value;

              return (
                <Pressable
                  key={item.value}
                  style={[s.reasonChip, active && s.reasonChipActive]}
                  onPress={() => setReason(item.value)}
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
            placeholder="More details optional..."
            placeholderTextColor="#8A9996"
            value={description}
            onChangeText={setDescription}
          />

          <Pressable style={s.submitButton} onPress={handleSubmit}>
            <MaterialCommunityIcons name="flag-outline" size={22} color="#FFFFFF" />
            <Text style={s.submitText}>Submit Report</Text>
          </Pressable>

          <Pressable onPress={handleClose}>
            <Text style={s.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}