import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";
import {
  ANONYMOUS_AVATAR_URL,
  ForumUser,
  getCurrentForumIdentity,
} from "@/utils/forumIdentity";

type Emotion = {
  value: string;
  label: string;
  text: string;
};

type Props = {
  visible: boolean;
  isEditing?: boolean;
  currentUser?: ForumUser | null;

  content: string;
  mediaUrl: string;
  hashtags: string;
  emotionStatus: string;

  isAnonymous: boolean;
  anonymousName: string;

  emotions: Emotion[];

  setContent: (value: string) => void;
  setMediaUrl: (value: string) => void;
  setHashtags: (value: string) => void;
  setEmotionStatus: (value: string) => void;

  setIsAnonymous: (value: boolean) => void;
  setAnonymousName: (value: string) => void;

  onClose: () => void;
  onSubmit: () => void;
  hideAnonymous?: boolean;
};

export function CreatePostModal({
  visible,
  isEditing = false,
  currentUser,

  content,
  mediaUrl,
  hashtags,
  emotionStatus,

  isAnonymous,
  anonymousName,

  emotions,

  setContent,
  setMediaUrl,
  setHashtags,
  setEmotionStatus,

  setIsAnonymous,
  setAnonymousName,

  onClose,
  onSubmit,
  hideAnonymous = false,
}: Props) {
  const realIdentity = getCurrentForumIdentity({
    ...currentUser,
    anonymousModeEnabled: false,
  });

  const displayIdentity = (!hideAnonymous && isAnonymous)
    ? {
        id: currentUser?.anonymousIdentityId || null,
        fullName: anonymousName || currentUser?.anonymousAlias || "Anonymous Soul",
        avatarUrl: ANONYMOUS_AVATAR_URL,
        isAnonymous: true,
      }
    : realIdentity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={s.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.createModal}>
          <View style={s.modalHandle} />

          <Pressable style={s.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={28} color="#1F332F" />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.modalTitle}>
              {isEditing ? "Chỉnh sửa bài viết" : "Chia sẻ cảm xúc của bạn ✨"}
            </Text>

            <Text style={s.modalSub}>
              {hideAnonymous
                ? "Chia sẻ suy nghĩ và câu chuyện của bạn lên trang cá nhân."
                : "Chọn cách bạn muốn hiển thị trong cộng đồng SOUL."}
            </Text>

            <View style={s.identityPreview}>
              <Image
                source={{ uri: displayIdentity.avatarUrl || "" }}
                style={s.identityPreviewAvatar}
              />

              <View style={s.identityPreviewInfo}>
                <Text style={s.identityPreviewLabel}>
                  {hideAnonymous
                    ? "Đăng lên trang cá nhân"
                    : isAnonymous
                    ? "Đăng ẩn danh với tên"
                    : "Đăng bài với tên"}
                </Text>

                <Text style={s.identityPreviewName}>
                  {displayIdentity.fullName}
                </Text>

                <Text style={s.identityPreviewMeta}>
                  {hideAnonymous
                    ? "Bài viết sẽ hiển thị công khai trên dòng thời gian của bạn."
                    : isAnonymous
                    ? "Hồ sơ thật của bạn sẽ không hiển thị trong bài viết này."
                    : "Tên và ảnh đại diện thật của bạn sẽ được hiển thị."}
                </Text>
              </View>
            </View>

            {!hideAnonymous && (
              <>
                <View style={s.anonymousRow}>
                  <View style={s.anonLeft}>
                    <MaterialCommunityIcons
                      name="incognito"
                      size={24}
                      color="#95A19E"
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={s.anonText}>Đăng bài ẩn danh</Text>
                      <Text style={s.anonSubText}>
                        Sử dụng tên và ảnh đại diện ẩn danh cho bài viết này.
                      </Text>
                    </View>
                  </View>

                  <Switch
                    value={isAnonymous}
                    onValueChange={setIsAnonymous}
                    trackColor={{ false: "#D8E3E0", true: "#00866B" }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {isAnonymous ? (
                  <View style={s.formInput}>
                    <MaterialCommunityIcons
                      name="account-question-outline"
                      size={24}
                      color="#7A8A87"
                    />

                    <TextInput
                      style={s.formTextInput}
                      placeholder="Tên ẩn danh: Thỏ lém lỉnh..."
                      placeholderTextColor="#8A9996"
                      value={anonymousName}
                      onChangeText={setAnonymousName}
                    />
                  </View>
                ) : null}
              </>
            )}

            <View style={s.safeNotice}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color="#00866B"
              />

              <Text style={s.safeNoticeText}>
                SOUL AI có thể kiểm duyệt bài viết để giữ cộng đồng an toàn và tích cực.
              </Text>
            </View>

            <View style={s.bigInputWrap}>
              <TextInput
                style={s.bigInput}
                multiline
                placeholder="Hôm nay bạn đang nghĩ gì?"
                placeholderTextColor="#8A9996"
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />

              <Text style={s.counter}>{content.length}/1000</Text>
            </View>

            <View style={s.formInput}>
              <MaterialCommunityIcons
                name="image-outline"
                size={25}
                color="#7A8A87"
              />

              <TextInput
                style={s.formTextInput}
                placeholder="Link hình ảnh / video nếu có"
                placeholderTextColor="#8A9996"
                value={mediaUrl}
                onChangeText={setMediaUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={s.formInput}>
              <Text style={s.hashIcon}>#</Text>

              <TextInput
                style={s.formTextInput}
                placeholder="Hashtag: stress, chăm-sóc-bản-thân"
                placeholderTextColor="#8A9996"
                value={hashtags}
                onChangeText={setHashtags}
                autoCapitalize="none"
              />
            </View>

            <Text style={s.feelingLabel}>Bạn đang cảm thấy thế nào?</Text>

            <View style={s.emotionGrid}>
              {emotions.map((e) => {
                const active = emotionStatus === e.value;

                return (
                  <Pressable
                    key={e.value}
                    style={[s.emotionCard, active && s.emotionCardActive]}
                    onPress={() => setEmotionStatus(e.value)}
                  >
                    <Text style={s.emotionEmoji}>{e.label}</Text>
                    <Text style={s.emotionName}>{e.text}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={s.submitButton} onPress={onSubmit}>
              <MaterialCommunityIcons
                name={isEditing ? "content-save-outline" : "send-outline"}
                size={24}
                color="#FFFFFF"
              />

              <Text style={s.submitText}>
                {isEditing ? "Cập nhật bài viết" : "Đăng bài"}
              </Text>
            </Pressable>

            <Pressable onPress={onClose}>
              <Text style={s.cancelText}>Hủy</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}