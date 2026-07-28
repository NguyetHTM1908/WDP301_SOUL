import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="forum" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />

      <Stack.Screen name="events/index" />
      <Stack.Screen name="events/[id]" />
    </Stack>
  );
}