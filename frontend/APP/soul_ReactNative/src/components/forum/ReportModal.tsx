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
import { forumStyles as s } from "@/styles/forum.styles";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
};

const reasons = [
  "negative_content",
  "toxic_behavior",
  "harassment",
  "spam",
  "self_harm_risk",
];

export function ReportModal({ visible, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState("negative_content");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onSubmit(reason, description || "Nội dung có thể không phù hợp.");
    setReason("negative_content");
    setDescription("");
  };

  const handleClose = () => {
    setReason("negative_content");
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
          <Text style={s.reportTitle}>Report content</Text>

          <Text style={s.reportSub}>
            Help us keep SOUL safe and supportive.
          </Text>

          <View style={s.reasonList}>
            {reasons.map((item) => {
              const active = reason === item;

              return (
                <Pressable
                  key={item}
                  style={[s.reasonChip, active && s.reasonChipActive]}
                  onPress={() => setReason(item)}
                >
                  <Text style={[s.reasonText, active && s.reasonTextActive]}>
                    {item.replaceAll("_", " ")}
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