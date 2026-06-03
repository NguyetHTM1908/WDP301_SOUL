import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";
import { CommentThread } from "./CommentThread";

type ReactionType = "like" | "support" | "hug";

type Props = {
  item: any;
  mode: "community" | "mine";
  moodLabel: (mood: string) => string;
  openCommentPostId: string | null;
  commentsByPost: Record<string, any[]>;
  commentInputs: Record<string, string>;
  replyInputs: Record<string, string>;
  openReplyCommentId: string | null;
  currentUserId: string | null;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOpenReplyCommentId: React.Dispatch<React.SetStateAction<string | null>>;
  onReactPost: (postId: string, type: ReactionType) => void;
  onReportPost: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onSendComment: (postId: string) => void;
  onReplyComment: (
    postId: string,
    parentCommentId: string,
    inputCommentId?: string
  ) => void;
  onReactComment: (
    postId: string,
    commentId: string,
    type: ReactionType
  ) => void;
  onEditComment: (postId: string, commentId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onReportComment: (commentId: string) => void;
  onEditPost: (post: any) => void;
  onDeletePost: (postId: string) => void;
};

function normalizeImageUrl(url: any) {
  if (!url || typeof url !== "string") return "";

  return url.trim();
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function PostCard({
  item,
  mode,
  moodLabel,
  openCommentPostId,
  commentsByPost,
  commentInputs,
  replyInputs,
  openReplyCommentId,
  currentUserId,
  setCommentInputs,
  setReplyInputs,
  setOpenReplyCommentId,
  onReactPost,
  onReportPost,
  onToggleComments,
  onSendComment,
  onReplyComment,
  onReactComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
  onEditPost,
  onDeletePost,
}: Props) {
  const [imageError, setImageError] = useState(false);

  const postId = item?._id?.toString?.() || item?._id;

  const authorName = item?.isAnonymous
    ? "Anonymous Soul"
    : item?.authorId?.fullName || "SOUL User";

  const avatar = item?.isAnonymous
    ? "https://i.pravatar.cc/100?img=12"
    : item?.authorId?.avatarUrl || "https://i.pravatar.cc/100?img=32";

  const mediaUrl = normalizeImageUrl(item?.mediaUrls?.[0]?.url);
  const shouldShowImage = isRemoteUrl(mediaUrl) && !imageError;

  return (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <View style={s.authorRow}>
          <Image source={{ uri: avatar }} style={s.avatar} />

          <View style={s.authorInfo}>
            <View style={s.nameRow}>
              <Text style={s.authorName}>{authorName}</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={15}
                color="#00866B"
              />
            </View>

            <Text style={s.postMeta}>{moodLabel(item?.emotionStatus)}</Text>
          </View>
        </View>

        {mode === "mine" ? (
          <View style={s.mineActions}>
            <View style={s.statusBadge}>
              <Text style={s.statusText}>{item?.status || "pending"}</Text>
            </View>

            <View style={s.ownerActions}>
              <Pressable onPress={() => onEditPost(item)}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={22}
                  color="#00866B"
                />
              </Pressable>

              <Pressable onPress={() => onDeletePost(postId)}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#EF4444"
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => onReportPost(postId)}>
            <MaterialCommunityIcons
              name="flag-outline"
              size={23}
              color="#60706C"
            />
          </Pressable>
        )}
      </View>

      <Text style={s.postContent}>{item?.content}</Text>

      {item?.hashtags?.length > 0 ? (
        <View style={s.tagRow}>
          {item.hashtags.map((tag: string) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {shouldShowImage ? (
        <Image
          source={{ uri: mediaUrl }}
          style={s.postImage}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      ) : null}

      {imageError ? (
        <View style={s.mediaPlaceholder}>
          <MaterialCommunityIcons
            name="image-broken-variant"
            size={36}
            color="#8A9996"
          />
          <Text style={s.mediaPlaceholderText}>
            Không thể tải ảnh. Hãy dùng link ảnh trực tiếp.
          </Text>
        </View>
      ) : null}

      <View style={s.actionRow}>
        <Pressable
          style={s.actionItem}
          onPress={() => onReactPost(postId, "like")}
        >
          <Text style={s.actionEmoji}>❤️</Text>
          <Text style={s.actionText}>{item?.statistics?.likeCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.actionItem}
          onPress={() => onReactPost(postId, "support")}
        >
          <Text style={s.actionEmoji}>💚</Text>
          <Text style={s.actionText}>{item?.statistics?.supportCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.actionItem}
          onPress={() => onReactPost(postId, "hug")}
        >
          <Text style={s.actionEmoji}>🤗</Text>
          <Text style={s.actionText}>{item?.statistics?.hugCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.actionItem}
          onPress={() => onToggleComments(postId)}
        >
          <MaterialCommunityIcons
            name="comment-outline"
            size={22}
            color="#60706C"
          />
          <Text style={s.actionText}>{item?.statistics?.commentCount || 0}</Text>
        </Pressable>
      </View>

      {openCommentPostId === postId ? (
        <CommentThread
          postId={postId}
          comments={commentsByPost[postId] || []}
          commentInput={commentInputs[postId] || ""}
          replyInputs={replyInputs}
          openReplyCommentId={openReplyCommentId}
          currentUserId={currentUserId}
          setCommentInputs={setCommentInputs}
          setReplyInputs={setReplyInputs}
          setOpenReplyCommentId={setOpenReplyCommentId}
          onSendComment={onSendComment}
          onReplyComment={onReplyComment}
          onReactComment={onReactComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onReportComment={onReportComment}
        />
      ) : null}
    </View>
  );
}