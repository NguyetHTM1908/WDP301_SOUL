import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";

import {
  createComment,
  createPost,
  getApprovedPosts,
  getComments,
  getMyPosts,
  reactToComment,
  reactToPost,
  reportPost,
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

export default function ForumScreen() {
  const [token, setToken] = useState<string | null>(null);
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
    if (nextMode === "mine") {
      if (!currentToken) {
        Alert.alert("Bạn cần đăng nhập", "Vui lòng đăng nhập để xem bài viết của bạn.");
        return;
      }

      const res = await getMyPosts(currentToken);
      if (res.success) setPosts(res.data || []);
      else Alert.alert("Lỗi", res.message || "Không tải được bài viết cá nhân.");
      return;
    }

    const res = await getApprovedPosts();
    if (res.success) setPosts(res.data || []);
    else Alert.alert("Lỗi", res.message || "Không tải được bài viết cộng đồng.");
  };

  useEffect(() => {
    const init = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      setToken(savedToken);

      const res = await getApprovedPosts();
      if (res.success) setPosts(res.data || []);
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

    const res = await createPost(token as string, body);

    if (res.success) {
      Alert.alert(
        "Đã gửi bài thành công 🌿",
        "Bài viết của bạn hiện đang ở trạng thái Pending và đang chờ Admin duyệt.\n\nSau khi được duyệt, bài viết sẽ hiển thị trên diễn đàn cộng đồng."
      );

      setShowCreate(false);
      setContent("");
      setMediaUrl("");
      setHashtags("stress, deadline");
      setEmotionStatus("stress");
      setIsAnonymous(true);

      if (mode === "mine") loadPosts("mine", token);
      return;
    }

    Alert.alert("Không thể đăng bài", res.message || "Đã có lỗi xảy ra khi tạo bài viết.");
  };

  const handleReact = async (postId: string, type: "like" | "support" | "hug") => {
    if (!requireLogin()) return;

    const res = await reactToPost(token as string, postId, type);

    if (res.success) loadPosts(mode, token);
    else Alert.alert("Lỗi", res.message || "Không thể react bài viết.");
  };

  const handleReport = async (postId: string) => {
    if (!requireLogin()) return;

    const res = await reportPost(
      token as string,
      postId,
      "negative_content",
      "Nội dung có thể không phù hợp với cộng đồng."
    );

    Alert.alert(
      res.success ? "Đã gửi report" : "Không thể report",
      res.message || "Admin sẽ xem xét nội dung này."
    );
  };

  const toggleComments = async (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }

    setOpenCommentPostId(postId);

    const res = await getComments(postId);

    if (res.success) {
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: res.data || [],
      }));
    } else {
      Alert.alert("Lỗi", res.message || "Không tải được bình luận.");
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!requireLogin()) return;

    const text = commentInputs[postId]?.trim();

    if (!text) {
      Alert.alert("Thiếu nội dung", "Nhập bình luận trước nha.");
      return;
    }

    const res = await createComment(token as string, {
      postId,
      content: text,
      isAnonymous: false,
    });

    if (res.success) {
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      const updated = await getComments(postId);

      if (updated.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: updated.data || [],
        }));
      }

      loadPosts(mode, token);
    } else {
      Alert.alert("Không thể bình luận", res.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReplyComment = async (postId: string, parentCommentId: string) => {
    if (!requireLogin()) return;

    const text = replyInputs[parentCommentId]?.trim();

    if (!text) {
      Alert.alert("Thiếu nội dung", "Nhập nội dung trả lời trước nha.");
      return;
    }

    const res = await createComment(token as string, {
      postId,
      parentCommentId,
      content: text,
      isAnonymous: false,
    });

    if (res.success) {
      setReplyInputs((prev) => ({
        ...prev,
        [parentCommentId]: "",
      }));

      setOpenReplyCommentId(null);

      const updated = await getComments(postId);

      if (updated.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: updated.data || [],
        }));
      }

      loadPosts(mode, token);
    } else {
      Alert.alert("Không thể trả lời", res.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReactComment = async (
    postId: string,
    commentId: string,
    type: "like" | "support" | "hug"
  ) => {
    if (!requireLogin()) return;

    const res = await reactToComment(token as string, commentId, type);

    if (res.success) {
      const updated = await getComments(postId);

      if (updated.success) {
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: updated.data || [],
        }));
      }
    } else {
      Alert.alert("Không thể react comment", res.message || "Đã có lỗi xảy ra.");
    }
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
            setCommentInputs={setCommentInputs}
            setReplyInputs={setReplyInputs}
            setOpenReplyCommentId={setOpenReplyCommentId}
            onReactPost={handleReact}
            onReportPost={handleReport}
            onToggleComments={toggleComments}
            onSendComment={handleSendComment}
            onReplyComment={handleReplyComment}
            onReactComment={handleReactComment}
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