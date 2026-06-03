import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useAuthStore } from "@/store";

import {
  createComment,
  createPost,
  deleteComment,
  getApprovedPosts,
  getComments,
  getMyPosts,
  reactToComment,
  reactToPost,
  reportPost,
  updateComment,
} from "@/api/forumApi";

import { forumStyles as s } from "@/styles/forum.styles";

import { ForumHeader } from "@/components/forum/ForumHeader";
import { PostCard } from "@/components/forum/PostCard";
import { CreatePostModal } from "@/components/forum/CreatePostModal";
import { ForumBottomSwitcher } from "@/components/forum/ForumBottomSwitcher";
import { EmptyForum } from "@/components/forum/EmptyForum";

const filters = ["all", "stress", "self-care", "student-life", "deadline"];

const emotions = [
  { value: "happy", label: "😊", text: "Happy" },
  { value: "sad", label: "😔", text: "Sad" },
  { value: "stress", label: "😵", text: "Stress" },
  { value: "anxious", label: "😟", text: "Anxious" },
  { value: "angry", label: "😤", text: "Angry" },
  { value: "neutral", label: "🌱", text: "Neutral" },
];

function moodLabel(mood: string) {
  const found = emotions.find((item) => item.value === mood);
  return found ? `${found.label} ${found.text}` : "🌱 Neutral";
}

function normalizePosts(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.posts)) return res.posts;
  if (Array.isArray(res?.data?.posts)) return res.data.posts;
  return [];
}

function normalizeComments(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.comments)) return res.comments;
  if (Array.isArray(res?.data?.comments)) return res.data.comments;
  return [];
}

function isApiSuccess(res: any) {
  return res?.success === true || res?.status === "success" || res?.message;
}

function getUserIdFromToken(token: string | null) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decoded =
      typeof atob !== "undefined"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");

    const parsed = JSON.parse(decoded);

    return (
      parsed._id ||
      parsed.id ||
      parsed.userId ||
      parsed.user?._id ||
      parsed.user?.id ||
      null
    );
  } catch (error) {
    console.log("Cannot decode token:", error);
    return null;
  }
}

