import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/constants/colors";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name="compass-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons
              name="account-group-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}