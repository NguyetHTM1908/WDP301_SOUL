import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/home.styles";

const navItems = [
  ["home", "Home"],
  ["chart-line", "Track"],
  ["plus", ""],
  ["account-group-outline", "Community"],
  ["account-outline", "Profile"],
];

export function BottomNav() {
  return (
    <View style={styles.footer}>
      {navItems.map(([icon, label], index) => (
        <TouchableOpacity
          key={index}
          style={index === 2 ? styles.footerPlus : styles.footerItem}
        >
          <MaterialCommunityIcons
            name={icon as any}
            size={index === 2 ? 38 : 28}
            color={index === 2 ? "#FFFFFF" : "#40657D"}
          />
          {!!label && <Text style={styles.footerText}>{label}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}