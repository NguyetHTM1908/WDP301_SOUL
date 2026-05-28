import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";
import { CommentThread } from "./CommentThread";

type Props = {
  item: any;
  mode: "community" | "mine";
  moodLabel: (mood: string) => string;
  openCommentPostId: string | null;
  commentsByPost: Record<string, any[]>;
  commentInputs: Record<string, string>;
  replyInputs: Record<string, string>;
  openReplyCommentId: string | null;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOpenReplyCommentId: React.Dispatch<React.SetStateAction<string | null>>;
  onReactPost: (postId: string, type: "like" | "support" | "hug") => void;
  onReportPost: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onSendComment: (postId: string) => void;
  onReplyComment: (postId: string, parentCommentId: string) => void;
  onReactComment: (
    postId: string,
    commentId: string,
    type: "like" | "support" | "hug"
  ) => void;
};

export function PostCard({
  item,
  mode,
  moodLabel,
  openCommentPostId,
  commentsByPost,
  commentInputs,
  replyInputs,
  openReplyCommentId,
  setCommentInputs,
  setReplyInputs,
  setOpenReplyCommentId,
  onReactPost,
  onReportPost,
  onToggleComments,
  onSendComment,
  onReplyComment,
  onReactComment,
}: Props) {
  const authorName = item.isAnonymous
    ? "Anonymous Soul"
    : item.authorId?.fullName || "SOUL User";

  const avatar = item.isAnonymous
    ? "https://i.pravatar.cc/100?img=12"
    : item.authorId?.avatarUrl || "https://i.pravatar.cc/100?img=32";

  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <View style={s.authorRow}>
          <Image source={{ uri: avatar }} style={s.avatar} />
          <View>
            <View style={s.nameRow}>
              <Text style={s.authorName}>{authorName}</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={15}
                color="#00866B"
              />
            </View>
            <Text style={s.postMeta}>
              Just now · {moodLabel(item.emotionStatus)}
            </Text>
          </View>
        </View>

        {mode === "mine" ? (
          <View style={s.statusBadge}>
            <Text style={s.statusText}>{item.status}</Text>
          </View>
        ) : (
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#566A66" />
        )}
      </View>

      <Text style={s.postContent}>{item.content}</Text>

      <View style={s.tagRow}>
        {item.hashtags?.map((tag: string) => (
          <View key={tag} style={s.tag}>
            <Text style={s.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      {item.mediaUrls?.[0]?.url ? (
        <Image source={{ uri: item.mediaUrls[0].url }} style={s.postImage} />
      ) : null}

      <View style={s.actionRow}>
        <Pressable style={s.actionItem} onPress={() => onReactPost(item._id, "like")}>
          <MaterialCommunityIcons name="heart-outline" size={24} color="#EF4444" />
          <Text style={s.actionText}>{item.statistics?.likeCount || 0}</Text>
        </Pressable>

        <Pressable style={s.actionItem} onPress={() => onReactPost(item._id, "support")}>
          <MaterialCommunityIcons name="hand-heart" size={24} color="#00866B" />
          <Text style={s.actionText}>{item.statistics?.supportCount || 0}</Text>
        </Pressable>

        <Pressable style={s.actionItem} onPress={() => onReactPost(item._id, "hug")}>
          <Text style={s.hugIcon}>🤗</Text>
          <Text style={s.actionText}>{item.statistics?.hugCount || 0}</Text>
        </Pressable>

        <Pressable style={s.actionItem} onPress={() => onToggleComments(item._id)}>
          <MaterialCommunityIcons name="comment-outline" size={23} color="#60706C" />
          <Text style={s.actionText}>{item.statistics?.commentCount || 0}</Text>
        </Pressable>

        <Pressable onPress={() => onReportPost(item._id)}>
          <MaterialCommunityIcons name="flag-outline" size={23} color="#60706C" />
        </Pressable>
      </View>

      {openCommentPostId === item._id && (
        <CommentThread
          postId={item._id}
          comments={commentsByPost[item._id] || []}
          commentInput={commentInputs[item._id] || ""}
          replyInputs={replyInputs}
          openReplyCommentId={openReplyCommentId}
          setCommentInputs={setCommentInputs}
          setReplyInputs={setReplyInputs}
          setOpenReplyCommentId={setOpenReplyCommentId}
          onSendComment={onSendComment}
          onReplyComment={onReplyComment}
          onReactComment={onReactComment}
        />
      )}
    </View>
  );
}