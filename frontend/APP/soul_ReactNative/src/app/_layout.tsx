import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot, usePathname } from "expo-router";
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { BottomNav } from "@/components/home/BottomNav";

export default function RootLayout() {
  const pathname = usePathname();

  // Xác định các màn hình KHÔNG hiển thị BottomNav (Auth, Admin, Event Organizer)
  const isHiddenRoute =
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
    pathname.includes("/(organizer)");

  return (
    <NotificationProvider>
      <View style={styles.container}>
        <View style={styles.content}>
          <Slot />
        </View>

        {!isHiddenRoute && (
          <View style={styles.bottomNavWrapper}>
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
    position: "relative",
  },
  content: {
    flex: 1,
  },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 99999,
  },
});
