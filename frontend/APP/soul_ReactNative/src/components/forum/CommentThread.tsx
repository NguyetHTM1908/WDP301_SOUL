import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";
import type { ForumUser } from "@/utils/forumIdentity";

type ReactionType = "support" | "hug" | "encourage" | "thankyou";

type Props = {
  postId: string;
  comments: any[];
  commentInput: string;
  replyInputs: Record<string, string>;
  openReplyCommentId: string | null;
  currentUser?: ForumUser | null;
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
};

function getAnonymousAlias(user?: ForumUser | null) {
  return user?.anonymousAlias || "Ẩn danh SOUL";
}

const DEFAULT_AVATAR_URL =
  "https://ui-avatars.com/api/?name=SOUL&background=E8F8F3&color=00866B";

const ANONYMOUS_AVATAR_URL =
  "https://cdn-media.sforum.vn/storage/app/media/thunguyen/13.jpg";

function getCommentAvatarUrl(comment: any) {
  if (comment?.isAnonymous === true) {
    return (
      comment?.displayAuthor?.avatarUrl ||
      comment?.authorId?.anonymousAvatarUrl ||
      comment?.authorId?.avatarUrl ||
      ANONYMOUS_AVATAR_URL
    );
  }

  const name =
    comment?.displayAuthor?.fullName ||
    comment?.authorId?.fullName ||
    comment?.author?.fullName ||
    "SOUL User";

  return (
    comment?.displayAuthor?.avatarUrl ||
    comment?.authorId?.avatarUrl ||
    comment?.author?.avatarUrl ||
    `${DEFAULT_AVATAR_URL}&name=${encodeURIComponent(name)}`
  );
}

