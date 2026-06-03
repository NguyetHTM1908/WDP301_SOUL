import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type ReactionType = "like" | "support" | "hug";

type Props = {
  postId: string;
  comments: any[];
  commentInput: string;
  replyInputs: Record<string, string>;
  openReplyCommentId: string | null;
  currentUserId: string | null;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOpenReplyCommentId: React.Dispatch<React.SetStateAction<string | null>>;
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

export function CommentThread({
  postId,
  comments,
  commentInput,
  replyInputs,
  openReplyCommentId,
  currentUserId,
  setCommentInputs,
  setReplyInputs,
  setOpenReplyCommentId,
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

  const getCommentId = (comment: any) =>
    comment?._id?.toString?.() || comment?._id || "";

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

    return comment.parentCommentId._id?.toString?.() || null;
  };

  const getCommentAuthorName = (comment: any) =>
    comment?.authorId?.fullName || "Anonymous";

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

  const openReplyInput = (comment: any) => {
    const commentId = getCommentId(comment);
    const authorName = getCommentAuthorName(comment);

    setMenuOpenCommentId(null);
    setOpenReplyCommentId(openReplyCommentId === commentId ? null : commentId);

    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: prev[commentId] || `@${authorName} `,
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

  const renderContent = (comment: any) => {
    const commentId = getCommentId(comment);

    if (editingCommentId === commentId) {
      return (
        <View style={s.replyInputRow}>
          <TextInput
            style={s.replyInput}
            value={editingContent}
            onChangeText={setEditingContent}
            placeholder="Edit your comment..."
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
              <Text style={s.commentMenuText}>Edit</Text>
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
                Delete
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
          <Text style={s.commentMenuText}>Report</Text>
        </Pressable>
      </View>
    );
  };

  const renderActions = (comment: any, rootParentId?: string) => {
    const commentId = getCommentId(comment);
    const submitParentId = rootParentId || commentId;

    const authorId = getAuthorId(comment);
    const isOwner =
      !!currentUserId &&
      !!authorId &&
      String(authorId) === String(currentUserId);

    return (
      <>
        <View style={s.commentActionRow}>
          <Pressable onPress={() => onReactComment(postId, commentId, "like")}>
            <Text style={s.commentActionText}>
              ❤️ {comment?.statistics?.likeCount || 0}
            </Text>
          </Pressable>

          <Pressable onPress={() => onReactComment(postId, commentId, "support")}>
            <Text style={s.commentActionText}>
              💚 {comment?.statistics?.supportCount || 0}
            </Text>
          </Pressable>

          <Pressable onPress={() => onReactComment(postId, commentId, "hug")}>
            <Text style={s.commentActionText}>
              🤗 {comment?.statistics?.hugCount || 0}
            </Text>
          </Pressable>

          <Pressable onPress={() => openReplyInput(comment)}>
            <Text style={s.commentActionText}>Reply</Text>
          </Pressable>
        </View>

        {openReplyCommentId === commentId ? (
          <View style={s.replyInputRow}>
            <TextInput
              style={s.replyInput}
              placeholder="Write a reply..."
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
        ) : null}

        {renderMenu(comment, isOwner)}
      </>
    );
  };

  const renderCommentCard = (comment: any, rootParentId?: string) => {
    const commentId = getCommentId(comment);
    const isReply = !!rootParentId;

    return (
      <View key={commentId} style={isReply ? s.replyCard : s.inlineCommentCard}>
        <View style={s.commentTopRow}>
          <Text style={s.inlineCommentAuthor}>
            {getCommentAuthorName(comment)}
          </Text>

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

      <View style={s.inlineCommentInputRow}>
        <TextInput
          style={s.inlineCommentInput}
          placeholder="Write a comment..."
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