import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, View, Alert } from "react-native";
import { router } from "expo-router";
import { forumStyles as s } from "@/styles/forum.styles";
import { CommentThread } from "./CommentThread";
import { ForumUser, getForumAuthor } from "@/utils/forumIdentity";

type ReactionType = "support" | "hug" | "encourage" | "thankyou";

type Props = {
  item: any;
  mode: "community" | "mine";
  currentUser?: ForumUser | null;
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

  commentAnonymousByPost: Record<string, boolean>;
  setCommentAnonymousByPost: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  replyAnonymousByComment: Record<string, boolean>;
  setReplyAnonymousByComment: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;

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

function getItemId(item: any) {
  return (
    item?._id?.toString?.() ||
    item?.id?.toString?.() ||
    item?._id ||
    item?.id ||
    ""
  );
}

function normalizeImageUrl(url: any) {
  if (!url || typeof url !== "string") return "";
  return url.trim();
}

function isRemoteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function getStatusInfo(item: any) {
  if (item?.isFlagged && item?.toxicityLevel === "high") {
    return {
      label: "Cần xem xét khẩn cấp",
      tone: "danger",
      icon: "alert-circle-outline",
    };
  }

  if (item?.isFlagged) {
    return {
      label: "AI đang xem xét",
      tone: "warning",
      icon: "shield-alert-outline",
    };
  }

  if (item?.status === "hidden") {
    return {
      label: "Đã ẩn",
      tone: "danger",
      icon: "eye-off-outline",
    };
  }

  if (item?.status === "deleted") {
    return {
      label: "Đã xóa",
      tone: "danger",
      icon: "trash-can-outline",
    };
  }

  if (item?.status === "rejected") {
    return {
      label: "Bị từ chối",
      tone: "danger",
      icon: "close-circle-outline",
    };
  }

  if (item?.status === "approved") {
    return {
      label: "Đã đăng",
      tone: "success",
      icon: "check-circle-outline",
    };
  }

  return {
    label: "Đang chờ duyệt",
    tone: "warning",
    icon: "clock-outline",
  };
}

export function PostCard({
  item,
  mode,
  currentUser,
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
  commentAnonymousByPost,
  setCommentAnonymousByPost,
  replyAnonymousByComment,
  setReplyAnonymousByComment,
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

  const postId = getItemId(item);
  const author = getForumAuthor(item);

  const mediaUrl = normalizeImageUrl(item?.mediaUrls?.[0]?.url);
  const shouldShowImage = isRemoteUrl(mediaUrl) && !imageError;

  const stats = item?.statistics || {};
  const statusInfo = getStatusInfo(item);

  const reviewIcon =
    item?.toxicityLevel === "high"
      ? "alert-circle-outline"
      : "shield-alert-outline";

  const handleDeletePress = () => {
    if (!postId) return;
    onDeletePost(postId);
  };

  return (
    <View style={[s.postCard, item?.isFlagged && s.postCardFlagged]}>
      <View style={s.postHeader}>
        <Pressable
          style={s.authorRow}
          onPress={() => {
            if (item?.isAnonymous) {
              Alert.alert("Thông báo", "Tài khoản đăng dưới dạng ẩn danh nên không thể xem trang cá nhân.");
              return;
            }
            const authorId = item?.authorId?._id || item?.authorId;
            if (authorId) {
              router.push(`/profile/${authorId}` as any);
            }
          }}
        >
          <Image source={{ uri: author.avatarUrl }} style={s.avatar} />

          <View style={s.authorInfo}>
            <View style={s.nameRow}>
              <Text style={s.authorName}>{author.fullName}</Text>

              {author.isAnonymous ? (
                <View style={s.anonymousBadge}>
                  <MaterialCommunityIcons
                    name="incognito"
                    size={13}
                    color="#00866B"
                  />
                  <Text style={s.anonymousBadgeText}>Ẩn danh</Text>
                </View>
              ) : (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={15}
                  color="#00866B"
                />
              )}
            </View>

            <Text style={s.postMeta}>
              {author.isAnonymous
                ? "Danh tính ẩn danh"
                : moodLabel(item?.emotionStatus)}
            </Text>
          </View>
        </Pressable>

        {mode === "mine" ? (
          <View style={s.mineActions}>
            <View
              style={[
                s.statusBadge,
                statusInfo.tone === "success" && s.statusBadgeSuccess,
                statusInfo.tone === "warning" && s.statusBadgeWarning,
                statusInfo.tone === "danger" && s.statusBadgeDanger,
              ]}
            >
              <MaterialCommunityIcons
                name={statusInfo.icon as any}
                size={13}
                color={
                  statusInfo.tone === "success"
                    ? "#047857"
                    : statusInfo.tone === "danger"
                      ? "#DC2626"
                      : "#A16207"
                }
              />

              <Text
                style={[
                  s.statusText,
                  statusInfo.tone === "success" && s.statusTextSuccess,
                  statusInfo.tone === "danger" && s.statusTextDanger,
                ]}
              >
                {statusInfo.label}
              </Text>
            </View>

            <View style={s.ownerActions}>
              <Pressable onPress={() => onEditPost(item)}>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={22}
                  color="#00866B"
                />
              </Pressable>

              <Pressable onPress={handleDeletePress}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={22}
                  color="#EF4444"
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={s.iconButtonSoft}
            onPress={() => {
              if (!postId) return;
              onReportPost(postId);
            }}
          >
            <MaterialCommunityIcons
              name="flag-outline"
              size={21}
              color="#60706C"
            />
          </Pressable>
        )}
      </View>

      {item?.isFlagged ? (
        <View
          style={[
            s.aiReviewBox,
            item?.toxicityLevel === "high" && s.crisisReviewBox,
          ]}
        >
          <MaterialCommunityIcons
            name={reviewIcon as any}
            size={18}
            color={item?.toxicityLevel === "high" ? "#DC2626" : "#B45309"}
          />

          <Text
            style={[
              s.aiReviewText,
              item?.toxicityLevel === "high" && s.crisisReviewText,
            ]}
          >
            {item?.toxicityLevel === "high"
              ? "SOUL AI phát hiện bài viết có thể liên quan đến nguy cơ tự hại hoặc gây hại. Bài viết chỉ hiển thị với bạn trong khi chờ quản trị viên xem xét."
              : "SOUL AI đã chuyển bài viết này đến quản trị viên để xem xét. Bài viết chỉ hiển thị với bạn cho đến khi có quyết định."}
          </Text>
        </View>
      ) : null}

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
          resizeMode="cover"
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

      <View style={s.reactionBar}>
        <Pressable
          style={s.reactionPill}
          onPress={() => {
            if (!postId) return;
            onReactPost(postId, "support");
          }}
        >
          <Text style={s.actionEmoji}>💚</Text>
          <Text style={s.actionText}>{stats.supportCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.reactionPill}
          onPress={() => {
            if (!postId) return;
            onReactPost(postId, "hug");
          }}
        >
          <Text style={s.actionEmoji}>🤗</Text>
          <Text style={s.actionText}>{stats.hugCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.reactionPill}
          onPress={() => {
            if (!postId) return;
            onReactPost(postId, "encourage");
          }}
        >
          <Text style={s.actionEmoji}>🌟</Text>
          <Text style={s.actionText}>{stats.encourageCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.reactionPill}
          onPress={() => {
            if (!postId) return;
            onReactPost(postId, "thankyou");
          }}
        >
          <Text style={s.actionEmoji}>🙏</Text>
          <Text style={s.actionText}>{stats.thankyouCount || 0}</Text>
        </Pressable>

        <Pressable
          style={s.commentPill}
          onPress={() => {
            if (!postId) return;
            onToggleComments(postId);
          }}
        >
          <MaterialCommunityIcons
            name="comment-outline"
            size={19}
            color="#064D3D"
          />
          <Text style={s.actionText}>{stats.commentCount || 0}</Text>
        </Pressable>
      </View>

      {openCommentPostId === postId ? (
        <CommentThread
          postId={postId}
          comments={commentsByPost[postId] || []}
          commentInput={commentInputs[postId] || ""}
          replyInputs={replyInputs}
          openReplyCommentId={openReplyCommentId}
          currentUser={currentUser}
          currentUserId={currentUserId}
          setCommentInputs={setCommentInputs}
          setReplyInputs={setReplyInputs}
          setOpenReplyCommentId={setOpenReplyCommentId}
          commentAnonymousByPost={commentAnonymousByPost}
          setCommentAnonymousByPost={setCommentAnonymousByPost}
          replyAnonymousByComment={replyAnonymousByComment}
          setReplyAnonymousByComment={setReplyAnonymousByComment}
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