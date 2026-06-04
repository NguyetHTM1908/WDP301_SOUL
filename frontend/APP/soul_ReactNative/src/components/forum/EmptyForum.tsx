import { Text, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type Props = {
  mode: "community" | "mine";
};

export function EmptyForum({ mode }: Props) {
  return (
    <View style={s.emptyBox}>
      <Text style={s.emptyIcon}>🌿</Text>
      <Text style={s.emptyTitle}>
        {mode === "mine" ? "No personal posts yet" : "No posts yet"}
      </Text>
      <Text style={s.emptyText}>
        {mode === "mine"
          ? "Your pending and approved posts will appear here."
          : "Approved community posts will appear here."}
      </Text>
    </View>
  );
}