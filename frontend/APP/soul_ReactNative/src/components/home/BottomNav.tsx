import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useAuthStore } from "@/store";

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state: any) => state.user);

  const profileRoute = user?._id || user?.id ? `/profile/${user._id || user.id}` : "/profile/me";

  const userRole = String(user?.role || "").trim().toLowerCase();
  const homeRoute =
    userRole === "admin" || userRole === "administrator"
      ? "/(admin)"
      : userRole === "event_organizer" || userRole === "organizer" || userRole === "event-organizer"
      ? "/(organizer)"
      : "/(tabs)";

  const navItems = [
    { icon: "home", label: "Trang chủ", route: homeRoute },
    { icon: "notebook-outline", label: "Nhật ký", route: "/diary" },
    { icon: "plus", label: "", route: "/(tabs)/forum" },
    { icon: "account-group-outline", label: "Cộng đồng", route: "/(tabs)/forum" },
    { icon: "account-outline", label: "Cá nhân", route: profileRoute },
  ];

  const handlePress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
  };

  const isItemActive = (itemRoute: string | null, index: number) => {
    if (!itemRoute) return false;
    if (
      index === 0 &&
      (pathname === "/" ||
        pathname === "/(tabs)" ||
        pathname === "/(tabs)/index" ||
        pathname.includes("/(admin)") ||
        pathname.includes("/(organizer)"))
    )
      return true;
    if (index === 1 && pathname.includes("/diary")) return true;
    if (index === 3 && pathname.includes("/forum")) return true;
    if (index === 4 && pathname.includes("/profile")) return true;
    return pathname === itemRoute;
  };

  return (
    <View style={navStyles.footer}>
      {navItems.map((item, index) => {
        const active = isItemActive(item.route, index);
        return (
          <TouchableOpacity
            key={index}
            style={index === 2 ? navStyles.footerPlus : navStyles.footerItem}
            onPress={() => handlePress(item.route)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={index === 2 ? 32 : 24}
              color={index === 2 ? "#FFFFFF" : active ? "#006B5C" : "#70869E"}
            />
            {!!item.label && (
              <Text style={[navStyles.footerText, active && navStyles.footerTextActive]}>
                {item.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const navStyles = StyleSheet.create({
  footer: {
    height: 66,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#E6F4F1",
    paddingHorizontal: 6,
  },
  footerItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  footerText: {
    marginTop: 2,
    color: "#70869E",
    fontWeight: "600",
    fontSize: 11,
  },
  footerTextActive: {
    color: "#006B5C",
    fontWeight: "900",
  },
  footerPlus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#006B5C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    elevation: 8,
    shadowColor: "#006B5C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});