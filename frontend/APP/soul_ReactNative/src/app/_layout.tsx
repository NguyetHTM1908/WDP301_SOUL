import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { BottomNav } from "@/components/home/BottomNav";

import { useAuthStore } from "@/store";

export default function RootLayout() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state: any) => state.user);

  const userRole = String(user?.role || "").trim().toLowerCase();
  const isAdminRole = userRole === "admin" || userRole === "administrator";

  // Xác định các màn hình/vai trò KHÔNG hiển thị BottomNav (Chỉ ẩn hoàn toàn với Admin)
  const isHiddenRoute =
    isAdminRole ||
    pathname.includes("/(auth)") ||
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot") ||
    pathname.includes("/verify") ||
    pathname.includes("/recovery") ||
    pathname.includes("/congrats") ||
    pathname.includes("/onboarding") ||
    pathname.includes("/splash") ||
    pathname.includes("/(admin)") ||
    pathname.includes("/(organizer)") ||
    pathname.includes("/messages") ||
    pathname.includes("/ai-chat") ||
    pathname.includes("/forum");

  return (
    <NotificationProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          <Slot />
        </View>

        {!isHiddenRoute && (
          <View style={[styles.bottomNavWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <BottomNav />
          </View>
        )}
      </View>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2FFFB",
  },
  content: {
    flex: 1,
  },
  bottomNavWrapper: {
    paddingHorizontal: 14,
    paddingTop: 14,
    backgroundColor: "#F2FFFB",
  },
});
