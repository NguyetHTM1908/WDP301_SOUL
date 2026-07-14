import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "@/store";

import {
  createComment,
  createPost,
  createReport,
  deleteComment,
  deletePost,
  getApprovedPosts,
  getCommentsByPost,
  getMyPosts,
  getMyReports,
  reactToComment,
  reactToPost,
  updateComment,
  updatePost,
} from "@/api/forumApi";
import type { CreatePostPayload } from "@/api/forumApi";

import { forumStyles as s } from "@/styles/forum.styles";
import { ForumHeader } from "@/components/forum/ForumHeader";
import { PostCard } from "@/components/forum/PostCard";
import { CreatePostModal } from "@/components/forum/CreatePostModal";
import { ForumBottomSwitcher } from "@/components/forum/ForumBottomSwitcher";
import { EmptyForum } from "@/components/forum/EmptyForum";
import { ReportModal } from "@/components/forum/ReportModal";
import { MyReportsModal } from "@/components/forum/MyReportsModal";

type ReactionType = "support" | "hug" | "encourage" | "thankyou";

const defaultFilters = [
  "all",
  "stress",
  "self-care",
  "student-life",
  "deadline",
];

const emotions = [
  { value: "happy", label: "😊", text: "Vui vẻ" },
  { value: "sad", label: "😔", text: "Buồn" },
  { value: "stress", label: "😵", text: "Căng thẳng" },
  { value: "anxious", label: "😟", text: "Lo lắng" },
  { value: "angry", label: "😤", text: "Tức giận" },
  { value: "neutral", label: "🌱", text: "Bình thường" },
];

function normalizeList(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.posts)) return res.posts;
  if (Array.isArray(res?.comments)) return res.comments;
  if (Array.isArray(res?.reports)) return res.reports;
  if (Array.isArray(res?.data?.posts)) return res.data.posts;
  if (Array.isArray(res?.data?.comments)) return res.data.comments;
  if (Array.isArray(res?.data?.reports)) return res.data.reports;
  return [];
}

function isApiSuccess(res: any) {
  return res?.success === true || res?.status === "success" || !!res?.message;
}

function moodLabel(mood: string) {
  const found = emotions.find((item) => item.value === mood);
  return found ? `${found.label} ${found.text}` : "🌱 Bình thường";
}

function getUserIdFromToken(token: string | null) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    if (!payload || typeof globalThis.atob !== "function") {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = globalThis.atob(base64);
    const parsed = JSON.parse(decoded);

    return (
      parsed._id ||
      parsed.id ||
      parsed.userId ||
      parsed.user?._id ||
      parsed.user?.id ||
      null
    );
  } catch {
    return null;
  }
}

function getPostId(post: any) {
  return (
    post?._id?.toString?.() ||
    post?.id?.toString?.() ||
    post?._id ||
    post?.id ||
    ""
  );
}

function getAnonymousAlias(user: any, fallbackName?: string) {
  const alias =
    fallbackName ||
    user?.anonymousAlias ||
    user?.anonymousName ||
    user?.displayAuthor?.fullName ||
    user?.forumAnonymousName ||
    user?.anonymousProfile?.alias ||
    "Ẩn danh SOUL";

  return String(alias).trim() || "Ẩn danh SOUL";
}

