import React from "react";
import { View, Text, Modal, TouchableOpacity, Image, TextInput } from "react-native";

interface ProfileModalsProps {
  // Modal visibility states
  showCoverPresetModal: boolean;
  showUrlModal: boolean;
  showEditBioModal: boolean;

  // Form values
  inputUrl: string;
  inputBio: string;
  coverPresets: string[];

  // Setters
  setInputUrl: (val: string) => void;
  setInputBio: (val: string) => void;

  // Actions
  onCloseCoverPreset: () => void;
  onCloseUrlModal: () => void;
  onCloseEditBioModal: () => void;
  onSelectCoverPreset: (presetUrl: string) => void;
  onOpenUrlModalFromCover: () => void;
  onSaveUrlModal: () => void;
  onSaveBio: () => void;
}

export function ProfileModals({
  showCoverPresetModal,
  showUrlModal,
  showEditBioModal,
  inputUrl,
  inputBio,
  coverPresets,
  setInputUrl,
  setInputBio,
  onCloseCoverPreset,
  onCloseUrlModal,
  onCloseEditBioModal,
  onSelectCoverPreset,
  onOpenUrlModalFromCover,
  onSaveUrlModal,
  onSaveBio,
}: ProfileModalsProps) {
  return (
    <>
      {/* ================= MODAL: CHỌN COVER PRESET ================= */}
      <Modal visible={showCoverPresetModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#214B5B", marginBottom: 16 }}>Chọn ảnh bìa</Text>
            
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 20 }}>
              {coverPresets.map((preset, index) => (
                <TouchableOpacity key={index} onPress={() => onSelectCoverPreset(preset)}>
                  <Image source={{ uri: preset }} style={{ width: 140, height: 80, borderRadius: 8 }} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{ backgroundColor: "#006B5C", height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 }}
              onPress={onOpenUrlModalFromCover}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Nhập liên kết ảnh khác</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
              onPress={onCloseCoverPreset}
            >
              <Text style={{ color: "#8193A5", fontWeight: "bold" }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: NHẬP URL ẢNH (Avatar / Cover) ================= */}
      <Modal visible={showUrlModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#214B5B", marginBottom: 12 }}>Nhập liên kết ảnh (URL)</Text>
            <TextInput
              placeholder="https://example.com/image.jpg"
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, height: 50, paddingHorizontal: 16, marginBottom: 20 }}
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }}
                onPress={onCloseUrlModal}
              >
                <Text style={{ color: "#8193A5", fontWeight: "bold" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, height: 50, backgroundColor: "#006B5C", borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                onPress={onSaveUrlModal}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Lưu lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: SỬA TIỂU SỬ (BIO) ================= */}
      <Modal visible={showEditBioModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#FFFFFF", borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#214B5B", marginBottom: 12 }}>Chỉnh sửa tiểu sử</Text>
            <TextInput
              placeholder="Hãy viết gì đó về bản thân bạn..."
              value={inputBio}
              onChangeText={setInputBio}
              maxLength={100}
              multiline
              style={{ borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, height: 80, padding: 16, textAlignVertical: "top", marginBottom: 8 }}
            />
            <Text style={{ textAlign: "right", color: "#A0AEC0", fontSize: 12, marginBottom: 20 }}>
              {inputBio.length}/100 ký tự
            </Text>
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }}
                onPress={onCloseEditBioModal}
              >
                <Text style={{ color: "#8193A5", fontWeight: "bold" }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, height: 50, backgroundColor: "#006B5C", borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                onPress={onSaveBio}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
