import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { getApprovedPosts } from "@/api/forumApi";
import { styles } from "@/styles/home.styles";

function normalizeList(res: any) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.posts)) return res.posts;
  if (Array.isArray(res?.data?.posts)) return res.data.posts;
  return [];
}

function formatTimeAgo(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("vi-VN");
}

function getAuthorName(post: any) {
  if (post?.isAnonymous) {
    return post?.anonymousName || "Anonymous Soul";
  }

  return post?.authorId?.fullName || "SOUL User";
}

function getAvatar(post: any) {
  if (post?.isAnonymous) {
    return "https://i.pravatar.cc/100?img=12";
  }

  return post?.authorId?.avatarUrl || "https://i.pravatar.cc/100?img=32";
}

function getPostContent(post: any) {
  const content = post?.content || "";

  if (content.length <= 115) return content;

  return `${content.slice(0, 115).trim()}...`;
}

export function CommunityPreview() {
  const [latestPost, setLatestPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLatestPost = async () => {
    try {
      setLoading(true);

      const res = await getApprovedPosts();
      const posts = normalizeList(res);

      // Backend đã lọc isFlagged = false rồi.
      // Thêm filter này để chắc chắn bài AI review không hiện trên Home.
      const safePosts = posts.filter((post: any) => post?.isFlagged !== true);

      setLatestPost(safePosts[0] || null);
    } catch (error) {
      console.log("Load latest community post error:", error);
      setLatestPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatestPost();
  }, []);

  const goToForum = () => {
    router.push("/forum" as any);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>👥 Community Highlight</Text>

        <Pressable onPress={goToForum}>
          <Text style={styles.panelLink}>See all</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.communityWrap}>
          <View style={{ flex: 1 }}>
            <Text style={styles.postText}>Loading latest community post...</Text>
          </View>

          <View style={styles.illustrationBox}>
            <MaterialCommunityIcons
              name="account-group"
              size={92}
              color="#2A9D8F"
            />
          </View>
        </View>
      ) : latestPost ? (
        <Pressable style={styles.communityWrap} onPress={goToForum}>
          <View style={{ flex: 1 }}>
            <View style={styles.userRow}>
              <Image
                source={{ uri: getAvatar(latestPost) }}
                style={styles.smallAvatar}
              />

              <View>
                <Text style={styles.userName}>
                  {getAuthorName(latestPost)}{" "}
                  <Text style={styles.newTag}>New</Text>
                </Text>

                <Text style={styles.time}>
                  {formatTimeAgo(latestPost?.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.postText}>{getPostContent(latestPost)}</Text>

            <View style={styles.reactRow}>
              <Text style={styles.reactText}>
                💚 {latestPost?.statistics?.supportCount || 0}
              </Text>

              <Text style={styles.reactText}>
                💬 {latestPost?.statistics?.commentCount || 0}
              </Text>
            </View>
          </View>

          <View style={styles.illustrationBox}>
            <MaterialCommunityIcons
              name="account-group"
              size={92}
              color="#2A9D8F"
            />
          </View>
        </Pressable>
      ) : (
        <Pressable style={styles.communityWrap} onPress={goToForum}>
          <View style={{ flex: 1 }}>
            <View style={styles.userRow}>
              <View style={styles.smallAvatar} />

              <View>
                <Text style={styles.userName}>No community post yet</Text>
                <Text style={styles.time}>Be the first to share</Text>
              </View>
            </View>

            <Text style={styles.postText}>
              Share your feeling with the SOUL community and support others.
            </Text>

            <View style={styles.reactRow}>
              <Text style={styles.reactText}>🌿 Start sharing</Text>
            </View>
          </View>

          <View style={styles.illustrationBox}>
            <MaterialCommunityIcons
              name="account-group"
              size={92}
              color="#2A9D8F"
            />
          </View>
        </Pressable>
      )}
    </View>
  );
}