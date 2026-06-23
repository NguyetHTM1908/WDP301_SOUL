import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
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

type Emotion = {
  value: string;
  label: string;
  text: string;
};

type Props = {
  visible: boolean;
  isEditing?: boolean;
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
};

export function CreatePostModal({
  visible,
  isEditing = false,
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
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
              {isEditing ? "Edit your story" : "Share your feeling ✨"}
            </Text>

            <Text style={s.modalSub}>
              {isEditing
                ? "Your updated post will stay published. SOUL AI may review it again to keep the space safe."
                : "Your post will be published immediately. SOUL AI may review it to keep the community safe."}
            </Text>

            <View style={s.bigInputWrap}>
              <TextInput
                style={s.bigInput}
                multiline
                placeholder="What is on your mind today?"
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
                placeholder="Image / Video URL optional"
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
                placeholder="Hashtags: stress, self-care"
                placeholderTextColor="#8A9996"
                value={hashtags}
                onChangeText={setHashtags}
                autoCapitalize="none"
              />
            </View>

            <Text style={s.feelingLabel}>How are you feeling?</Text>

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

            <View style={s.anonymousRow}>
              <View style={s.anonLeft}>
                <MaterialCommunityIcons
                  name="incognito"
                  size={24}
                  color="#95A19E"
                />
                <Text style={s.anonText}>Post anonymously</Text>
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
                  placeholder="Anonymous name: Thỏ lém lỉnh..."
                  placeholderTextColor="#8A9996"
                  value={anonymousName}
                  onChangeText={setAnonymousName}
                />
              </View>
            ) : null}

            <Pressable style={s.submitButton} onPress={onSubmit}>
              <MaterialCommunityIcons
                name={isEditing ? "content-save-outline" : "send-outline"}
                size={24}
                color="#FFFFFF"
              />
              <Text style={s.submitText}>
                {isEditing ? "Update Post" : "Publish Now"}
              </Text>
            </Pressable>

            <Pressable onPress={onClose}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}