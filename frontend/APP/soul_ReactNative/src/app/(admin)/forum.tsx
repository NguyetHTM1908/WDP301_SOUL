import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { adminForumStyles as s } from "@/styles/adminForum.styles";

type ForumStatus = "all" | "pending" | "approved" | "hidden" | "reported";

type ForumPost = {
  id: string;
  author: string;
  title: string;
  content: string;
  status: Exclude<ForumStatus, "all">;
  reports: number;
  comments: number;
  createdAt: string;
  isAnonymous: boolean;
};

const mockPosts: ForumPost[] = [
  {
    id: "1",
    author: "Anonymous Student",
    title: "I feel stressed about exams",
    content:
      "Recently I have been feeling overwhelmed with deadlines and exams. I do not know how to balance everything.",
    status: "reported",
    reports: 3,
    comments: 12,
    createdAt: "23/06/2026",
    isAnonymous: true,
  },
  {
    id: "2",
    author: "Minh Anh",
    title: "A small positive habit that helped me",
    content:
      "I started writing three things I am grateful for every night. It helps me sleep better.",
    status: "approved",
    reports: 0,
    comments: 5,
    createdAt: "22/06/2026",
    isAnonymous: false,
  },
  {
    id: "3",
    author: "Anonymous Student",
    title: "Need someone to listen",
    content:
      "I have been feeling lonely lately. I just want to share my feelings with someone.",
    status: "pending",
    reports: 0,
    comments: 2,
    createdAt: "21/06/2026",
    isAnonymous: true,
  },
  {
    id: "4",
    author: "Quang Huy",
    title: "Inappropriate comment in forum",
    content:
      "This post has been hidden because it may violate community guidelines.",
    status: "hidden",
    reports: 5,
    comments: 8,
    createdAt: "20/06/2026",
    isAnonymous: false,
  },
];

const filters: { label: string; value: ForumStatus; icon: any }[] = [
  { label: "All", value: "all", icon: "view-grid-outline" },
  { label: "Pending", value: "pending", icon: "clock-outline" },
  { label: "Approved", value: "approved", icon: "check-circle-outline" },
  { label: "Reported", value: "reported", icon: "flag-outline" },
  { label: "Hidden", value: "hidden", icon: "eye-off-outline" },
];

function getStatusInfo(status: ForumPost["status"]) {
  if (status === "pending") {
    return {
      label: "Pending",
      color: "#F59E0B",
      bg: "#FFF7E6",
      icon: "clock-outline",
    };
  }

  if (status === "approved") {
    return {
      label: "Approved",
      color: "#00866B",
      bg: "#E8F8F3",
      icon: "check-circle-outline",
    };
  }

  if (status === "reported") {
    return {
      label: "Reported",
      color: "#DC2626",
      bg: "#FEECEC",
      icon: "flag-outline",
    };
  }

  return {
    label: "Hidden",
    color: "#64748B",
    bg: "#F1F5F9",
    icon: "eye-off-outline",
  };
}

