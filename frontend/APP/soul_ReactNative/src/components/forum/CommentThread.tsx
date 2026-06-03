import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { forumStyles as s } from "@/styles/forum.styles";

type Props = {
  postId: string;
  comments: any[];
  commentInput: string;
  replyInputs: Record<string, string>;
  openReplyCommentId: string | null;
  setCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setReplyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setOpenReplyCommentId: React.Dispatch<React.SetStateAction<string | null>>;
  onSendComment: (postId: string) => void;
  onReplyComment: (postId: string, parentCommentId: string) => void;
  onReactComment: (
    postId: string,
    commentId: string,
    type: "like" | "support" | "hug"
  ) => void;
};

export function CommentThread({
  postId,
  comments,
  commentInput,
  replyInputs,
  openReplyCommentId,
  setCommentInputs,
  setReplyInputs,
  setOpenReplyCommentId,
  onSendComment,
  onReplyComment,
  onReactComment,
}: Props) {
  const getCommentId = (comment: any) => comment._id?.toString();

  const getParentId = (comment: any) => {
    if (!comment.parentCommentId) return null;
    if (typeof comment.parentCommentId === "string") return comment.parentCommentId;
    return comment.parentCommentId._id?.toString();
  };

  const getCommentAuthorName = (comment: any) =>
    comment.authorId?.fullName || "Anonymous";

  const parentComments = comments.filter((comment) => !getParentId(comment));

  const getReplies = (parentCommentId: string) => {
    return comments.filter((comment) => getParentId(comment) === parentCommentId);
  };

  const openReplyInput = (comment: any) => {
    const commentId = getCommentId(comment);
    const authorName = getCommentAuthorName(comment);

    setOpenReplyCommentId(openReplyCommentId === commentId ? null : commentId);

    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: prev[commentId] || `@${authorName} `,
    }));
  };

  return (
    <View style={s.inlineCommentBox}>
      {parentComments.map((comment) => {
        const commentId = getCommentId(comment);
        const replies = getReplies(commentId);

        return (
          <View key={commentId} style={s.commentThread}>
            <View style={s.inlineCommentCard}>
              <Text style={s.inlineCommentAuthor}>
                {getCommentAuthorName(comment)}
              </Text>

              <Text style={s.inlineCommentText}>{comment.content}</Text>

              <View style={s.commentActionRow}>
                <Pressable onPress={() => onReactComment(postId, commentId, "like")}>
                  <Text style={s.commentActionText}>
                    ❤️ {comment.statistics?.likeCount || 0}
                  </Text>
                </Pressable>

                <Pressable onPress={() => onReactComment(postId, commentId, "support")}>
                  <Text style={s.commentActionText}>
                    💚 {comment.statistics?.supportCount || 0}
                  </Text>
                </Pressable>

                <Pressable onPress={() => onReactComment(postId, commentId, "hug")}>
                  <Text style={s.commentActionText}>
                    🤗 {comment.statistics?.hugCount || 0}
                  </Text>
                </Pressable>

                <Pressable onPress={() => openReplyInput(comment)}>
                  <Text style={s.commentActionText}>Reply</Text>
                </Pressable>
              </View>

              {openReplyCommentId === commentId && (
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
                    onPress={() => onReplyComment(postId, commentId)}
                  >
                    <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
            </View>

            {replies.length > 0 && (
              <View style={s.replyList}>
                {replies.map((reply) => {
                  const replyId = getCommentId(reply);

                  return (
                    <View key={replyId} style={s.replyCard}>
                      <Text style={s.inlineCommentAuthor}>
                        {getCommentAuthorName(reply)}
                      </Text>

                      <Text style={s.inlineCommentText}>{reply.content}</Text>

                      <View style={s.commentActionRow}>
                        <Pressable onPress={() => onReactComment(postId, replyId, "like")}>
                          <Text style={s.commentActionText}>
                            ❤️ {reply.statistics?.likeCount || 0}
                          </Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onReactComment(postId, replyId, "support")}
                        >
                          <Text style={s.commentActionText}>
                            💚 {reply.statistics?.supportCount || 0}
                          </Text>
                        </Pressable>

                        <Pressable onPress={() => onReactComment(postId, replyId, "hug")}>
                          <Text style={s.commentActionText}>
                            🤗 {reply.statistics?.hugCount || 0}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
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