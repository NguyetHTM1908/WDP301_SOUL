import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { styles } from "@/styles/home.styles";
import { ProfileModals } from "./ProfileModals";

type Props = {
  showSidebar: boolean;
  onToggleSidebar: () => void;
};

export function HomeHeader({ showSidebar, onToggleSidebar }: Props) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuthStore();

  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const greetingName = user ? user.fullName.split(" ")[0] : "Vy";

  const handleActionPress = (action: string) => {
    if (action === "logout") {
      logout();
      router.replace("/(auth)/login");
    } else if (action === "my_profile") {
      setShowMyProfile(true);
    } else if (action === "edit_profile") {
      setShowEditProfile(true);
    }

    setShowProfileMenu(false);
  };

  const profileActions = [
    {
      icon: "account-outline",
      action: "my_profile",
      label: "Hồ sơ của tôi",
    },
    {
      icon: "pencil-outline",
      action: "edit_profile",
      label: "Chỉnh sửa hồ sơ",
    },
    {
      icon: "trophy-outline",
      action: "achievements",
      label: "Thành tích",
    },
    {
      icon: "bell-outline",
      action: "reminders",
      label: "Lời nhắc",
    },
    {
      icon: "logout",
      action: "logout",
      label: "Đăng xuất",
    },
  ];

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
        <Text style={styles.headerTitle}>Chào, {greetingName} 👋</Text>
        <Text style={styles.headerSubtitle}>
          Chào mừng bạn trở lại không gian an toàn của mình
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

        {/* Bấm Avatar để hiển thị menu hồ sơ */}
        <Pressable
          style={styles.profileWrapper}
          onPress={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Image
            source={{
              uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=47",
            }}
            style={styles.avatar}
          />

          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <View style={styles.profileTop}>
                <Image
                  source={{
                    uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=47",
                  }}
                  style={styles.profileImg}
                />

                <View>
                  <Text style={styles.profileName}>
                    {user?.fullName || "Vy Nguyễn"}
                  </Text>
                  <Text style={styles.profileSub}>
                    {user?.bio || "Chăm sóc tâm trí của bạn 🌱"}
                  </Text>
                </View>
              </View>

              {profileActions.map((item, index) => (
                <TouchableOpacity
                  key={item.action}
                  onPress={() => handleActionPress(item.action)}
                  style={[
                    styles.profileAction,
                    item.action === "logout" && styles.profileLogout,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={item.action === "logout" ? "#FF6B6B" : "#214B5B"}
                  />

                  <Text style={styles.profileActionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Pressable>
      </View>

      <ProfileModals
        showMyProfile={showMyProfile}
        onCloseMyProfile={() => setShowMyProfile(false)}
        showEditProfile={showEditProfile}
        onCloseEditProfile={() => setShowEditProfile(false)}
        onOpenEditProfile={() => setShowEditProfile(true)}
      />
    </View>
  );
}