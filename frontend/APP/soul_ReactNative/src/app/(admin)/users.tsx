import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  getAdminUsers,
  updateAdminUserStatus,
  updateAdminUserRole,
  AdminUser,
} from "@/api/adminApi";
import { colors } from "@/constants/colors";

// ── Constants ──────────────────────────────────────────────────
const ROLE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  user: { label: "Người dùng", color: "#2563EB", bg: "#DBEAFE", icon: "account" },
  event_organizer: { label: "Tổ chức sự kiện", color: "#D97706", bg: "#FEF3C7", icon: "calendar-star" },
  admin: { label: "Quản trị viên", color: "#7C3AED", bg: "#EDE9FE", icon: "shield-crown" },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Hoạt động", color: "#059669", bg: "#D1FAE5" },
  blocked: { label: "Bị khóa", color: "#DC2626", bg: "#FEE2E2" },
  inactive: { label: "Không hoạt động", color: "#6B7280", bg: "#F3F4F6" },
};

const FILTER_TABS = [
  { key: "", label: "Tất cả" },
  { key: "user", label: "User" },
  { key: "event_organizer", label: "Organizer" },
  { key: "admin", label: "Admin" },
  { key: "blocked", label: "Bị khóa" },
];

// ── UserCard component ─────────────────────────────────────────
function UserCard({
  user,
  onAction,
}: {
  user: AdminUser;
  onAction: (user: AdminUser) => void;
}) {
  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
  const status = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const initials = user.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.userCard} onPress={() => onAction(user)} activeOpacity={0.8}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: role.bg }]}>
        <Text style={[styles.avatarText, { color: role.color }]}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {user.fullName}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user.email}
        </Text>
        <View style={styles.badgeRow}>
          {/* Role badge */}
          <View style={[styles.badge, { backgroundColor: role.bg }]}>
            <MaterialCommunityIcons name={role.icon as any} size={11} color={role.color} />
            <Text style={[styles.badgeText, { color: role.color }]}>{role.label}</Text>
          </View>
          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <MaterialCommunityIcons name="dots-vertical" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

