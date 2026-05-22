import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { styles } from "@/styles/home.styles";

type Props = {
  showSidebar: boolean;
  onToggleSidebar: () => void;
};

export function HomeHeader({ showSidebar, onToggleSidebar }: Props) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.menuButton, showSidebar && styles.menuButtonActive]}
        onPress={onToggleSidebar}
      >
        <MaterialCommunityIcons
          name={showSidebar ? "close" : "menu"}
          size={36}
          color="#006B5C"
        />
      </TouchableOpacity>

      <View style={styles.greetingBox}>
        <Text style={styles.headerTitle}>Hi, Vy 👋</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back to your safe space
        </Text>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.bellWrap}>
          <MaterialCommunityIcons
            name="bell-outline"
            size={32}
            color="#005F56"
          />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </View>

        <Pressable
          style={styles.profileWrapper}
          onHoverIn={() => setShowProfileMenu(true)}
          onHoverOut={() => setShowProfileMenu(false)}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={styles.avatar}
          />

          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <View style={styles.profileTop}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/150?img=47" }}
                  style={styles.profileImg}
                />

                <View>
                  <Text style={styles.profileName}>Vy Nguyễn</Text>
                  <Text style={styles.profileSub}>
                    Take care of your mind 🌱
                  </Text>
                </View>
              </View>

              {[
                ["account-outline", "My Profile"],
                ["pencil-outline", "Edit Profile"],
                ["trophy-outline", "Achievements"],
                ["bell-outline", "Reminders"],
                ["logout", "Log out"],
              ].map(([icon, text], index) => (
                <TouchableOpacity
                  key={text}
                  style={[
                    styles.profileAction,
                    index === 4 && styles.profileLogout,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={22}
                    color={index === 4 ? "#FF6B6B" : "#214B5B"}
                  />

                  <Text style={styles.profileActionText}>{text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}