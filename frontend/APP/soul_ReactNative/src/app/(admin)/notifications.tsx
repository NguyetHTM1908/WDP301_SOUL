import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/constants/colors";
import {
  getAdminNotifications,
  markAdminNotifAsRead,
  markAllAdminNotifsRead,
  sendSystemNotification,
  AdminNotification,
} from "@/api/adminApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOTIF_CONFIG: Record<
  string,
  { icon: string; color: string; label: string; bgColor: string }
> = {
  safety_alert: {
    icon: "shield-alert",
    color: "#EF4444",
    label: "Cảnh báo an toàn",
    bgColor: "#FEF2F2",
  },
  moderation_review: {
    icon: "eye-check",
    color: "#F59E0B",
    label: "Kiểm duyệt",
    bgColor: "#FFFBEB",
  },
  report_update: {
    icon: "flag",
    color: "#14B8A6",
    label: "Báo cáo",
    bgColor: "#F0FDFA",
  },
  system: {
    icon: "bell-ring",
    color: "#6366F1",
    label: "Hệ thống",
    bgColor: "#EEF2FF",
  },
};

function getNotifConfig(type: string) {
  return (
    NOTIF_CONFIG[type] || {
      icon: "bell",
      color: "#6B7280",
      label: "Thông báo",
      bgColor: "#F9FAFB",
    }
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} giờ trước`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

// ─── Broadcast Modal ──────────────────────────────────────────────────────────

interface BroadcastModalProps {
  visible: boolean;
  onClose: () => void;
  onSent: () => void;
}

function BroadcastModal({ visible, onClose, onSent }: BroadcastModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"broadcast" | "single">("broadcast");

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập tiêu đề và nội dung thông báo.");
      return;
    }

    setLoading(true);
    const payload: any = { title: title.trim(), content: content.trim() };
    if (mode === "single" && targetId.trim()) {
      payload.targetUserId = targetId.trim();
    }

    const res = await sendSystemNotification(payload);
    setLoading(false);

    if (res.success) {
      Alert.alert("Thành công", res.message || "Đã gửi thông báo.");
      setTitle("");
      setContent("");
      setTargetId("");
      onClose();
      onSent();
    } else {
      Alert.alert("Lỗi", res.message || "Không thể gửi thông báo.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.headerTitle}>Gửi Thông Báo Hệ Thống</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Mode toggle */}
          <View style={modalStyles.modeRow}>
            <TouchableOpacity
              style={[
                modalStyles.modeBtn,
                mode === "broadcast" && modalStyles.modeBtnActive,
              ]}
              onPress={() => setMode("broadcast")}
            >
              <MaterialCommunityIcons
                name="broadcast"
                size={16}
                color={mode === "broadcast" ? "#fff" : "#6B7280"}
              />
              <Text
                style={[
                  modalStyles.modeBtnText,
                  mode === "broadcast" && modalStyles.modeBtnTextActive,
                ]}
              >
                Broadcast
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                modalStyles.modeBtn,
                mode === "single" && modalStyles.modeBtnActive,
              ]}
              onPress={() => setMode("single")}
            >
              <MaterialCommunityIcons
                name="account-arrow-right"
                size={16}
                color={mode === "single" ? "#fff" : "#6B7280"}
              />
              <Text
                style={[
                  modalStyles.modeBtnText,
                  mode === "single" && modalStyles.modeBtnTextActive,
                ]}
              >
                Cá nhân
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "single" && (
            <View style={modalStyles.field}>
              <Text style={modalStyles.fieldLabel}>User ID (người nhận)</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Nhập MongoDB ObjectId của user..."
                placeholderTextColor="#9CA3AF"
                value={targetId}
                onChangeText={setTargetId}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={modalStyles.field}>
            <Text style={modalStyles.fieldLabel}>Tiêu đề *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Nhập tiêu đề thông báo..."
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.fieldLabel}>Nội dung *</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.inputMultiline]}
              placeholder="Nhập nội dung thông báo..."
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={modalStyles.charCount}>{content.length}/500</Text>
          </View>

          {mode === "broadcast" && (
            <View style={modalStyles.broadcastWarn}>
              <MaterialCommunityIcons
                name="information"
                size={16}
                color="#F59E0B"
              />
              <Text style={modalStyles.broadcastWarnText}>
                Thông báo sẽ được gửi đến TẤT CẢ người dùng đang hoạt động.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[modalStyles.sendBtn, loading && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                <Text style={modalStyles.sendBtnText}>
                  {mode === "broadcast" ? "Gửi Broadcast" : "Gửi cho User"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Notification Item ────────────────────────────────────────────────────────

interface NotifItemProps {
  item: AdminNotification;
  onPress: (item: AdminNotification) => void;
}

function NotifItem({ item, onPress }: NotifItemProps) {
  const cfg = getNotifConfig(item.type);

  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      <View
        style={[styles.notifIconWrap, { backgroundColor: cfg.bgColor }]}
      >
        <MaterialCommunityIcons
          name={cfg.icon as any}
          size={22}
          color={cfg.color}
        />
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <View style={[styles.typeBadge, { backgroundColor: cfg.bgColor }]}>
            <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
          <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleBold]}>
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AdminNotificationsScreen() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "safety_alert", label: "🔴 An toàn" },
    { key: "moderation_review", label: "🟡 Kiểm duyệt" },
    { key: "report_update", label: "🟢 Báo cáo" },
    { key: "system", label: "🔔 Hệ thống" },
  ];

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await getAdminNotifications(pageNum, 30);

      if (res.success && res.data) {
        setNotifications((prev) =>
          append ? [...prev, ...res.data!] : res.data!
        );
        setUnreadCount(res.unreadCount ?? 0);
        setTotalPages(res.pagination?.totalPages ?? 1);
        setPage(pageNum);
      }

      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    },
    []
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchNotifications(page + 1, true);
    }
  };

  const handleNotifPress = async (item: AdminNotification) => {
    if (!item.isRead) {
      await markAdminNotifAsRead(item._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = () => {
    Alert.alert(
      "Đánh dấu tất cả đã đọc",
      "Bạn có chắc muốn đánh dấu tất cả thông báo là đã đọc?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            const res = await markAllAdminNotifsRead();
            if (res.success) {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              );
              setUnreadCount(0);
            }
          },
        },
      ]
    );
  };

  const filteredNotifs =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <MaterialCommunityIcons
        name="bell-sleep-outline"
        size={72}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>Chưa có thông báo</Text>
      <Text style={styles.emptySub}>
        Các cảnh báo an toàn, kiểm duyệt và báo cáo sẽ xuất hiện tại đây.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <ActivityIndicator color={colors.dark} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={colors.dark}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông Báo Hệ Thống</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="check-all"
                size={20}
                color={colors.dark}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.headerBtn, styles.headerBtnPrimary]}
            onPress={() => setShowBroadcast(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="send-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filteredNotifs.length} thông báo
          {activeFilter !== "all" ? ` (${NOTIF_CONFIG[activeFilter]?.label || activeFilter})` : ""}
        </Text>
        {unreadCount > 0 && (
          <Text style={styles.statsUnread}>{unreadCount} chưa đọc</Text>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.dark} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotifItem item={item} onPress={handleNotifPress} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.dark}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Broadcast Modal */}
      <BroadcastModal
        visible={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        onSent={() => fetchNotifications(1)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnPrimary: {
    backgroundColor: "#0F172A",
  },

  // Filters
  filterWrap: {
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  // Stats bar
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  statsUnread: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
    paddingTop: 4,
  },

  // Notification Card
  notifCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
    backgroundColor: "#FEFEFF",
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
    gap: 4,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  notifTime: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 20,
  },
  notifTitleBold: {
    color: "#0F172A",
    fontWeight: "700",
  },
  notifBody: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  // Loading & Empty
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  modeBtnActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  modeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeBtnTextActive: {
    color: "#FFFFFF",
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0F172A",
  },
  inputMultiline: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 11,
  },
  charCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  broadcastWarn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  broadcastWarnText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 16,
  },
  sendBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
