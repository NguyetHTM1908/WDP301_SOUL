import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "@/store";
import {
  getNotifications,
  markNotifAsRead,
  markAllNotifAsRead,
} from "@/api/notificationApi";
import { notifStyles as s } from "@/styles/notification.styles";

// ─── Icon và màu sắc theo loại thông báo ───────────────────────
function getIconInfo(type: string): {
  name: string;
  color: string;
  wrapStyle: any;
} {
  switch (type) {
    case "friend_request":
      return { name: "account-plus", color: "#0284C7", wrapStyle: s.iconWrapFriend };
    case "friend_accepted":
      return { name: "account-check", color: "#16A34A", wrapStyle: s.iconWrapAccepted };
    case "friend_suggestion":
      return { name: "account-star", color: "#0284C7", wrapStyle: s.iconWrapFriend };
    case "event_approved":
      return { name: "calendar-check", color: "#CA8A04", wrapStyle: s.iconWrapEvent };
    case "event_rejected":
      return { name: "calendar-remove", color: "#DC2626", wrapStyle: s.iconWrapEvent };
    case "event_registered":
      return { name: "calendar-star", color: "#CA8A04", wrapStyle: s.iconWrapEvent };
    case "event_reminder":
      return { name: "calendar-clock", color: "#CA8A04", wrapStyle: s.iconWrapEvent };
    case "post_reaction":
      return { name: "heart", color: "#9333EA", wrapStyle: s.iconWrapPost };
    case "post_comment":
      return { name: "comment-text", color: "#0284C7", wrapStyle: s.iconWrapComment };
    case "comment_reply":
      return { name: "comment-multiple", color: "#0284C7", wrapStyle: s.iconWrapComment };
    case "mental_insight":
      return { name: "head-cog", color: "#006B5C", wrapStyle: s.iconWrapSystem };
    case "safety_alert":
      return { name: "alert-circle", color: "#DC2626", wrapStyle: s.iconWrapEvent };
    default:
      return { name: "bell", color: "#006B5C", wrapStyle: s.iconWrapSystem };
  }
}

// ─── Định dạng thời gian tương đối ────────────────────────────
function relativeTime(dateStr: string) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Điều hướng khi bấm vào thông báo ────────────────────────
function handleNavigation(notif: any) {
  const related = notif?.related;
  if (!related?.type || !related?.id) return;

  switch (related.type) {
    case "user":
      router.push(`/profile/${related.id}` as any);
      break;
    case "post":
      // Navigate đến màn hình forum với post highlighted (best effort)
      router.push("/(tabs)/forum" as any);
      break;
    case "event":
      // Navigate đến chi tiết sự kiện nếu có route
      router.push("/(tabs)/events" as any);
      break;
    default:
      break;
  }
}

// ─── Component Item ────────────────────────────────────────────
function NotifItem({
  item,
  onPress,
}: {
  item: any;
  onPress: (id: string) => void;
}) {
  const { name, color, wrapStyle } = getIconInfo(item.type);

  return (
    <TouchableOpacity
      style={[s.notifItem, !item.isRead && s.notifItemUnread]}
      onPress={() => onPress(item._id)}
      activeOpacity={0.7}
    >
      <View style={[s.iconWrap, wrapStyle]}>
        <MaterialCommunityIcons name={name as any} size={24} color={color} />
      </View>

      <View style={s.notifContent}>
        <Text style={s.notifTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.notifBody} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={s.notifTime}>{relativeTime(item.createdAt)}</Text>
      </View>

      {!item.isRead && <View style={s.unreadDot} />}
    </TouchableOpacity>
  );
}

// ─── Màn hình chính ────────────────────────────────────────────
export default function NotificationsScreen() {
  const token = useAuthStore((state: any) => state.token);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadNotifications = useCallback(
    async (showLoading = false) => {
      if (!token) return;
      try {
        if (showLoading) setLoading(true);
        const res = await getNotifications(token, 1, 50);
        if (res?.success) {
          setNotifications(res.data || []);
        }
      } catch (err) {
        console.warn("Error loading notifications:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // Polling mỗi 15 giây
  useEffect(() => {
    pollingRef.current = setInterval(() => loadNotifications(false), 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications(false);
    setRefreshing(false);
  };

  const handleItemPress = useCallback(
    async (id: string) => {
      // Đánh dấu đã đọc local ngay lập tức
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Gọi API ngầm
      try {
        await markNotifAsRead(token, id);
      } catch (e) {}

      // Navigate đến trang liên quan
      const notif = notifications.find((n) => n._id === id);
      if (notif) handleNavigation(notif);
    },
    [token, notifications]
  );

  const handleMarkAll = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotifAsRead(token);
    } catch (e) {}
  }, [token]);

  // Chia nhóm: Mới (< 24h) và Trước đó
  const { recent, earlier } = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600 * 1000;
    const recent: any[] = [];
    const earlier: any[] = [];
    notifications.forEach((n) => {
      if (new Date(n.createdAt).getTime() > cutoff) {
        recent.push(n);
      } else {
        earlier.push(n);
      }
    });
    return { recent, earlier };
  }, [notifications]);

  const hasUnread = notifications.some((n) => !n.isRead);

  // Gộp data với section headers
  const listData = useMemo(() => {
    const items: any[] = [];
    if (recent.length > 0) {
      items.push({ _id: "section_recent", isSection: true, title: "Mới" });
      items.push(...recent);
    }
    if (earlier.length > 0) {
      items.push({ _id: "section_earlier", isSection: true, title: "Trước đó" });
      items.push(...earlier);
    }
    return items;
  }, [recent, earlier]);

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#006B5C" />
        <Text style={{ marginTop: 12, color: "#6B7C93" }}>
          Đang tải thông báo...
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBackBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#006B5C" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thông báo</Text>
        {hasUnread && (
          <TouchableOpacity style={s.markAllBtn} onPress={handleMarkAll}>
            <Text style={s.markAllText}>Đánh dấu tất cả đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => {
          if (item.isSection) {
            return (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{item.title}</Text>
              </View>
            );
          }
          return (
            <NotifItem item={item} onPress={handleItemPress} />
          );
        }}
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
              name="bell-sleep-outline"
              size={72}
              color="#CBD5E1"
            />
            <Text style={s.emptyText}>Chưa có thông báo nào</Text>
            <Text style={s.emptySubText}>
              Khi có kết bạn mới, ai đó bình luận bài viết hoặc có sự kiện mới,
              bạn sẽ thấy ở đây.
            </Text>
          </View>
        }
      />
    </View>
  );
}