export default function ForumScreen() {
  const user = useAuthStore((state: any) => state.user);

  const [token, setToken] = useState<string | null>(null);
  const currentUserId =
    user?._id || user?.id || getUserIdFromToken(token);

  const [posts, setPosts] = useState<any[]>([]);
  const [mode, setMode] = useState<"community" | "mine">("community");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("stress, deadline");
  const [emotionStatus, setEmotionStatus] = useState("stress");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);

  const requireLogin = () => {
    if (!token) {
      Alert.alert("Bạn cần đăng nhập", "Vui lòng đăng nhập để dùng chức năng này.");
      return false;
    }
    return true;
  };

  const loadPosts = async (
    nextMode: "community" | "mine" = mode,
    currentToken: string | null = token
  ) => {
    try {
      if (nextMode === "mine") {
        if (!currentToken) return;
        const res = await getMyPosts(currentToken);
        setPosts(normalizePosts(res));
        return;
      }

      const res = await getApprovedPosts();
      setPosts(normalizePosts(res));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không tải được bài viết.");
    }
  };

  const reloadComments = async (postId: string) => {
    const updated = await getComments(postId);

    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: normalizeComments(updated),
    }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        setToken(savedToken);

        const res = await getApprovedPosts();
        setPosts(normalizePosts(res));
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không tải được bài viết cộng đồng.");
      }
    };

    init();
  }, []);

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      const matchFilter =
        filter === "all" || post.hashtags?.some((tag: string) => tag === filter);

      const matchSearch =
        search.trim() === "" ||
        post.content?.toLowerCase().includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [posts, filter, search]);

  const handleCreatePost = async () => {
    if (!requireLogin()) return;

    if (!content.trim()) {
      Alert.alert("Thiếu nội dung", "Nhập nội dung bài viết trước nha.");
      return;
    }

    const body = {
      content: content.trim(),
      mediaUrls: mediaUrl.trim()
        ? [
            {
              url: mediaUrl.trim(),
              type: mediaUrl.trim().includes(".mp4") ? "video" : "image",
            },
          ]
        : [],
      emotionStatus,
      hashtags: hashtags
        .split(",")
        .map((tag) => tag.replace("#", "").trim())
        .filter(Boolean),
      isAnonymous,
      visibility: "public",
    };

    try {
      const res = await createPost(token as string, body);

      if (isApiSuccess(res)) {
        Alert.alert("Đã gửi bài thành công 🌿", "Bài viết đang chờ Admin duyệt.");

        setShowCreate(false);
        setContent("");
        setMediaUrl("");
        setHashtags("stress, deadline");
        setEmotionStatus("stress");
        setIsAnonymous(true);

        loadPosts(mode, token);
      }
    } catch (error: any) {
      Alert.alert("Không thể đăng bài", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReact = async (postId: string, type: "like" | "support" | "hug") => {
    if (!requireLogin()) return;

    try {
      const res = await reactToPost(token as string, postId, type);
      if (isApiSuccess(res)) loadPosts(mode, token);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể react bài viết.");
    }
  };

  const handleReport = async (postId: string) => {
    if (!requireLogin()) return;

    try {
      const res = await reportPost(
        token as string,
        postId,
        "negative_content",
        "Nội dung có thể không phù hợp với cộng đồng."
      );

      Alert.alert(
        isApiSuccess(res) ? "Đã gửi report" : "Không thể report",
        res?.message || "Admin sẽ xem xét nội dung này."
      );
    } catch (error: any) {
      Alert.alert("Không thể report", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const toggleComments = async (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }

    setOpenCommentPostId(postId);

    try {
      await reloadComments(postId);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không tải được bình luận.");
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!requireLogin()) return;

    const text = commentInputs[postId]?.trim();

    if (!text) {
      Alert.alert("Thiếu nội dung", "Nhập bình luận trước nha.");
      return;
    }

    try {
      const res = await createComment(token as string, {
        postId,
        content: text,
        isAnonymous: false,
      });

      if (isApiSuccess(res)) {
        setCommentInputs((prev) => ({
          ...prev,
          [postId]: "",
        }));

        await reloadComments(postId);
        loadPosts(mode, token);
      }
    } catch (error: any) {
      Alert.alert("Không thể bình luận", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReplyComment = async (
    postId: string,
    parentCommentId: string,
    inputCommentId?: string
  ) => {
    if (!requireLogin()) return;

    const inputKey = inputCommentId || parentCommentId;
    const text = replyInputs[inputKey]?.trim();

    if (!text) {
      Alert.alert("Thiếu nội dung", "Nhập nội dung trả lời trước nha.");
      return;
    }

    try {
      const res = await createComment(token as string, {
        postId,
        parentCommentId,
        content: text,
        isAnonymous: false,
      });

      if (isApiSuccess(res)) {
        setReplyInputs((prev) => ({
          ...prev,
          [inputKey]: "",
        }));

        setOpenReplyCommentId(null);

        await reloadComments(postId);
        loadPosts(mode, token);
      }
    } catch (error: any) {
      Alert.alert("Không thể trả lời", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReactComment = async (
    postId: string,
    commentId: string,
    type: "like" | "support" | "hug"
  ) => {
    if (!requireLogin()) return;

    try {
      const res = await reactToComment(token as string, commentId, type);

      if (isApiSuccess(res)) {
        await reloadComments(postId);
      }
    } catch (error: any) {
      Alert.alert("Không thể react comment", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleEditComment = async (
    postId: string,
    commentId: string,
    content: string
  ) => {
    if (!requireLogin()) return;

    if (!content.trim()) {
      Alert.alert("Thiếu nội dung", "Nội dung bình luận không được để trống.");
      return;
    }

    try {
      const res = await updateComment(token as string, commentId, content.trim());

      if (isApiSuccess(res)) {
        await reloadComments(postId);
        Alert.alert("Thành công", "Đã cập nhật bình luận.");
      }
    } catch (error: any) {
      Alert.alert("Không thể sửa bình luận", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
  if (!requireLogin()) return;

  const doDelete = async () => {
    try {
      const res = await deleteComment(token as string, commentId);

      if (isApiSuccess(res)) {
        await reloadComments(postId);
        loadPosts(mode, token);
      }
    } catch (error: any) {
      Alert.alert(
        "Không thể xóa bình luận",
        error?.message || "Đã có lỗi xảy ra."
      );
    }
  };

  if (typeof window !== "undefined") {
    const ok = window.confirm("Bạn có chắc muốn xóa bình luận này không?");
    if (ok) await doDelete();
    return;
  }

  Alert.alert("Xóa bình luận", "Bạn có chắc muốn xóa bình luận này không?", [
    { text: "Hủy", style: "cancel" },
    {
      text: "Xóa",
      style: "destructive",
      onPress: doDelete,
    },
  ]);
};

  return (
    <View style={s.page}>
      <ForumHeader
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        filters={filters}
        onCreatePress={() => setShowCreate(true)}
      />

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            mode={mode}
            moodLabel={moodLabel}
            openCommentPostId={openCommentPostId}
            commentsByPost={commentsByPost}
            commentInputs={commentInputs}
            replyInputs={replyInputs}
            openReplyCommentId={openReplyCommentId}
            currentUserId={currentUserId}
            setCommentInputs={setCommentInputs}
            setReplyInputs={setReplyInputs}
            setOpenReplyCommentId={setOpenReplyCommentId}
            onReactPost={handleReact}
            onReportPost={handleReport}
            onToggleComments={toggleComments}
            onSendComment={handleSendComment}
            onReplyComment={handleReplyComment}
            onReactComment={handleReactComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyForum mode={mode} />}
      />

      <CreatePostModal
        visible={showCreate}
        content={content}
        mediaUrl={mediaUrl}
        hashtags={hashtags}
        emotionStatus={emotionStatus}
        isAnonymous={isAnonymous}
        emotions={emotions}
        setContent={setContent}
        setMediaUrl={setMediaUrl}
        setHashtags={setHashtags}
        setEmotionStatus={setEmotionStatus}
        setIsAnonymous={setIsAnonymous}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreatePost}
      />

      <ForumBottomSwitcher
        mode={mode}
        onCommunityPress={() => {
          setMode("community");
          loadPosts("community", token);
        }}
        onMinePress={() => {
          if (!requireLogin()) return;
          setMode("mine");
          loadPosts("mine", token);
        }}
      />
    </View>
  );
}