import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";
import { ANONYMOUS_AVATAR_URL } from "@/utils/forumIdentity";

type Props = {
  anonymousModeEnabled: boolean;
  anonymousAlias: string;
  setAnonymousAlias: (value: string) => void;
  onEnableAnonymous: () => void;
  onDisableAnonymous: () => void;
};

export function AnonymousIdentitySettings({
  anonymousModeEnabled,
  anonymousAlias,
  setAnonymousAlias,
  onEnableAnonymous,
  onDisableAnonymous,
}: Props) {
  const handleToggle = (value: boolean) => {
    if (value) {
      if (!anonymousAlias.trim()) {
        Alert.alert(
          "Thiếu tên ẩn danh",
          "Vui lòng nhập tên ẩn danh trước khi bật chế độ ẩn danh."
        );
        return;
      }

      onEnableAnonymous();
      return;
    }

    onDisableAnonymous();
  };

  return (
    <View style={s.identitySettingsCard}>
      <View style={s.identitySettingsTop}>
        <Image source={{ uri: ANONYMOUS_AVATAR_URL }} style={s.identityAvatar} />

        <View style={{ flex: 1 }}>
          <Text style={s.identityName}>Anonymous Mode</Text>

          <Text style={s.identityMeta}>
            {anonymousModeEnabled
              ? "Bạn đang đăng bài và bình luận bằng danh tính ẩn danh."
              : "Bạn đang dùng danh tính thật khi đăng bài và bình luận."}
          </Text>
        </View>

        <Switch
          value={anonymousModeEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: "#D8E3E0", true: "#00866B" }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={s.formInput}>
        <MaterialCommunityIcons
          name="account-question-outline"
          size={24}
          color="#7A8A87"
        />

        <TextInput
          style={s.formTextInput}
          placeholder="Tên ẩn danh của bạn"
          placeholderTextColor="#8A9996"
          value={anonymousAlias}
          onChangeText={setAnonymousAlias}
        />
      </View>

      {anonymousModeEnabled ? (
        <Pressable style={s.exitAnonymousButton} onPress={onDisableAnonymous}>
          <MaterialCommunityIcons
            name="logout-variant"
            size={20}
            color="#DC2626"
          />

          <Text style={s.exitAnonymousText}>Thoát ẩn danh</Text>
        </Pressable>
      ) : (
        <Pressable style={s.enableAnonymousButton} onPress={onEnableAnonymous}>
          <MaterialCommunityIcons
            name="incognito"
            size={20}
            color="#00866B"
          />

          <Text style={s.enableAnonymousText}>Bật ẩn danh</Text>
        </Pressable>
      )}
    </View>
  );
}