import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createPost,
  getApprovedPosts,
  reactToPost,
  reportPost,
} from "@/api/forumApi";
import { forumStyles as s } from "@/styles/forum.styles";

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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("stress, deadline");
  const [emotionStatus, setEmotionStatus] = useState("stress");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem("token");
    setToken(savedToken);
  };

  const loadPosts = async () => {
    const res = await getApprovedPosts();
    if (res.success) setPosts(res.data || []);
  };

  useEffect(() => {
    loadToken();
    loadPosts();
  }, []);

  const requireLogin = () => {
    if (!token) {
      Alert.alert("Bạn cần đăng nhập", "Vui lòng đăng nhập để dùng chức năng này.");
      return false;
    }
    return true;
  };

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
      Alert.alert("Đã gửi duyệt", "Bài viết đang chờ admin duyệt.");
      setShowCreate(false);
      setContent("");
      setMediaUrl("");
      setHashtags("stress, deadline");
      setEmotionStatus("stress");
      setIsAnonymous(true);
      loadPosts();
    } else {
      Alert.alert("Lỗi", res.message || "Không tạo được bài viết.");
    }
  };

  const handleReact = async (postId: string, type: "like" | "support" | "hug") => {
    if (!requireLogin()) return;
    const res = await reactToPost(token as string, postId, type);
    if (res.success) loadPosts();
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

  const renderPost = ({ item }: { item: any }) => {
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
                <MaterialCommunityIcons name="check-decagram" size={15} color="#00866B" />
              </View>
              <Text style={s.postMeta}>Just now · {moodLabel(item.emotionStatus)}</Text>
            </View>
          </View>

          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#566A66" />
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
          <Pressable style={s.actionItem} onPress={() => handleReact(item._id, "like")}>
            <MaterialCommunityIcons name="heart-outline" size={24} color="#EF4444" />
            <Text style={s.actionText}>{item.statistics?.likeCount || 0}</Text>
          </Pressable>

          <Pressable style={s.actionItem} onPress={() => handleReact(item._id, "support")}>
            <MaterialCommunityIcons name="hand-heart" size={24} color="#00866B" />
            <Text style={s.actionText}>{item.statistics?.supportCount || 0}</Text>
          </Pressable>

          <Pressable style={s.actionItem} onPress={() => handleReact(item._id, "hug")}>
            <Text style={s.hugIcon}>🤗</Text>
            <Text style={s.actionText}>{item.statistics?.hugCount || 0}</Text>
          </Pressable>

          <View style={s.actionItem}>
            <MaterialCommunityIcons name="comment-outline" size={23} color="#60706C" />
            <Text style={s.actionText}>{item.statistics?.commentCount || 0}</Text>
          </View>

          <Pressable onPress={() => handleReport(item._id)}>
            <MaterialCommunityIcons name="flag-outline" size={23} color="#60706C" />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={s.page}>
      <View style={s.header}>
        <View style={s.decorHeart}>
          <MaterialCommunityIcons name="heart-outline" size={42} color="rgba(0,134,107,0.08)" />
        </View>

        <View style={s.headerTop}>
          <View>
            <Text style={s.title}>Healing Forum</Text>
            <Text style={s.subtitle}>A safe space to share, support{"\n"}and grow together 🌿</Text>
          </View>

          <View style={s.headerActions}>
            <Pressable style={s.bellButton}>
              <MaterialCommunityIcons name="bell-outline" size={26} color="#083D34" />
              <View style={s.redDot} />
            </Pressable>

            <Pressable style={s.plusButton} onPress={() => setShowCreate(true)}>
              <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={s.searchBox}>
          <MaterialCommunityIcons name="magnify" size={22} color="#7E8F8B" />
          <TextInput
            style={s.searchInput}
            placeholder="Search stories, feelings, hashtags..."
            placeholderTextColor="#7E8F8B"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {filters.map((item) => {
            const active = item === filter;
            return (
              <Pressable
                key={item}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setFilter(item)}
              >
                <Text style={[s.filterText, active && s.filterTextActive]}>
                  {item === "all" ? "All" : `#${item}`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>🌿</Text>
            <Text style={s.emptyTitle}>No posts yet</Text>
            <Text style={s.emptyText}>Be the first to share something gentle today.</Text>
          </View>
        }
      />

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          <View style={s.createModal}>
            <View style={s.modalHandle} />

            <Pressable style={s.closeButton} onPress={() => setShowCreate(false)}>
              <MaterialCommunityIcons name="close" size={28} color="#1F332F" />
            </Pressable>

            <Text style={s.modalTitle}>Share your feeling ✨</Text>
            <Text style={s.modalSub}>Your story might be the light for someone.</Text>

            <View style={s.bigInputWrap}>
              <TextInput
                style={s.bigInput}
                multiline
                placeholder="What is on your mind today?"
                placeholderTextColor="#8A9996"
                value={content}
                onChangeText={setContent}
                maxLength={1000}
              />
              <Text style={s.counter}>{content.length}/1000</Text>
            </View>

            <View style={s.formInput}>
              <MaterialCommunityIcons name="image-outline" size={25} color="#7A8A87" />
              <TextInput
                style={s.formTextInput}
                placeholder="Image / Video URL (optional)"
                placeholderTextColor="#8A9996"
                value={mediaUrl}
                onChangeText={setMediaUrl}
              />
            </View>

            <View style={s.formInput}>
              <Text style={s.hashIcon}>#</Text>
              <TextInput
                style={s.formTextInput}
                placeholder="Hashtags (e.g. stress, self-care)"
                placeholderTextColor="#8A9996"
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            <Text style={s.feelingLabel}>How are you feeling?</Text>

            <View style={s.emotionGrid}>
              {emotions.map((e) => {
                const active = emotionStatus === e.value;
                return (
                  <Pressable
                    key={e.value}
                    style={[s.emotionCard, active && s.emotionCardActive]}
                    onPress={() => setEmotionStatus(e.value)}
                  >
                    <Text style={s.emotionEmoji}>{e.label}</Text>
                    <Text style={s.emotionName}>{e.text}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.anonymousRow}>
              <View style={s.anonLeft}>
                <MaterialCommunityIcons name="incognito" size={24} color="#95A19E" />
                <Text style={s.anonText}>Post anonymously</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: "#D8E3E0", true: "#00866B" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Pressable style={s.submitButton} onPress={handleCreatePost}>
              <MaterialCommunityIcons name="send-outline" size={24} color="#FFFFFF" />
              <Text style={s.submitText}>Submit for Review</Text>
            </Pressable>

            <Pressable onPress={() => setShowCreate(false)}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}