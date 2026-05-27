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

  // States quản lý hiển thị Modals xem và sửa thông tin cá nhân
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Lấy tên gọi thân mật (từ đầu tiên của họ tên, mặc định là Vy)
  const greetingName = user ? user.fullName.split(" ")[0] : "Vy";

  // Xử lý sự kiện từ menu Avatar
  const handleActionPress = (text: string) => {
    if (text === "Log out") {
      logout();
      router.replace("/(auth)/login");
    } else if (text === "My Profile") {
      setShowMyProfile(true);
    } else if (text === "Edit Profile") {
      setShowEditProfile(true);
    }
    setShowProfileMenu(false);
  };

  return (
    <View style={styles.header}>
      {/* Nút mở Sidebar trái */}
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

      {/* Lời chào mừng */}
      <View style={styles.greetingBox}>
        <Text style={styles.headerTitle}>Hi, {greetingName} 👋</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back to your safe space
        </Text>
      </View>

      {/* Thông báo & Avatar */}
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

        {/* Bấm Avatar hiển thị popover menu */}
        <Pressable
          style={styles.profileWrapper}
          onPress={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Image
            source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=47" }}
            style={styles.avatar}
          />

          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <View style={styles.profileTop}>
                <Image
                  source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=47" }}
                  style={styles.profileImg}
                />
                <View>
                  <Text style={styles.profileName}>{user?.fullName || "Vy Nguyễn"}</Text>
                  <Text style={styles.profileSub}>
                    {user?.bio || "Take care of your mind 🌱"}
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
                  onPress={() => handleActionPress(text)}
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

      {/* Nhúng các Modal Profile tách riêng */}
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