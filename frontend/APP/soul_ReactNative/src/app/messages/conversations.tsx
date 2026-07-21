import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store";
import { getConversations } from "@/api/messageApi";
import { messageStyles as s } from "@/styles/message.styles";

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  if (hours < 24) return `${hours} giờ`;
  if (days < 7) return `${days} ngày`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export default function ConversationsScreen() {
  const token = useAuthStore((state: any) => state.token);
  const currentUser = useAuthStore((state: any) => state.user);

  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(
    async (showLoading = false) => {
      if (!token) return;
      try {
        if (showLoading) setLoading(true);
        const res = await getConversations(token);
        if (res?.success) {
          setConversations(res.data || []);
        }
      } catch (err) {
        console.warn("Error loading conversations:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [token]
  );

  // Initial load
  useEffect(() => {
    loadConversations(true);
  }, [loadConversations]);

  // Polling mỗi 3 giây
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      loadConversations(false);
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadConversations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations(false);
    setRefreshing(false);
  };

  // Lọc theo tìm kiếm
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((conv) =>
        conv.otherUser?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    : conversations;

  const renderConversation = ({ item }: { item: any }) => {
    const isUnread = item.unreadCount > 0;
    const otherUser = item.otherUser;
    const lastMsg = item.lastMessage;
    const currentUserId = currentUser?._id || currentUser?.id;

    let lastMessagePreview = "";
    if (lastMsg?.content) {
      const isMyMsg = lastMsg.senderId === currentUserId ||
        lastMsg.senderId?._id === currentUserId;
      const prefix = isMyMsg ? "Bạn: " : "";
      lastMessagePreview =
        prefix +
        (lastMsg.content.length > 40
          ? lastMsg.content.substring(0, 40) + "..."
          : lastMsg.content);
    }

    return (
      <TouchableOpacity
        style={[s.conversationItem, isUnread && s.conversationItemUnread]}
        onPress={() =>
          router.push({
            pathname: "/messages/chat",
            params: {
              userId: otherUser?._id,
              userName: otherUser?.fullName || "Người dùng",
              userAvatar: otherUser?.avatarUrl || "",
            },
          } as any)
        }
        activeOpacity={0.7}
      >
        {/* Avatar */}
        {otherUser?.avatarUrl ? (
          <Image
            source={{ uri: otherUser.avatarUrl }}
            style={s.conversationAvatar}
          />
        ) : (
          <View style={s.conversationAvatarFallback}>
            <Text style={s.conversationAvatarFallbackText}>
              {getInitials(otherUser?.fullName || "")}
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={s.conversationContent}>
          <View style={s.conversationHeader}>
            <Text
              style={[
                s.conversationName,
                isUnread && s.conversationNameUnread,
              ]}
              numberOfLines={1}
            >
              {otherUser?.fullName || "Người dùng SOUL"}
            </Text>
            <Text
              style={[
                s.conversationTime,
                isUnread && s.conversationTimeUnread,
              ]}
            >
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={[
                s.conversationLastMessage,
                isUnread && s.conversationLastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {lastMessagePreview || "Bắt đầu cuộc trò chuyện..."}
            </Text>
            {isUnread && (
              <View style={s.unreadBadge}>
                <Text style={s.unreadBadgeText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#006B5C" />
        <Text style={{ marginTop: 12, color: "#6B7C93" }}>
          Đang tải tin nhắn...
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.headerBackButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#006B5C"
          />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Tin nhắn</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
        <TextInput
          style={s.searchInput}
          placeholder="Tìm kiếm hội thoại..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations list */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#006B5C"]}
          />
        }
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons
              name="message-text-outline"
              size={64}
              color="#CBD5E1"
            />
            <Text style={s.emptyText}>Chưa có tin nhắn nào</Text>
            <Text style={s.emptySubText}>
              Hãy bắt đầu trò chuyện với bạn bè!
            </Text>
          </View>
        }
      />
    </View>
  );
}
