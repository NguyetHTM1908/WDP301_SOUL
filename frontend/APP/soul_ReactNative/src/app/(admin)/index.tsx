import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { colors } from "@/constants/colors";
import {
  getAdminDashboardStats,
  getAdminNotifUnreadCount,
  DashboardStats,
} from "@/api/adminApi";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, unreadRes] = await Promise.all([
        getAdminDashboardStats(),
        getAdminNotifUnreadCount(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
        setUnreadNotifs(statsRes.data.adminUnreadNotifs ?? 0);
      }
      if (unreadRes.success && unreadRes.count !== undefined) {
        setUnreadNotifs(unreadRes.count);
      }
    } catch (e) {
      console.warn("Lỗi lấy dữ liệu Dashboard Admin:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Quản trị viên?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const statCards = [
    {
      label: "Tổng người dùng",
      value:
        stats !== null
          ? stats.totalUsers.toLocaleString("vi-VN")
          : "...",
      icon: "account-group",
      color: "#14B8A6",
      sub:
        stats !== null
          ? `+${stats.newUsersThisWeek} tuần này`
          : "",
    },
    {
      label: "Báo cáo chờ xử lý",
      value: stats !== null ? String(stats.pendingReports) : "...",
      icon: "alert-decagram",
      color: "#EF4444",
      sub: stats !== null && stats.pendingReports > 0 ? "Cần xử lý" : "Đã xử lý hết",
    },
    {
      label: "Cảnh báo an toàn",
      value:
        stats !== null ? String(stats.unresolvedSafetyEvents) : "...",
      icon: "shield-alert",
      color: "#F59E0B",
      sub:
        stats !== null && stats.unresolvedSafetyEvents > 0
          ? "Chưa giải quyết"
          : "Ổn định",
    },
    {
      label: "Thông báo Admin",
      value: unreadNotifs > 0 ? String(unreadNotifs) : "0",
      icon: "bell-ring",
      color: "#6366F1",
      sub: unreadNotifs > 0 ? "Chưa đọc" : "Đã đọc hết",
    },
  ];

  const adminActions = [
    {
      title: "Thông Báo Hệ Thống",
      description: "Xem cảnh báo an toàn, kiểm duyệt và gửi thông báo broadcast",
      icon: "bell-ring",
      color: "#6366F1",
      route: "/(admin)/notifications",
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
    },
    {
      title: "Quản lý Người dùng",
      description: "Xem, chặn, phân quyền tài khoản người dùng",
      icon: "account-cog",
      color: colors.dark,
      route: "/(admin)/users",
    },
    {
      title: "Quản lý Forum",
      description: "Kiểm duyệt bài viết, xử lý báo cáo và ẩn nội dung vi phạm",
      icon: "forum-outline",
      color: "#14B8A6",
      route: "/(admin)/forum",
      badge:
        stats && stats.pendingReports > 0
          ? stats.pendingReports
          : undefined,
    },
    {
      title: "Sự kiện & Hoạt động",
      description: "Duyệt sự kiện, từ chối event và xem danh sách người đăng ký",
      icon: "calendar-star",
      color: colors.darkTeal,
      route: "/(admin)/events",
    },
    {
      title: "Cấu hình Hệ thống AI",
      description: "Tùy chỉnh mô hình LLM và độ nhạy an toàn",
      icon: "cog",
      color: "#6B7280",
      onPress: () =>
        Alert.alert("Thông báo", "Tính năng đang được hoàn thiện."),
    },
  ];

  const handleActionPress = (action: any) => {
    if (action.route) {
      router.push(action.route as any);
      return;
    }
    if (action.onPress) {
      action.onPress();
      return;
    }
    Alert.alert(
      "Thông báo",
      `Tính năng "${action.title}" đang được hoàn thiện.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.adminName}>
            {user?.fullName || "Quản trị viên"}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* Bell notification button with badge */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => router.push("/(admin)/notifications" as any)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color={colors.dark}
            />
            {unreadNotifs > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadNotifs > 99 ? "99+" : unreadNotifs}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.dark}
          />
        }
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Hệ Thống Quản Trị SOUL</Text>
            <Text style={styles.bannerSub}>
              Theo dõi sức khỏe tinh thần cộng đồng & giám sát an toàn nội dung.
            </Text>
            {stats && (
              <View style={styles.bannerStatRow}>
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatValue}>
                    {stats.activeUsers.toLocaleString("vi-VN")}
                  </Text>
                  <Text style={styles.bannerStatLabel}>User active</Text>
                </View>
                <View style={styles.bannerStatDivider} />
                <View style={styles.bannerStat}>
                  <Text style={styles.bannerStatValue}>
                    {stats.blockedUsers}
                  </Text>
                  <Text style={styles.bannerStatLabel}>Bị chặn</Text>
                </View>
              </View>
            )}
          </View>

          <MaterialCommunityIcons
            name="shield-crown"
            size={60}
            color="#FFFFFF"
            style={styles.bannerIcon}
          />
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Chỉ số Hệ thống</Text>
        <View style={styles.statsGrid}>
          {statCards.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "15" },
                ]}
              >
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {stat.sub ? (
                <Text style={[styles.statSub, { color: stat.color }]}>
                  {stat.sub}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {/* Action Cards */}
        <Text style={styles.sectionTitle}>Chức năng Quản lý</Text>

        {adminActions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => handleActionPress(action)}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: action.color + "12" },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon as any}
                size={26}
                color={action.color}
              />
            </View>

            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>
                {action.description}
              </Text>
            </View>

            {/* Badge for unread/pending count */}
            {action.badge !== undefined && action.badge > 0 ? (
              <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
                <Text style={styles.actionBadgeText}>
                  {action.badge > 99 ? "99+" : action.badge}
                </Text>
              </View>
            ) : (
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9CA3AF"
              />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            SOUL Admin Panel • Phiên bản 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },

  welcomeText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  adminName: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.dark,
    fontFamily: "Georgia",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },

  bellBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },

  bellBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Banner
  banner: {
    backgroundColor: colors.dark,
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    shadowColor: colors.dark,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },

  bannerInfo: {
    flex: 1,
    paddingRight: 12,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    fontFamily: "Georgia",
  },

  bannerSub: {
    color: "#D1FAE5",
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
    marginBottom: 12,
  },

  bannerStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  bannerStat: {
    alignItems: "flex-start",
  },

  bannerStatValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  bannerStatLabel: {
    color: "#D1FAE5",
    fontSize: 11,
    opacity: 0.8,
  },

  bannerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  bannerIcon: {
    opacity: 0.9,
  },

  // Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  statSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },

  // Action Cards
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 4,
  },

  actionDescription: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },

  actionBadge: {
    borderRadius: 12,
    minWidth: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  actionBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  footer: {
    alignItems: "center",
    marginTop: 20,
  },

  footerText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});