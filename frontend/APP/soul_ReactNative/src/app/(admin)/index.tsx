import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { colors } from "@/constants/colors";

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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

  // Mock stats for dashboard
  const stats = [
    { label: "Người dùng", value: "1,250", icon: "account-group", color: "#14B8A6" },
    { label: "Báo cáo mới", value: "12", icon: "alert-decagram", color: "#EF4444" },
    { label: "Chat Sessions", value: "348", icon: "chat-processing", color: "#F59E0B" },
    { label: "Kiểm duyệt AI", value: "98.4%", icon: "robot", color: "#3B82F6" },
  ];

  const adminActions = [
    {
      title: "Quản lý Người dùng",
      description: "Xem, chặn, phân quyền tài khoản người dùng",
      icon: "account-cog",
      color: colors.dark,
      onPress: () => Alert.alert("Thông báo", `Tính năng đang được hoàn thiện.`),
    },
    {
      title: "Xem Báo cáo Nội dung",
      description: "Xét duyệt và xử lý các bài đăng bị báo cáo vi phạm",
      icon: "shield-alert",
      color: "#EF4444",
      onPress: () => Alert.alert("Thông báo", `Tính năng đang được hoàn thiện.`),
    },
    {
      title: "Sự kiện & Hoạt động",
      description: "Tạo và điều phối các workshop/talkshow tâm lý",
      icon: "calendar-star",
      color: colors.darkTeal,
      onPress: () => router.push("/(admin)/events"),
    },
    {
      title: "Cấu hình Hệ thống AI",
      description: "Tùy chỉnh mô hình LLM và độ nhạy an toàn",
      icon: "cog",
      color: "#6B7280",
      onPress: () => Alert.alert("Thông báo", `Tính năng đang được hoàn thiện.`),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.adminName}>{user?.fullName || "Quản trị viên"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Hệ Thống Quản Trị SOUL</Text>
            <Text style={styles.bannerSub}>Theo dõi sức khỏe tinh thần cộng đồng & giám sát an toàn nội dung.</Text>
          </View>
          <MaterialCommunityIcons name="shield-crown" size={60} color="#FFFFFF" style={styles.bannerIcon} />
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Chỉ số Hệ thống</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: stat.color + "15" }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Admin Actions */}
        <Text style={styles.sectionTitle}>Chức năng Quản lý</Text>
        {adminActions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={action.onPress}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color + "12" }]}>
              <MaterialCommunityIcons name={action.icon as any} size={26} color={action.color} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>SOUL Admin Panel • Phiên bản 1.0.0</Text>
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
  },
  bannerIcon: {
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
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
