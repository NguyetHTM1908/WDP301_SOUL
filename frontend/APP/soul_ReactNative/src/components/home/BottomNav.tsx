import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";

export function BottomNav() {
  const user = useAuthStore((state: any) => state.user);

  const profileRoute = user?._id || user?.id ? `/profile/${user._id || user.id}` : "/profile/me";

  const navItems = [
    { icon: "home", label: "Home", route: "/" },
    { icon: "chart-line", label: "Track", route: null },
    { icon: "plus", label: "", route: "/forum" },
    { icon: "account-group-outline", label: "Community", route: "/forum" },
    { icon: "account-outline", label: "Profile", route: profileRoute },
  ];

  const handlePress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.footer}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={index === 2 ? styles.footerPlus : styles.footerItem}
          onPress={() => handlePress(item.route)}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={index === 2 ? 38 : 28}
            color={index === 2 ? "#FFFFFF" : "#40657D"}
          />
          {!!item.label && <Text style={styles.footerText}>{item.label}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}