// ── Main Screen ────────────────────────────────────────────────
export default function AdminUsersScreen() {
  const params = useLocalSearchParams<{ search?: string }>();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(params.search || "");
  const [filterTab, setFilterTab] = useState(""); // role filter, "blocked" = status filter
  const [actionLoading, setActionLoading] = useState(false);

  // States cho Custom Popup Modal
  const [selectedUserForModal, setSelectedUserForModal] = useState<AdminUser | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Fetch users
  const fetchUsers = useCallback(
    async (searchVal = search, tab = filterTab) => {
      try {
        const params: Record<string, string | number> = { limit: 50 };
        if (searchVal.trim()) params.search = searchVal.trim();
        if (tab === "blocked") {
          params.status = "blocked";
        } else if (tab) {
          params.role = tab;
        }

        const res = await getAdminUsers(params);
        if (res.success && res.data) {
          setUsers(res.data.users);
        } else {
          Alert.alert("Lỗi", res.message || "Không thể tải danh sách người dùng.");
        }
      } catch {
        Alert.alert("Lỗi", "Không thể kết nối đến máy chủ.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, filterTab]
  );

  useEffect(() => {
    fetchUsers();
  }, [filterTab]);

  useEffect(() => {
    if (params.search) {
      setSearch(params.search);
    }
  }, [params.search]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(search, filterTab);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchUsers(search, filterTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Action menu cho từng user
  const handleUserAction = (user: AdminUser) => {
    setSelectedUserForModal(user);
    setShowActionModal(true);
  };

  const confirmStatusChange = (user: AdminUser, newStatus: "active" | "blocked") => {
    const label = newStatus === "blocked" ? "khóa" : "mở khóa";
    setConfirmConfig({
      title: "Xác nhận",
      message: `Bạn có chắc muốn ${label} tài khoản của "${user.fullName}" không?`,
      isDestructive: newStatus === "blocked",
      onConfirm: () => {
        setShowConfirmModal(false);
        doUpdateStatus(user._id, newStatus);
      },
    });
    setShowActionModal(false);
    setShowConfirmModal(true);
  };

  const confirmRoleChange = (user: AdminUser, newRole: "user" | "event_organizer") => {
    const label =
      newRole === "event_organizer"
        ? `gán quyền Event Organizer cho "${user.fullName}"`
        : `thu hồi quyền Event Organizer của "${user.fullName}"`;
    setConfirmConfig({
      title: "Xác nhận",
      message: `Bạn có chắc muốn ${label} không?`,
      isDestructive: false,
      onConfirm: () => {
        setShowConfirmModal(false);
        doUpdateRole(user._id, newRole);
      },
    });
    setShowActionModal(false);
    setShowConfirmModal(true);
  };

  const doUpdateStatus = async (id: string, status: "active" | "blocked") => {
    setActionLoading(true);
    const res = await updateAdminUserStatus(id, status);
    setActionLoading(false);
    if (res.success) {
      Alert.alert("✅ Thành công", res.message);
      fetchUsers(search, filterTab);
    } else {
      Alert.alert("❌ Lỗi", res.message);
    }
  };

  const doUpdateRole = async (id: string, role: "user" | "event_organizer") => {
    setActionLoading(true);
    const res = await updateAdminUserRole(id, role);
    setActionLoading(false);
    if (res.success) {
      Alert.alert("✅ Thành công", res.message);
      fetchUsers(search, filterTab);
    } else {
      Alert.alert("❌ Lỗi", res.message);
    }
  };

  // Stats summary
  const totalUsers = users.length;
  const blockedCount = users.filter((u) => u.status === "blocked").length;
  const organizerCount = users.filter((u) => u.role === "event_organizer").length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Action loading overlay */}
      {actionLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.dark} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Người dùng</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalUsers}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#D97706" }]}>{organizerCount}</Text>
          <Text style={styles.statLabel}>Organizer</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#DC2626" }]}>{blockedCount}</Text>
          <Text style={styles.statLabel}>Bị khóa</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hoặc email..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, filterTab === tab.key && styles.filterTabActive]}
            onPress={() => setFilterTab(tab.key)}
          >
            <Text
              style={[styles.filterTabText, filterTab === tab.key && styles.filterTabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.dark} />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="account-off" size={60} color="#D1D5DB" />
          <Text style={styles.emptyText}>Không có người dùng nào</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserCard user={item} onAction={handleUserAction} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.dark} />
          }
        />
      )}

      {/* ── Custom Action Modal (Web-style popup card) ── */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          {selectedUserForModal && (
            <View style={styles.popupCard}>
              {/* Header */}
              <View style={styles.popupHeader}>
                <View
                  style={[
                    styles.popupAvatar,
                    {
                      backgroundColor:
                        ROLE_CONFIG[selectedUserForModal.role]?.bg || ROLE_CONFIG.user.bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.popupAvatarText,
                      {
                        color:
                          ROLE_CONFIG[selectedUserForModal.role]?.color || ROLE_CONFIG.user.color,
                      },
                    ]}
                  >
                    {selectedUserForModal.fullName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.popupTitle}>{selectedUserForModal.fullName}</Text>
                <Text style={styles.popupSubTitle}>{selectedUserForModal.email}</Text>

                <View style={styles.popupBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          ROLE_CONFIG[selectedUserForModal.role]?.bg || ROLE_CONFIG.user.bg,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        (ROLE_CONFIG[selectedUserForModal.role]?.icon ||
                          ROLE_CONFIG.user.icon) as any
                      }
                      size={11}
                      color={
                        ROLE_CONFIG[selectedUserForModal.role]?.color || ROLE_CONFIG.user.color
                      }
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            ROLE_CONFIG[selectedUserForModal.role]?.color || ROLE_CONFIG.user.color,
                        },
                      ]}
                    >
                      {ROLE_CONFIG[selectedUserForModal.role]?.label || selectedUserForModal.role}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          STATUS_CONFIG[selectedUserForModal.status]?.bg || STATUS_CONFIG.active.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            STATUS_CONFIG[selectedUserForModal.status]?.color ||
                            STATUS_CONFIG.active.color,
                        },
                      ]}
                    >
                      {STATUS_CONFIG[selectedUserForModal.status]?.label ||
                        selectedUserForModal.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.popupSeparator} />

              {/* Actions */}
              {/* 1. Khóa / Mở khóa */}
              {selectedUserForModal.status === "blocked" ? (
                <TouchableOpacity
                  style={styles.popupActionBtn}
                  onPress={() => confirmStatusChange(selectedUserForModal, "active")}
                >
                  <MaterialCommunityIcons name="lock-open-outline" size={20} color="#059669" />
                  <Text style={[styles.popupActionBtnText, { color: "#059669" }]}>
                    Mở khóa tài khoản
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.popupActionBtn}
                  onPress={() => confirmStatusChange(selectedUserForModal, "blocked")}
                >
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#DC2626" />
                  <Text style={[styles.popupActionBtnText, { color: "#DC2626" }]}>
                    Khóa tài khoản
                  </Text>
                </TouchableOpacity>
              )}

              {/* 2. Gán / Thu hồi Organizer */}
              {selectedUserForModal.role === "event_organizer" ? (
                <TouchableOpacity
                  style={styles.popupActionBtn}
                  onPress={() => confirmRoleChange(selectedUserForModal, "user")}
                >
                  <MaterialCommunityIcons name="account-minus-outline" size={20} color="#D97706" />
                  <Text style={[styles.popupActionBtnText, { color: "#D97706" }]}>
                    Thu hồi quyền Organizer
                  </Text>
                </TouchableOpacity>
              ) : (
                selectedUserForModal.role !== "admin" && (
                  <TouchableOpacity
                    style={styles.popupActionBtn}
                    onPress={() => confirmRoleChange(selectedUserForModal, "event_organizer")}
                  >
                    <MaterialCommunityIcons name="calendar-plus" size={20} color="#006B5C" />
                    <Text style={[styles.popupActionBtnText, { color: "#006B5C" }]}>
                      Gán quyền Event Organizer
                    </Text>
                  </TouchableOpacity>
                )
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.popupCancelBtn}
                onPress={() => setShowActionModal(false)}
              >
                <Text style={styles.popupCancelBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ── Custom Confirm Modal ── */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          {confirmConfig && (
            <View style={styles.popupCard}>
              <View
                style={[
                  styles.confirmIcon,
                  { backgroundColor: confirmConfig.isDestructive ? "#FEE2E2" : "#E2F2ED" },
                ]}
              >
                <MaterialCommunityIcons
                  name={confirmConfig.isDestructive ? "alert-circle-outline" : "help-circle-outline"}
                  size={36}
                  color={confirmConfig.isDestructive ? "#DC2626" : "#006B5C"}
                />
              </View>

              <Text style={styles.confirmTitle}>{confirmConfig.title}</Text>
              <Text style={styles.confirmMessage}>{confirmConfig.message}</Text>

              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmBtnLeft}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={[styles.confirmBtnText, { color: "#64748B" }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtnRight,
                    { backgroundColor: confirmConfig.isDestructive ? "#DC2626" : "#006B5C" },
                  ]}
                  onPress={confirmConfig.onConfirm}
                >
                  <Text style={[styles.confirmBtnText, { color: "#FFFFFF" }]}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    fontFamily: "Georgia",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.dark,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  filterScroll: {
    maxHeight: 52,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingVertical: 4,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 18,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
  },
  userEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  // Custom Alert Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    padding: 24,
    shadowColor: "#006B5C",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E2F2ED",
  },
  popupHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  popupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  popupAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#004C43",
    textAlign: "center",
    marginBottom: 4,
  },
  popupSubTitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  popupBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  popupSeparator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
    marginBottom: 16,
  },
  popupActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2F2ED",
    backgroundColor: "#F8FAFB",
    width: "100%",
    marginBottom: 10,
  },
  popupActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#004C43",
  },
  popupCancelBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 6,
  },
  popupCancelBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  // Confirm Popup Styles
  confirmIcon: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  confirmBtnLeft: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnRight: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
