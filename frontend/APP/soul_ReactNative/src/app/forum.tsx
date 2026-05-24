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

function moodLabel(mood: string) {
  const map: Record<string, string> = {
    happy: "😊 Happy",
    sad: "😔 Sad",
    stress: "😵 Stress",
    anxious: "😟 Anxious",
    angry: "😤 Angry",
    neutral: "🌿 Neutral",
  };

  return map[mood] || "🌿 Neutral";
}

export default function ForumScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hashtags, setHashtags] = useState("stress");
  const [emotionStatus, setEmotionStatus] = useState("stress");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem("token");
    setToken(savedToken);
  };

  const loadPosts = async () => {
    const res = await getApprovedPosts();

    if (res.success) {
      setPosts(res.data || []);
    } else {
      Alert.alert("Lỗi", res.message || "Không tải được danh sách bài viết.");
    }
  };

  useEffect(() => {
    loadToken();
    loadPosts();
  }, []);

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
      Alert.alert("Thiếu nội dung", "Vy nhập nội dung bài viết trước nha.");
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
      Alert.alert("Thành công", "Bài viết đang chờ admin duyệt.");
      setShowCreate(false);
      setContent("");
      setMediaUrl("");
      setHashtags("stress");
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

    if (res.success) {
      loadPosts();
    } else {
      Alert.alert("Lỗi", res.message || "Không react được bài viết.");
    }
  };

  const handleReport = async (postId: string) => {
    if (!requireLogin()) return;

    const res = await reportPost(
      token as string,
      postId,
      "negative_content",
      "Nội dung có thể gây tiêu cực hoặc không phù hợp."
    );

    if (res.success) {
      Alert.alert("Đã gửi report", "Admin sẽ xem xét nội dung này.");
    } else {
      Alert.alert("Không thể report", res.message || "Bạn đã report rồi.");
    }
  };

  const renderPost = ({ item }: { item: any }) => {
    const authorName = item.isAnonymous
      ? "Anonymous Soul"
      : item.authorId?.fullName || "SOUL User";

    const avatar = item.isAnonymous
      ? "https://i.pravatar.cc/100?img=12"
      : item.authorId?.avatarUrl || "https://i.pravatar.cc/100?img=32";

    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={s.userRow}>
            <Image source={{ uri: avatar }} style={s.avatar} />
            <View>
              <Text style={s.userName}>{authorName}</Text>
              <Text style={s.time}>Just now · Community Forum</Text>
            </View>
          </View>

          <View style={s.moodPill}>
            <Text style={s.moodText}>{moodLabel(item.emotionStatus)}</Text>
          </View>
        </View>

        <Text style={s.content}>{item.content}</Text>

        {item.mediaUrls?.[0]?.url ? (
          <Image source={{ uri: item.mediaUrls[0].url }} style={s.media} />
        ) : null}

        <View style={s.tagRow}>
          {item.hashtags?.map((tag: string) => (
            <View key={tag} style={s.tag}>
              <Text style={s.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={s.actionRow}>
          <Pressable
            style={s.action}
            onPress={() => handleReact(item._id, "like")}
          >
            <MaterialCommunityIcons name="heart-outline" size={22} color="#E76F51" />
            <Text style={s.actionText}>{item.statistics?.likeCount || 0}</Text>
          </Pressable>

          <Pressable
            style={s.action}
            onPress={() => handleReact(item._id, "support")}
          >
            <MaterialCommunityIcons
              name="hand-heart-outline"
              size={22}
              color="#2A9D8F"
            />
            <Text style={s.actionText}>{item.statistics?.supportCount || 0}</Text>
          </Pressable>

          <Pressable
            style={s.action}
            onPress={() => handleReact(item._id, "hug")}
          >
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={22}
              color="#F4A261"
            />
            <Text style={s.actionText}>{item.statistics?.hugCount || 0}</Text>
          </Pressable>

          <View style={s.action}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={22}
              color="#55736D"
            />
            <Text style={s.actionText}>{item.statistics?.commentCount || 0}</Text>
          </View>

          <Pressable style={s.action} onPress={() => handleReport(item._id)}>
            <MaterialCommunityIcons
              name="flag-outline"
              size={22}
              color="#9CA3AF"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={s.page}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.title}>Healing Forum</Text>
            <Text style={s.subtitle}>
              A safe space to share emotions, support each other, and grow gently.
            </Text>
          </View>

          <Pressable style={s.createButton} onPress={() => setShowCreate(true)}>
            <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={s.searchBox}>
          <MaterialCommunityIcons name="magnify" size={22} color="#7DA59C" />
          <TextInput
            placeholder="Search stories, feelings, hashtags..."
            placeholderTextColor="#9AB7B0"
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {filters.map((item) => {
          const active = item === filter;

          return (
            <Pressable
              key={item}
              style={[s.chip, active && s.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[s.chipText, active && s.chipTextActive]}>
                {item === "all" ? "All" : `#${item}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={s.modalBackdrop}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Share your feeling ✨</Text>

            <TextInput
              style={s.input}
              multiline
              placeholder="What is on your mind today?"
              placeholderTextColor="#9AB7B0"
              value={content}
              onChangeText={setContent}
            />

            <TextInput
              style={s.smallInput}
              placeholder="Image/video URL"
              placeholderTextColor="#9AB7B0"
              value={mediaUrl}
              onChangeText={setMediaUrl}
            />

            <TextInput
              style={s.smallInput}
              placeholder="Hashtags: stress, self-care"
              placeholderTextColor="#9AB7B0"
              value={hashtags}
              onChangeText={setHashtags}
            />

            <TextInput
              style={s.smallInput}
              placeholder="Emotion: happy, sad, stress, anxious, angry, neutral"
              placeholderTextColor="#9AB7B0"
              value={emotionStatus}
              onChangeText={setEmotionStatus}
            />

            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#123D36", fontWeight: "800" }}>
                Post anonymously
              </Text>
              <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
            </View>

            <Pressable style={s.submitButton} onPress={handleCreatePost}>
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