export function CommentThread({
  postId,
  comments,
  commentInput,
  replyInputs,
  openReplyCommentId,
  currentUser,
  currentUserId,
  setCommentInputs,
  setReplyInputs,
  setOpenReplyCommentId,
  commentAnonymousByPost,
  setCommentAnonymousByPost,
  replyAnonymousByComment,
  setReplyAnonymousByComment,
  onSendComment,
  onReplyComment,
  onReactComment,
  onEditComment,
  onDeleteComment,
  onReportComment,
}: Props) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [menuOpenCommentId, setMenuOpenCommentId] = useState<string | null>(null);

  const commentAsAnonymous = Boolean(commentAnonymousByPost[postId]);

  const getCommentId = (comment: any) =>
    comment?._id?.toString?.() ||
    comment?.id?.toString?.() ||
    comment?._id ||
    comment?.id ||
    "";

  const getAuthorId = (comment: any) => {
    if (!comment?.authorId) return null;

    if (typeof comment.authorId === "string") {
      return comment.authorId;
    }

    return (
      comment.authorId._id?.toString?.() ||
      comment.authorId.id?.toString?.() ||
      null
    );
  };

  const getParentId = (comment: any) => {
    if (!comment?.parentCommentId) return null;

    if (typeof comment.parentCommentId === "string") {
      return comment.parentCommentId;
    }

    return (
      comment.parentCommentId._id?.toString?.() ||
      comment.parentCommentId.id?.toString?.() ||
      null
    );
  };

  const getCommentAuthorName = (comment: any) => {
    if (comment?.isAnonymous === true) {
      return (
        comment?.displayAuthor?.fullName ||
        comment?.anonymousName ||
        comment?.authorId?.anonymousAlias ||
        comment?.authorId?.fullName ||
        "Ẩn danh SOUL"
      );
    }

    return (
      comment?.displayAuthor?.fullName ||
      comment?.authorId?.fullName ||
      "Người dùng SOUL"
    );
  };

  const parentComments = comments.filter((comment) => !getParentId(comment));

  const getRootParentId = (comment: any): string => {
    let current = comment;

    while (getParentId(current)) {
      const parent = comments.find(
        (item) => getCommentId(item) === getParentId(current)
      );

      if (!parent) break;

      current = parent;
    }

    return getCommentId(current);
  };

  const getAllRepliesOfRoot = (rootParentId: string) => {
    return comments.filter((comment) => {
      const parentId = getParentId(comment);

      if (!parentId) return false;

      return getRootParentId(comment) === rootParentId;
    });
  };

  const toggleMainCommentIdentity = () => {
    setCommentAnonymousByPost((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleReplyIdentity = (commentId: string) => {
    setReplyAnonymousByComment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const openReplyInput = (comment: any) => {
    const commentId = getCommentId(comment);
    const authorName = getCommentAuthorName(comment);

    setMenuOpenCommentId(null);
    setOpenReplyCommentId(openReplyCommentId === commentId ? null : commentId);

    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: prev[commentId] || `@${authorName} `,
    }));

    setReplyAnonymousByComment((prev) => ({
      ...prev,
      [commentId]: prev[commentId] || false,
    }));
  };

  const openEdit = (comment: any) => {
    const commentId = getCommentId(comment);

    setMenuOpenCommentId(null);
    setEditingCommentId(commentId);
    setEditingContent(comment?.content || "");
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const saveEdit = (commentId: string) => {
    const value = editingContent.trim();

    if (!value) return;

    onEditComment(postId, commentId, value);
    cancelEdit();
  };

  const toggleMenu = (commentId: string) => {
    setMenuOpenCommentId((prev) => (prev === commentId ? null : commentId));
  };

  const handleReport = (commentId: string) => {
    setMenuOpenCommentId(null);
    onReportComment(commentId);
  };

  const handleDelete = (commentId: string) => {
    setMenuOpenCommentId(null);
    onDeleteComment(postId, commentId);
  };

  const renderIdentityToggle = ({
    active,
    onPress,
    anonymousText,
    realText,
  }: {
    active: boolean;
    onPress: () => void;
    anonymousText: string;
    realText: string;
  }) => {
    return (
      <Pressable
        onPress={onPress}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: active ? "#E8F8F3" : "#F1F5F9",
          borderWidth: 1,
          borderColor: active ? "#00866B" : "#CBD5E1",
          marginBottom: 8,
        }}
      >
        <MaterialCommunityIcons
          name={active ? "incognito" : "account-circle-outline"}
          size={16}
          color={active ? "#00866B" : "#475569"}
        />

        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: active ? "#00866B" : "#475569",
          }}
        >
          {active ? anonymousText : realText}
        </Text>
      </Pressable>
    );
  };

  const renderContent = (comment: any) => {
    const commentId = getCommentId(comment);

    if (editingCommentId === commentId) {
      return (
        <View style={s.replyInputRow}>
          <TextInput
            style={s.replyInput}
            value={editingContent}
            onChangeText={setEditingContent}
            placeholder="Chỉnh sửa bình luận..."
            placeholderTextColor="#8A9996"
          />

          <Pressable style={s.replySend} onPress={() => saveEdit(commentId)}>
            <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
          </Pressable>

          <Pressable style={s.replySendCancel} onPress={cancelEdit}>
            <MaterialCommunityIcons name="close" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      );
    }

    return <Text style={s.inlineCommentText}>{comment?.content}</Text>;
  };

  const renderMenu = (comment: any, isOwner: boolean) => {
    const commentId = getCommentId(comment);

    if (menuOpenCommentId !== commentId) return null;

    return (
      <View style={s.commentMenu}>
        {isOwner ? (
          <>
            <Pressable style={s.commentMenuItem} onPress={() => openEdit(comment)}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={17}
                color="#064D3D"
              />
              <Text style={s.commentMenuText}>Chỉnh sửa</Text>
            </Pressable>

            <Pressable
              style={s.commentMenuItem}
              onPress={() => handleDelete(commentId)}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={17}
                color="#EF4444"
              />
              <Text style={[s.commentMenuText, s.commentMenuDeleteText]}>
                Xóa
              </Text>
            </Pressable>
          </>
        ) : null}

        <Pressable
          style={s.commentMenuItem}
          onPress={() => handleReport(commentId)}
        >
          <MaterialCommunityIcons
            name="flag-outline"
            size={17}
            color="#064D3D"
          />
          <Text style={s.commentMenuText}>Báo cáo</Text>
        </Pressable>
      </View>
    );
  };

  const renderActions = (comment: any, rootParentId?: string) => {
    const commentId = getCommentId(comment);
    const submitParentId = rootParentId || commentId;
    const stats = comment?.statistics || {};
    const replyAsAnonymous = Boolean(replyAnonymousByComment[commentId]);

    const authorId = getAuthorId(comment);
    const isOwner =
      comment?.viewer?.isOwner === true ||
      comment?.isMine === true ||
      (!!currentUserId &&
        !!authorId &&
        String(authorId) === String(currentUserId));

    return (
      <>
        <View style={s.commentActionRow}>
          <Pressable onPress={() => onReactComment(postId, commentId, "support")}>
            <Text style={s.commentActionText}>💚 {stats.supportCount || 0}</Text>
          </Pressable>

          <Pressable onPress={() => onReactComment(postId, commentId, "hug")}>
            <Text style={s.commentActionText}>🤗 {stats.hugCount || 0}</Text>
          </Pressable>

          <Pressable onPress={() => onReactComment(postId, commentId, "encourage")}>
            <Text style={s.commentActionText}>🌟 {stats.encourageCount || 0}</Text>
          </Pressable>

          <Pressable onPress={() => onReactComment(postId, commentId, "thankyou")}>
            <Text style={s.commentActionText}>🙏 {stats.thankyouCount || 0}</Text>
          </Pressable>

          <Pressable onPress={() => openReplyInput(comment)}>
            <Text style={s.commentActionText}>Trả lời</Text>
          </Pressable>
        </View>

        {openReplyCommentId === commentId ? (
          <View>
            {renderIdentityToggle({
              active: replyAsAnonymous,
              onPress: () => toggleReplyIdentity(commentId),
              anonymousText: `Trả lời ẩn danh với tên ${getAnonymousAlias(
                currentUser
              )}`,
              realText: "Trả lời bằng tài khoản của tôi",
            })}

            <View style={s.replyInputRow}>
              <TextInput
                style={s.replyInput}
                placeholder="Viết phản hồi..."
                placeholderTextColor="#8A9996"
                value={replyInputs[commentId] || ""}
                onChangeText={(text) =>
                  setReplyInputs((prev) => ({
                    ...prev,
                    [commentId]: text,
                  }))
                }
              />

              <Pressable
                style={s.replySend}
                onPress={() => onReplyComment(postId, submitParentId, commentId)}
              >
                <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}

        {renderMenu(comment, isOwner)}
      </>
    );
  };

  const renderCommentCard = (comment: any, rootParentId?: string) => {
    const commentId = getCommentId(comment);
    const isReply = !!rootParentId;
    const avatarUrl = getCommentAvatarUrl(comment);

    return (
      <View key={commentId} style={isReply ? s.replyCard : s.inlineCommentCard}>
        <View style={s.commentTopRow}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 10,
            }}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#E8F8F3",
              }}
            />

            <View style={{ flex: 1 }}>
              <Text style={s.inlineCommentAuthor}>
                {getCommentAuthorName(comment)}
              </Text>

              {comment?.isAnonymous ? (
                <Text style={s.inlineCommentMeta}>
                  {isReply ? "Phản hồi ẩn danh" : "Bình luận ẩn danh"}
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            style={s.commentMenuButton}
            onPress={() => toggleMenu(commentId)}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={20}
              color="#60706C"
            />
          </Pressable>
        </View>

        {renderContent(comment)}
        {renderActions(comment, rootParentId)}
      </View>
    );
  };

  return (
    <View style={s.inlineCommentBox}>
      {parentComments.map((comment) => {
        const commentId = getCommentId(comment);
        const replies = getAllRepliesOfRoot(commentId);

        return (
          <View key={commentId} style={s.commentThread}>
            {renderCommentCard(comment)}

            {replies.length > 0 ? (
              <View style={s.replyList}>
                {replies.map((reply) => renderCommentCard(reply, commentId))}
              </View>
            ) : null}
          </View>
        );
      })}

      {renderIdentityToggle({
        active: commentAsAnonymous,
        onPress: toggleMainCommentIdentity,
        anonymousText: `Bình luận ẩn danh với tên ${getAnonymousAlias(
          currentUser
        )}`,
        realText: "Bình luận bằng tài khoản của tôi",
      })}

      <View style={s.inlineCommentInputRow}>
        <TextInput
          style={s.inlineCommentInput}
          placeholder="Viết một bình luận động viên..."
          placeholderTextColor="#8A9996"
          value={commentInput}
          onChangeText={(text) =>
            setCommentInputs((prev) => ({
              ...prev,
              [postId]: text,
            }))
          }
        />

        <Pressable style={s.inlineCommentSend} onPress={() => onSendComment(postId)}>
          <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}