export default function ForumScreen() {
  const user = useAuthStore((state: any) => state.user);

  const [token, setToken] = useState<string | null>(null);
  const currentUserId = user?._id || user?.id || getUserIdFromToken(token);

  const [posts, setPosts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [filters, setFilters] = useState(defaultFilters);

  const [mode, setMode] = useState<"community" | "mine">("community");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("stress, deadline");
  const [emotionStatus, setEmotionStatus] = useState("stress");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");

  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(
    null
  );

  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>(
    {}
  );

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(
    null
  );

  const [commentAnonymousByPost, setCommentAnonymousByPost] = useState<
    Record<string, boolean>
  >({});

  const [replyAnonymousByComment, setReplyAnonymousByComment] = useState<
    Record<string, boolean>
  >({});

  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "comment";
    id: string;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    postId: string;
    commentId: string;
  } | null>(null);

  const [showMyReports, setShowMyReports] = useState(false);

  const requireLogin = () => {
    if (!token) {
      Alert.alert(
        "Bạn cần đăng nhập",
        "Vui lòng đăng nhập để sử dụng chức năng này."
      );
      return false;
    }

    return true;
  };

  const getPostById = (postId: string) => {
    return posts.find((post) => String(getPostId(post)) === String(postId));
  };

  const getAnonymousNameForComment = (postId: string) => {
    const targetPost = getPostById(postId);

    const postAnonymousName =
      targetPost?.displayAuthor?.fullName ||
      targetPost?.anonymousName ||
      targetPost?.authorId?.anonymousAlias ||
      "";

    const isMyAnonymousPost =
      targetPost?.isAnonymous === true &&
      Boolean(postAnonymousName) &&
      (mode === "mine" ||
        targetPost?.viewer?.isOwner === true ||
        targetPost?.isMine === true);

    if (isMyAnonymousPost) {
      return getAnonymousAlias(user, postAnonymousName);
    }

    return getAnonymousAlias(user, anonymousName);
  };

  const loadTags = async () => {
    setFilters(defaultFilters);
  };

  const loadPosts = async (
    nextMode: "community" | "mine" = mode,
    currentToken: string | null = token
  ) => {
    if (nextMode === "mine") {
      if (!currentToken) return;

      const res = await getMyPosts();
      setPosts(normalizeList(res));
      return;
    }

    const res = await getApprovedPosts({
      search,
      hashtag: filter === "all" ? undefined : filter,
    });

    setPosts(normalizeList(res));
  };

  const loadReports = async () => {
    if (!token) return;

    const res = await getMyReports();
    setReports(normalizeList(res));
  };

  const reloadComments = async (postId: string) => {
    const res = await getCommentsByPost(postId);

    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: normalizeList(res),
    }));
  };

  const init = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");
      setToken(savedToken);

      await loadTags();

      const res = await getApprovedPosts();
      setPosts(normalizeList(res));
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể tải diễn đàn.");
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mode === "community") {
        loadPosts("community", token).catch(() => {});
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, filter]);

  const visiblePosts = useMemo(() => {
    if (mode === "community") {
      return posts.filter((post) => post?.isFlagged !== true);
    }

    return posts;
  }, [posts, mode]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPosts(mode, token);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể làm mới dữ liệu.");
    } finally {
      setRefreshing(false);
    }
  };

  const resetPostForm = () => {
    setEditingPost(null);
    setContent("");
    setMediaUrl("");
    setHashtags("stress, deadline");
    setEmotionStatus("stress");
    setIsAnonymous(Boolean(user?.anonymousModeEnabled));
    setAnonymousName(user?.anonymousAlias || user?.anonymousName || "");
  };

  const openCreateModal = () => {
    resetPostForm();
    setShowCreate(true);
  };

  const openEditPost = (post: any) => {
    setEditingPost(post);
    setContent(post.content || "");
    setMediaUrl(post.mediaUrls?.[0]?.url || "");
    setHashtags((post.hashtags || []).join(", "));
    setEmotionStatus(post.emotionStatus || "neutral");
    setIsAnonymous(!!post.isAnonymous);
    setAnonymousName(
      post.anonymousName ||
        post.displayAuthor?.fullName ||
        user?.anonymousAlias ||
        user?.anonymousName ||
        ""
    );
    setShowCreate(true);
  };

  const handleSubmitPost = async () => {
    if (!requireLogin()) return;

    if (!content.trim()) {
      Alert.alert("Thiếu nội dung", "Vui lòng nhập nội dung bài viết trước.");
      return;
    }

    if (isAnonymous && !anonymousName.trim()) {
      Alert.alert("Thiếu tên ẩn danh", "Vui lòng nhập tên ẩn danh.");
      return;
    }

    const mediaType: "image" | "video" = mediaUrl
      .trim()
      .toLowerCase()
      .includes(".mp4")
      ? "video"
      : "image";

    const body: CreatePostPayload = {
      content: content.trim(),
      mediaUrls: mediaUrl.trim()
        ? [
            {
              url: mediaUrl.trim(),
              type: mediaType,
            },
          ]
        : [],
      emotionStatus,
      hashtags: hashtags
        .split(",")
        .map((tag) => tag.replace("#", "").trim())
        .filter(Boolean),
      isAnonymous,
      anonymousName: isAnonymous
        ? anonymousName.trim() || getAnonymousAlias(user)
        : undefined,
      visibility: "public",
      postType: "forum",
    };

    try {
      const postId = getPostId(editingPost);

      const res = editingPost
        ? await updatePost(postId, body)
        : await createPost(body);

      if (isApiSuccess(res)) {
        const data = res?.data;
        const isFlagged =
          data?.isFlagged === true ||
          res?.moderation?.isViolationSuspected === true;

        Alert.alert(
          editingPost ? "Đã cập nhật bài viết" : "Bài viết đã được đăng 🌿",
          isFlagged
            ? "SOUL AI phát hiện nội dung nhạy cảm và đã gửi cho quản trị viên xem xét. Bài viết của bạn có thể bị giới hạn hiển thị trong khi chờ xử lý."
            : "Bài viết của bạn đã xuất hiện trong cộng đồng. SOUL AI vẫn có thể kiểm tra để giữ không gian an toàn."
        );

        setShowCreate(false);
        resetPostForm();

        setMode("mine");
        await loadPosts("mine", token);
      }
    } catch (error: any) {
      Alert.alert("Không thể lưu bài", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleDeletePost = (postId: string) => {
    if (!requireLogin()) return;

    if (!postId) {
      Alert.alert("Lỗi", "Không tìm thấy ID bài viết để xóa.");
      return;
    }

    const deleteNow = async () => {
      try {
        console.log("[DELETE POST CLICK]", postId);

        await deletePost(postId);

        setPosts((prev) =>
          prev.filter((post) => String(getPostId(post)) !== String(postId))
        );

        if (openCommentPostId === postId) {
          setOpenCommentPostId(null);
        }

        Alert.alert("Đã xóa", "Bài viết đã được xóa thành công.");
      } catch (error: any) {
        console.log("[DELETE POST ERROR]", error);

        Alert.alert(
          "Không thể xóa bài",
          error?.message || error?.data?.message || "Đã có lỗi xảy ra."
        );
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Bạn có chắc muốn xóa bài viết này không?");
      if (confirmed) {
        deleteNow();
      }
      return;
    }

    Alert.alert("Xóa bài viết", "Bạn có chắc muốn xóa bài viết này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: deleteNow,
      },
    ]);
  };

  const handleReactPost = async (postId: string, type: ReactionType) => {
    if (!requireLogin()) return;

    try {
      await reactToPost(postId, type);
      await loadPosts(mode, token);
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể thả cảm xúc bài viết.");
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
      Alert.alert("Lỗi", error?.message || "Không thể tải bình luận.");
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!requireLogin()) return;

    const text = commentInputs[postId]?.trim();

    if (!text) {
      Alert.alert("Thiếu nội dung", "Vui lòng nhập bình luận trước.");
      return;
    }

    const commentAsAnonymous = Boolean(commentAnonymousByPost[postId]);
    const finalAnonymousName = getAnonymousNameForComment(postId);

    console.log("[COMMENT IDENTITY]", {
      postId,
      mode,
      commentAsAnonymous,
      finalAnonymousName,
      post: getPostById(postId),
    });

    try {
      await createComment({
        postId,
        content: text,
        isAnonymous: commentAsAnonymous,
        anonymousName: commentAsAnonymous ? finalAnonymousName : undefined,
      });

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      await reloadComments(postId);
      await loadPosts(mode, token);
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
      Alert.alert("Thiếu nội dung", "Vui lòng nhập nội dung trả lời trước.");
      return;
    }

    const replyAsAnonymous = Boolean(replyAnonymousByComment[inputKey]);
    const finalAnonymousName = getAnonymousNameForComment(postId);

    console.log("[REPLY IDENTITY]", {
      postId,
      inputKey,
      mode,
      replyAsAnonymous,
      finalAnonymousName,
      post: getPostById(postId),
    });

    try {
      await createComment({
        postId,
        parentCommentId,
        content: text,
        isAnonymous: replyAsAnonymous,
        anonymousName: replyAsAnonymous ? finalAnonymousName : undefined,
      });

      setReplyInputs((prev) => ({
        ...prev,
        [inputKey]: "",
      }));

      setReplyAnonymousByComment((prev) => ({
        ...prev,
        [inputKey]: false,
      }));

      setOpenReplyCommentId(null);

      await reloadComments(postId);
      await loadPosts(mode, token);
    } catch (error: any) {
      Alert.alert("Không thể trả lời", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleReactComment = async (
    postId: string,
    commentId: string,
    type: ReactionType
  ) => {
    if (!requireLogin()) return;

    try {
      await reactToComment(commentId, type);
      await reloadComments(postId);
    } catch (error: any) {
      Alert.alert(
        "Không thể thả cảm xúc bình luận",
        error?.message || "Đã có lỗi xảy ra."
      );
    }
  };

  const handleEditComment = async (
    postId: string,
    commentId: string,
    text: string
  ) => {
    if (!requireLogin()) return;

    if (!text.trim()) {
      Alert.alert("Thiếu nội dung", "Nội dung bình luận không được để trống.");
      return;
    }

    try {
      await updateComment(commentId, {
        content: text.trim(),
      });

      await reloadComments(postId);
    } catch (error: any) {
      Alert.alert(
        "Không thể sửa bình luận",
        error?.message || "Đã có lỗi xảy ra."
      );
    }
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!requireLogin()) return;

    setDeleteTarget({
      postId,
      commentId,
    });
  };

  const confirmDeleteComment = async () => {
    if (!deleteTarget || !token) return;

    try {
      await deleteComment(deleteTarget.commentId);
      await reloadComments(deleteTarget.postId);
      await loadPosts(mode, token);

      setDeleteTarget(null);
    } catch (error: any) {
      Alert.alert(
        "Không thể xóa bình luận",
        error?.message || "Đã có lỗi xảy ra."
      );
    }
  };

  const openReport = (type: "post" | "comment", id: string) => {
    if (!requireLogin()) return;
    setReportTarget({ type, id });
  };

  const submitReport = async (reason: string, description: string) => {
    if (!token || !reportTarget) return;

    try {
      await createReport({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reason,
        description,
      });

      Alert.alert("Đã gửi báo cáo", "Quản trị viên sẽ xem xét nội dung này.");
      setReportTarget(null);
    } catch (error: any) {
      Alert.alert("Không thể gửi báo cáo", error?.message || "Đã có lỗi xảy ra.");
    }
  };

  const openMyReports = async () => {
    if (!requireLogin()) return;

    try {
      await loadReports();
      setShowMyReports(true);
    } catch (error: any) {
      Alert.alert(
        "Không thể tải báo cáo",
        error?.message || "Đã có lỗi xảy ra."
      );
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
        onCreatePress={openCreateModal}
        onReportsPress={openMyReports}
        onBackPress={() => router.replace("/(tabs)" as any)}
      />

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => getPostId(item)}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            mode={mode}
            currentUser={user}
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
            commentAnonymousByPost={commentAnonymousByPost}
            setCommentAnonymousByPost={setCommentAnonymousByPost}
            replyAnonymousByComment={replyAnonymousByComment}
            setReplyAnonymousByComment={setReplyAnonymousByComment}
            onReactPost={handleReactPost}
            onReportPost={(postId) => openReport("post", postId)}
            onToggleComments={toggleComments}
            onSendComment={handleSendComment}
            onReplyComment={handleReplyComment}
            onReactComment={handleReactComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onReportComment={(commentId) => openReport("comment", commentId)}
            onEditPost={openEditPost}
            onDeletePost={handleDeletePost}
          />
        )}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyForum mode={mode} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <CreatePostModal
        visible={showCreate}
        isEditing={!!editingPost}
        currentUser={user}
        content={content}
        mediaUrl={mediaUrl}
        hashtags={hashtags}
        emotionStatus={emotionStatus}
        isAnonymous={isAnonymous}
        anonymousName={anonymousName}
        emotions={emotions}
        setContent={setContent}
        setMediaUrl={setMediaUrl}
        setHashtags={setHashtags}
        setEmotionStatus={setEmotionStatus}
        setIsAnonymous={setIsAnonymous}
        setAnonymousName={setAnonymousName}
        onClose={() => {
          setShowCreate(false);
          resetPostForm();
        }}
        onSubmit={handleSubmitPost}
      />

      <ReportModal
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={submitReport}
      />

      <MyReportsModal
        visible={showMyReports}
        reports={reports}
        onClose={() => setShowMyReports(false)}
      />

      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={s.confirmBackdrop}>
          <View style={s.confirmBox}>
            <Text style={s.confirmTitle}>Xóa bình luận</Text>

            <Text style={s.confirmText}>
              Bạn có chắc muốn xóa bình luận này không?
            </Text>

            <View style={s.confirmActions}>
              <Pressable
                style={s.cancelButton}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={s.cancelButtonText}>Hủy</Text>
              </Pressable>

              <Pressable style={s.deleteButton} onPress={confirmDeleteComment}>
                <Text style={s.deleteButtonText}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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