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
        {mode === "mine" ? "Bạn chưa có bài viết nào" : "Chưa có bài viết nào"}
      </Text>

      <Text style={s.emptyText}>
        {mode === "mine"
          ? "Các bài viết đang chờ duyệt và đã được duyệt của bạn sẽ hiển thị tại đây."
          : "Các bài viết cộng đồng đã được duyệt sẽ hiển thị tại đây."}
      </Text>
    </View>
  );
}