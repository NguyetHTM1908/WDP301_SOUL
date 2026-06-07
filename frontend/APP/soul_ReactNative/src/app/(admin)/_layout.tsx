import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="events/index" />
      <Stack.Screen name="events/create" />
      <Stack.Screen name="events/[id]" />
      <Stack.Screen name="events/edit/[id]" />
      <Stack.Screen name="events/registrations/[id]" />
    </Stack>
  );
}
