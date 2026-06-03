import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type Props = {
  mode: "community" | "mine";
  onCommunityPress: () => void;
  onMinePress: () => void;
};

export function ForumBottomSwitcher({
  mode,
  onCommunityPress,
  onMinePress,
}: Props) {
  return (
    <View style={s.bottomSwitcher}>
      <Pressable
        style={[s.bottomTab, mode === "community" && s.bottomTabActive]}
        onPress={onCommunityPress}
      >
        <MaterialCommunityIcons
          name="account-group-outline"
          size={22}
          color={mode === "community" ? "#FFFFFF" : "#40657D"}
        />
        <Text
          style={[
            s.bottomTabText,
            mode === "community" && s.bottomTabTextActive,
          ]}
        >
          Community
        </Text>
      </Pressable>

      <Pressable
        style={[s.bottomTab, mode === "mine" && s.bottomTabActive]}
        onPress={onMinePress}
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={22}
          color={mode === "mine" ? "#FFFFFF" : "#40657D"}
        />
        <Text style={[s.bottomTabText, mode === "mine" && s.bottomTabTextActive]}>
          My Posts
        </Text>
      </Pressable>
    </View>
  );
}