export default function AdminForumScreen() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ForumStatus>("all");
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => {
      const matchFilter =
        activeFilter === "all" ? true : post.status === activeFilter;

      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword);

      return matchFilter && matchSearch;
    });
  }, [posts, search, activeFilter]);

  const totalReported = posts.filter((item) => item.status === "reported").length;
  const totalPending = posts.filter((item) => item.status === "pending").length;
  const totalHidden = posts.filter((item) => item.status === "hidden").length;

  const updateStatus = (id: string, status: ForumPost["status"]) => {
    setPosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleApprove = (id: string) => {
    updateStatus(id, "approved");
    Alert.alert("Approved", "The post has been approved.");
  };

  const handleHide = (id: string) => {
    updateStatus(id, "hidden");
    Alert.alert("Hidden", "The post has been hidden from the forum.");
  };

  const handleDelete = (id: string) => {
    const deleteNow = () => {
      setPosts((prev) => prev.filter((item) => item.id !== id));
      Alert.alert("Deleted", "The post has been deleted.");
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this post?");
      if (confirmed) deleteNow();
      return;
    }

    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: deleteNow,
      },
    ]);
  };

  const renderPost = ({ item }: { item: ForumPost }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={s.postCard}>
        <View style={s.postTop}>
          <View style={s.authorBox}>
            <View style={s.avatarCircle}>
              <MaterialCommunityIcons
                name={item.isAnonymous ? "incognito" : "account-outline"}
                size={24}
                color="#00866B"
              />
            </View>

            <View style={s.authorInfo}>
              <Text style={s.authorName}>{item.author}</Text>
              <Text style={s.postDate}>{item.createdAt}</Text>
            </View>
          </View>

          <View style={[s.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <MaterialCommunityIcons
              name={statusInfo.icon as any}
              size={14}
              color={statusInfo.color}
            />
            <Text style={[s.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={s.postTitle}>{item.title}</Text>

        <Text style={s.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={s.postMetaRow}>
          <View style={s.metaItem}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={17}
              color="#64748B"
            />
            <Text style={s.metaText}>{item.comments} comments</Text>
          </View>

          <View style={s.metaItem}>
            <MaterialCommunityIcons
              name="flag-outline"
              size={17}
              color={item.reports > 0 ? "#DC2626" : "#64748B"}
            />
            <Text
              style={[
                s.metaText,
                item.reports > 0 && {
                  color: "#DC2626",
                  fontWeight: "700",
                },
              ]}
            >
              {item.reports} reports
            </Text>
          </View>
        </View>

        <View style={s.actionRow}>
          <Pressable
            style={[s.actionButton, s.viewButton]}
            onPress={() => Alert.alert("View detail", "Open post detail screen.")}
          >
            <MaterialCommunityIcons name="eye-outline" size={18} color="#2563EB" />
            <Text style={[s.actionText, { color: "#2563EB" }]}>View</Text>
          </Pressable>

          <Pressable
            style={[s.actionButton, s.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color="#00866B"
            />
            <Text style={[s.actionText, { color: "#00866B" }]}>Approve</Text>
          </Pressable>

          <Pressable
            style={[s.actionButton, s.hideButton]}
            onPress={() => handleHide(item.id)}
          >
            <MaterialCommunityIcons
              name="eye-off-outline"
              size={18}
              color="#F59E0B"
            />
            <Text style={[s.actionText, { color: "#F59E0B" }]}>Hide</Text>
          </Pressable>

          <Pressable
            style={[s.actionButton, s.deleteButton]}
            onPress={() => handleDelete(item.id)}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={18}
              color="#DC2626"
            />
            <Text style={[s.actionText, { color: "#DC2626" }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={s.page}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable
            style={s.backButton}
            onPress={() => router.replace("/(admin)" as any)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#064D3D" />
          </Pressable>

          <View style={s.headerIcon}>
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={28}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={s.title}>Forum Moderation</Text>

        <Text style={s.subtitle}>
          Review community posts, handle reports, and keep SOUL forum safe.
        </Text>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{posts.length}</Text>
            <Text style={s.statLabel}>Total posts</Text>
          </View>

          <View style={s.statCard}>
            <Text style={[s.statValue, { color: "#F59E0B" }]}>
              {totalPending}
            </Text>
            <Text style={s.statLabel}>Pending</Text>
          </View>

          <View style={s.statCard}>
            <Text style={[s.statValue, { color: "#DC2626" }]}>
              {totalReported}
            </Text>
            <Text style={s.statLabel}>Reported</Text>
          </View>

          <View style={s.statCard}>
            <Text style={[s.statValue, { color: "#64748B" }]}>
              {totalHidden}
            </Text>
            <Text style={s.statLabel}>Hidden</Text>
          </View>
        </View>

        <View style={s.searchBox}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#7A8F89"
          />

          <TextInput
            style={s.searchInput}
            placeholder="Search posts, author, content..."
            placeholderTextColor="#8A9996"
            value={search}
            onChangeText={setSearch}
          />

          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          {filters.map((item) => {
            const active = item.value === activeFilter;

            return (
              <Pressable
                key={item.value}
                style={[s.filterChip, active && s.filterChipActive]}
                onPress={() => setActiveFilter(item.value)}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={17}
                  color={active ? "#FFFFFF" : "#00866B"}
                />

                <Text style={[s.filterText, active && s.filterTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>🛡️</Text>
            <Text style={s.emptyTitle}>No posts found</Text>
            <Text style={s.emptyText}>
              There are no forum posts matching your current filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}