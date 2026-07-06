import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles as s } from "@/styles/profile.styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API imports
import {
  getUserProfile,
  getUserPosts,
  getUserFriends,
  getFriendRecommendations,
  getFriendshipStatus,
  friendshipAction,
  getPendingFriendRequests,
} from "@/api/userApi";

import {
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  reactToComment,
  reportPost,
  reportComment,
} from "@/api/forumApi";

import { PostCard } from "@/components/forum/PostCard";
import { CreatePostModal } from "@/components/forum/CreatePostModal";
import { ReportModal } from "@/components/forum/ReportModal";

// Sub-components imports
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileIntro } from "@/components/profile/ProfileIntro";
import { ProfilePhotos } from "@/components/profile/ProfilePhotos";
import { ProfileFriends } from "@/components/profile/ProfileFriends";
import { ProfileModals } from "@/components/profile/ProfileModals";

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

const coverPresets = [
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600",
  "https://images.unsplash.com/photo-1472214222541-d510753a8707?q=80&w=600",
];

export default function ProfileScreen() {
  const { id } = useLocalSearchParams();
  const currentUser = useAuthStore((state: any) => state.user);
  const token = useAuthStore((state: any) => state.token);
  const updateProfileStore = useAuthStore((state: any) => state.updateProfile);

  // Xem trang của chính mình hay của người khác
  const isMe = id === "me" || id === currentUser?._id || id === currentUser?.id;
  const targetUserId = isMe ? (currentUser?._id || currentUser?.id) : id;
  const isMyProfile = !!(targetUserId && currentUser && targetUserId.toString() === (currentUser._id || currentUser.id || "").toString());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tất cả" | "giới thiệu" | "ảnh" | "bạn bè">("tất cả");

  // Profile data states
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<"none" | "pending_sent" | "pending_received" | "friends" | "self" | "loading">("loading");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  
  // Custom cover photo state (persisted locally)
  const [coverPhoto, setCoverPhoto] = useState<string>(coverPresets[0]);
  const [showCoverPresetModal, setShowCoverPresetModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [urlModalType, setUrlModalType] = useState<"avatar" | "cover">("avatar");
  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [inputBio, setInputBio] = useState("");

  // Post states (for creating & editing in feed)
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("profile, update");
  const [emotionStatus, setEmotionStatus] = useState("neutral");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");

  // Comments and interactions states
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, any[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [openReplyCommentId, setOpenReplyCommentId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(null);
  const [commentAnonymousByPost, setCommentAnonymousByPost] = useState<Record<string, boolean>>({});
  const [replyAnonymousByComment, setReplyAnonymousByComment] = useState<Record<string, boolean>>({});

  // Load cover photo local cache
  useEffect(() => {
    const initCover = async () => {
      const savedCover = await AsyncStorage.getItem(`cover_${targetUserId}`);
      if (savedCover) {
        setCoverPhoto(savedCover);
      } else {
        // Randomize a cover preset
        const randIndex = Math.abs(String(targetUserId).charCodeAt(0) || 0) % coverPresets.length;
        setCoverPhoto(coverPresets[randIndex]);
      }
    };
    initCover();
  }, [targetUserId]);

  // Load all user profile, posts, friends, recommendations
  const loadData = async (currentToken = token) => {
    if (!currentToken || !targetUserId) return;
    try {
      setLoading(true);

      // 1. Get User Profile Details
      let profileRes;
      if (isMe) {
        setFriendshipStatus("self");
        try {
          profileRes = await getUserProfile(currentToken, targetUserId as string);
          if (profileRes && profileRes.success) {
            setUserProfile(profileRes.data);
            
            // Cập nhật lại user trong Auth Store để đồng bộ toàn bộ app nếu có sự thay đổi
            const currentStoreUser = useAuthStore.getState().user;
            if (JSON.stringify(currentStoreUser) !== JSON.stringify(profileRes.data)) {
              useAuthStore.setState({ user: profileRes.data });
            }
          } else {
            setUserProfile(currentUser);
          }
        } catch (profileErr: any) {
          console.warn("Error loading fresh profile, fallback to store:", profileErr);
          setUserProfile(currentUser);
        }
      } else {
        try {
          profileRes = await getUserProfile(currentToken, targetUserId as string);
          setUserProfile(profileRes?.data || null);
        } catch (profileErr: any) {
          Alert.alert("Lỗi", "Không thể tải thông tin trang cá nhân: " + (profileErr.message || profileErr), [
            { text: "OK", onPress: () => router.back() }
          ]);
          return;
        }

        // Fetch friendship status
        try {
          const statusRes = await getFriendshipStatus(currentToken, targetUserId as string);
          setFriendshipStatus(statusRes?.status || "none");
        } catch (statusErr) {
          console.warn("Error loading friendship status:", statusErr);
          setFriendshipStatus("none");
        }
      }

      // 2. Get User posts
      try {
        const postsRes = await getUserPosts(currentToken, targetUserId as string);
        setUserPosts(postsRes?.data || []);
      } catch (err) {
        console.warn("Error loading posts:", err);
      }

      // 3. Get User friends
      try {
        const friendsRes = await getUserFriends(currentToken, targetUserId as string);
        setFriends(friendsRes?.data || []);
      } catch (err) {
        console.warn("Error loading friends:", err);
      }

      // If viewing my own profile, load pending requests
      if (isMyProfile) {
        try {
          const reqsRes = await getPendingFriendRequests(currentToken);
          setPendingRequests(reqsRes?.data || []);
        } catch (err) {
          console.warn("Error loading pending requests:", err);
        }
      }

      // 4. Get Friend Recommendations
      try {
        const recsRes = await getFriendRecommendations(currentToken);
        setRecommendations(recsRes?.data || []);
      } catch (err) {
        console.warn("Error loading recommendations:", err);
      }

    } catch (error: any) {
      console.error("Load Profile data error:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu trang cá nhân: " + (error.message || error), [
        { text: "OK", onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendshipAction = async () => {
    if (!token || !targetUserId) return;
    try {
      let action: "add" | "cancel" | "accept" | "remove" = "add";
      if (friendshipStatus === "none") {
        action = "add";
      } else if (friendshipStatus === "pending_sent") {
        action = "cancel";
      } else if (friendshipStatus === "pending_received") {
        action = "accept";
      } else if (friendshipStatus === "friends") {
        action = "remove";
      } else {
        return;
      }

      const res = await friendshipAction(token, targetUserId as string, action);
      if (res && res.success) {
        setFriendshipStatus(res.status);
        
        // Reload friends list
        const friendsRes = await getUserFriends(token, targetUserId as string);
        setFriends(friendsRes?.data || []);
        
        if (action === "add") {
          Alert.alert("Thông báo", "Đã gửi yêu cầu kết bạn.");
        } else if (action === "cancel") {
          Alert.alert("Thông báo", "Đã hủy yêu cầu kết bạn.");
        } else if (action === "accept") {
          Alert.alert("Thông báo", "Hai bạn đã trở thành bạn bè.");
        } else if (action === "remove") {
          Alert.alert("Thông báo", "Đã hủy kết bạn.");
        }
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể thực hiện hành động kết bạn.");
    }
  };

  useEffect(() => {
    if (token && targetUserId) {
      loadData(token);
    }
  }, [token, targetUserId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cover Image change handlers
  const saveCoverPhoto = async (url: string) => {
    setCoverPhoto(url);
    await AsyncStorage.setItem(`cover_${targetUserId}`, url);
    setShowCoverPresetModal(false);
    setShowUrlModal(false);
  };

  const handleUpdateBio = async () => {
    if (!token) return;
    try {
      const res = await updateProfileStore({ bio: inputBio });
      if (res.success) {
        Alert.alert("Thành công", "Đã cập nhật tiểu sử.");
        setUserProfile((prev: any) => ({ ...prev, bio: inputBio }));
        setShowEditBioModal(false);
      } else {
        Alert.alert("Lỗi", res.message);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể cập nhật tiểu sử.");
    }
  };

  // Reused Post feed handlers
  const resetPostForm = () => {
    setEditingPost(null);
    setContent("");
    setMediaUrl("");
    setHashtags("profile, feed");
    setEmotionStatus("neutral");
    setIsAnonymous(false);
    setAnonymousName("");
  };

  const openCreateModal = () => {
    resetPostForm();
    setShowCreatePost(true);
  };

  const openEditPost = (post: any) => {
    setEditingPost(post);
    setContent(post.content || "");
    setMediaUrl(post.mediaUrls?.[0]?.url || "");
    setHashtags((post.hashtags || []).join(", "));
    setEmotionStatus(post.emotionStatus || "neutral");
    setIsAnonymous(!!post.isAnonymous);
    setAnonymousName(post.anonymousName || "");
    setShowCreatePost(true);
  };

  const handleSubmitPost = async () => {
    if (!token) return;
    if (!content.trim()) {
      Alert.alert("Lỗi", "Nội dung bài viết không được để trống.");
      return;
    }

    const body = {
      content: content.trim(),
      mediaUrls: mediaUrl.trim()
        ? [{ url: mediaUrl.trim(), type: mediaUrl.trim().includes(".mp4") ? "video" : "image" }]
        : [],
      emotionStatus,
      hashtags: hashtags.split(",").map((tag) => tag.replace("#", "").trim()).filter(Boolean),
      isAnonymous,
      anonymousName: isAnonymous ? anonymousName.trim() || "Anonymous Soul" : null,
      visibility: "public",
    };

    try {
      const res = editingPost
        ? await updatePost(token, editingPost._id, body)
        : await createPost(token, body);

      if (res) {
        Alert.alert("Thành công", editingPost ? "Đã cập nhật bài viết." : "Đã đăng trạng thái mới.");
        setShowCreatePost(false);
        resetPostForm();
        // Reload posts
        const postsRes = await getUserPosts(token, targetUserId as string);
        setUserPosts(postsRes?.data || []);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Lỗi lưu bài viết.");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token) return;
    Alert.alert("Xóa trạng thái", "Bạn có chắc chắn muốn xóa bài đăng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(token, postId);
            setUserPosts((prev) => prev.filter((p) => p._id !== postId));
            Alert.alert("Đã xóa", "Bài viết đã được xóa.");
          } catch (e: any) {
            Alert.alert("Lỗi", e.message || "Không thể xóa bài.");
          }
        },
      },
    ]);
  };

  const handleReactPost = async (postId: string, type: any) => {
    if (!token) return;
    try {
      await reactToPost(token, postId, type);
      const postsRes = await getUserPosts(token, targetUserId as string);
      setUserPosts(postsRes?.data || []);
    } catch (e: any) {
      console.warn("React post error:", e);
    }
  };

  const toggleComments = async (postId: string) => {
    if (openCommentPostId === postId) {
      setOpenCommentPostId(null);
      return;
    }
    setOpenCommentPostId(postId);
    try {
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: res?.data || res || [],
      }));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!token) return;
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      await createComment(token, { postId, content: text, isAnonymous: false });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      // Reload comments
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res?.data || res || [] }));
      // Reload post count
      const postsRes = await getUserPosts(token, targetUserId as string);
      setUserPosts(postsRes?.data || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReplyComment = async (postId: string, parentCommentId: string, inputCommentId?: string) => {
    if (!token) return;
    const inputKey = inputCommentId || parentCommentId;
    const text = replyInputs[inputKey]?.trim();
    if (!text) return;

    try {
      await createComment(token, { postId, parentCommentId, content: text, isAnonymous: false });
      setReplyInputs((prev) => ({ ...prev, [inputKey]: "" }));
      setOpenReplyCommentId(null);
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res?.data || res || [] }));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleReactComment = async (postId: string, commentId: string, type: any) => {
    if (!token) return;
    try {
      await reactToComment(token, commentId, type);
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res?.data || res || [] }));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleEditComment = async (postId: string, commentId: string, text: string) => {
    if (!token) return;
    try {
      await updateComment(token, commentId, text);
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res?.data || res || [] }));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!token) return;
    try {
      await deleteComment(token, commentId);
      const res = await getComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res?.data || res || [] }));
      const postsRes = await getUserPosts(token, targetUserId as string);
      setUserPosts(postsRes?.data || []);
    } catch (e) {
      console.warn(e);
    }
  };

  const submitReport = async (reason: string, description: string) => {
    if (!token || !reportTarget) return;
    try {
      if (reportTarget.type === "post") {
        await reportPost(token, reportTarget.id, reason, description);
      } else {
        await reportComment(token, reportTarget.id, reason, description);
      }
      Alert.alert("Đã gửi báo cáo", "Cảm ơn bạn đã phản hồi để giữ môi trường an toàn.");
      setReportTarget(null);
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Lỗi báo cáo.");
    }
  };

  const handleAvatarPress = () => {
    Alert.alert(
      "Đổi ảnh đại diện",
      "Bạn có muốn đổi ảnh đại diện? Dán link ảnh mới vào ô nhập liệu.",
      [
        { text: "Hủy" },
        {
          text: "Dán URL",
          onPress: () => {
            setInputUrl(userProfile?.avatarUrl || "");
            setUrlModalType("avatar");
            setShowUrlModal(true);
          }
        }
      ]
    );
  };

  const openUrlModalForCover = () => {
    setShowCoverPresetModal(false);
    setInputUrl(coverPhoto);
    setUrlModalType("cover");
    setShowUrlModal(true);
  };

  const handleAcceptRequest = async (requesterId: string) => {
    if (!token) return;
    try {
      const res = await friendshipAction(token, requesterId, "accept");
      if (res && res.success) {
        Alert.alert("Thành công", "Đã chấp nhận lời mời kết bạn.");
        const reqsRes = await getPendingFriendRequests(token);
        setPendingRequests(reqsRes?.data || []);
        const friendsRes = await getUserFriends(token, targetUserId as string);
        setFriends(friendsRes?.data || []);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể đồng ý kết bạn.");
    }
  };

  const handleDeclineRequest = async (requesterId: string) => {
    if (!token) return;
    try {
      const res = await friendshipAction(token, requesterId, "decline");
      if (res && res.success) {
        Alert.alert("Thông báo", "Đã từ chối lời mời kết bạn.");
        const reqsRes = await getPendingFriendRequests(token);
        setPendingRequests(reqsRes?.data || []);
      }
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Không thể từ chối kết bạn.");
    }
  };

  const handleRecommendationAction = async (rec: any, action: "add" | "cancel" | "accept") => {
    if (!token) return;
    try {
      const res = await friendshipAction(token, rec._id, action);
      if (res && res.success) {
        // Reload recommendations
        const recsRes = await getFriendRecommendations(token);
        setRecommendations(recsRes?.data || []);
        
        // Reload friends
        const friendsRes = await getUserFriends(token, targetUserId as string);
        setFriends(friendsRes?.data || []);

        // Reload pending requests
        if (isMyProfile) {
          const reqsRes = await getPendingFriendRequests(token);
          setPendingRequests(reqsRes?.data || []);
        }
        
        if (action === "add") {
          Alert.alert("Thông báo", `Đã gửi yêu cầu kết bạn đến ${rec.fullName}.`);
        } else if (action === "cancel") {
          Alert.alert("Thông báo", `Đã hủy yêu cầu kết bạn với ${rec.fullName}.`);
        } else if (action === "accept") {
          Alert.alert("Thông báo", `Hai bạn đã trở thành bạn bè.`);
        }
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể thực hiện hành động.");
    }
  };

  const handleSaveUrlModal = async () => {
    if (!inputUrl.trim()) return;
    if (urlModalType === "cover") {
      await saveCoverPhoto(inputUrl.trim());
    } else {
      try {
        const res = await updateProfileStore({ avatarUrl: inputUrl.trim() });
        if (res.success) {
          setUserProfile((prev: any) => ({ ...prev, avatarUrl: inputUrl.trim() }));
          setShowUrlModal(false);
          Alert.alert("Thành công", "Đã cập nhật ảnh đại diện.");
        } else {
          Alert.alert("Lỗi", res.message);
        }
      } catch (e: any) {
        Alert.alert("Lỗi", e.message || "Lỗi lưu avatar.");
      }
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#006B5C" />
        <Text style={{ marginTop: 12, color: "#6B7C93" }}>Đang tải thông tin trang cá nhân...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#006B5C"]} />
        }
      >
        {/* ================= HEADER SECTION (Cover & Avatar) ================= */}
        <ProfileHeader
          userProfile={userProfile}
          isMe={isMe}
          coverPhoto={coverPhoto}
          friendsCount={friends.length}
          friendshipStatus={friendshipStatus}
          onShowCoverPresetModal={() => setShowCoverPresetModal(true)}
          onAvatarPress={handleAvatarPress}
          onBioPress={() => {
            setInputBio(userProfile?.bio || "");
            setShowEditBioModal(true);
          }}
          onFriendshipAction={handleFriendshipAction}
        />

        {/* ================= TABS SELECTOR ================= */}
        <View style={s.tabBar}>
          {(["tất cả", "giới thiệu", "ảnh", "bạn bè"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={s.tabButton}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === "tất cả"
                  ? "Tất cả"
                  : tab === "giới thiệu"
                  ? "Giới thiệu"
                  : tab === "ảnh"
                  ? "Ảnh"
                  : "Bạn bè & Gợi ý"}
              </Text>
              {activeTab === tab && <View style={s.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= CONTENT SECTION ================= */}
        <View style={s.contentSection}>
          
          {/* TAB 1: FEED (TẤT CẢ) */}
          {activeTab === "tất cả" && (
            <View>
              {/* Box đăng bài giống FB (chỉ hiển thị trên profile của mình) */}
              {isMe && (
                <View style={s.createPostBar}>
                  <Image
                    source={{ uri: userProfile?.avatarUrl || "https://i.pravatar.cc/150?img=47" }}
                    style={s.createPostAvatar}
                  />
                  <TouchableOpacity style={s.createPostPlaceholder} onPress={openCreateModal}>
                    <Text style={s.createPostPlaceholderText}>Bạn đang nghĩ gì thế? 🌿</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Feed posts list */}
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    item={post}
                    mode={isMe ? "mine" : "community"}
                    moodLabel={moodLabel}
                    openCommentPostId={openCommentPostId}
                    commentsByPost={commentsByPost}
                    commentInputs={commentInputs}
                    replyInputs={replyInputs}
                    openReplyCommentId={openReplyCommentId}
                    currentUserId={currentUser?._id || currentUser?.id}
                    setCommentInputs={setCommentInputs}
                    setReplyInputs={setReplyInputs}
                    setOpenReplyCommentId={setOpenReplyCommentId}
                    commentAnonymousByPost={commentAnonymousByPost}
                    setCommentAnonymousByPost={setCommentAnonymousByPost}
                    replyAnonymousByComment={replyAnonymousByComment}
                    setReplyAnonymousByComment={setReplyAnonymousByComment}
                    onReactPost={handleReactPost}
                    onReportPost={(postId) => setReportTarget({ type: "post", id: postId })}
                    onToggleComments={toggleComments}
                    onSendComment={handleSendComment}
                    onReplyComment={handleReplyComment}
                    onReactComment={handleReactComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onReportComment={(commentId) => setReportTarget({ type: "comment", id: commentId })}
                    onEditPost={openEditPost}
                    onDeletePost={handleDeletePost}
                  />
                ))
              ) : (
                <Text style={{ textAlign: "center", color: "#A0AEC0", marginTop: 20, fontSize: 14 }}>
                  Chưa có bài viết nào được đăng.
                </Text>
              )}
            </View>
          )}

          {/* TAB 2: INTRO (GIỚI THIỆU) */}
          {activeTab === "giới thiệu" && (
            <ProfileIntro userProfile={userProfile} />
          )}

          {/* TAB 3: PHOTOS (ẢNH ĐÃ TẢI LÊN) */}
          {activeTab === "ảnh" && (
            <ProfilePhotos userPosts={userPosts} />
          )}

          {/* TAB 4: FRIENDS & RECOMMENDATIONS */}
          {activeTab === "bạn bè" && (
            <ProfileFriends
              userProfile={userProfile}
              friends={friends}
              recommendations={recommendations}
              pendingRequests={pendingRequests}
              isMyProfile={isMyProfile}
              onAcceptRequest={handleAcceptRequest}
              onDeclineRequest={handleDeclineRequest}
              onRecommendationAction={handleRecommendationAction}
            />
          )}

        </View>
      </ScrollView>

      {/* Profile Modals overlay */}
      <ProfileModals
        showCoverPresetModal={showCoverPresetModal}
        showUrlModal={showUrlModal}
        showEditBioModal={showEditBioModal}
        inputUrl={inputUrl}
        inputBio={inputBio}
        coverPresets={coverPresets}
        setInputUrl={setInputUrl}
        setInputBio={setInputBio}
        onCloseCoverPreset={() => setShowCoverPresetModal(false)}
        onCloseUrlModal={() => setShowUrlModal(false)}
        onCloseEditBioModal={() => setShowEditBioModal(false)}
        onSelectCoverPreset={saveCoverPhoto}
        onOpenUrlModalFromCover={() => {
            setShowCoverPresetModal(false);
            setInputUrl(coverPhoto);
            setShowUrlModal(true);
        }}
        onSaveUrlModal={handleSaveUrlModal}
        onSaveBio={handleUpdateBio}
      />

      {/* Create/Edit Feed Post Modal */}
      <CreatePostModal
        visible={showCreatePost}
        isEditing={!!editingPost}
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
          setShowCreatePost(false);
          resetPostForm();
        }}
        onSubmit={handleSubmitPost}
      />

      {/* Report Modal */}
      <ReportModal
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={submitReport}
      />
    </View>
  );
}
