import { MaterialCommunityIcons } from "@expo/vector-icons";
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

type Props = {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showProfileMenu: boolean;
  onToggleProfileMenu: () => void;
  onCloseProfileMenu: () => void;
};

export function HomeHeader({
  showSidebar,
  onToggleSidebar,
  showProfileMenu,
  onToggleProfileMenu,
  onCloseProfileMenu,
}: Props) {
  const { user } = useAuthStore();

  // Lấy tên gọi thân mật (từ đầu tiên của họ tên, mặc định là Vy)
  const greetingName = user ? user.fullName.split(" ")[0] : "Vy";

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

        {/* Bấm Avatar để toggle menu (menu render ở tầng root) */}
        <Pressable
          style={styles.profileWrapper}
          onPress={onToggleProfileMenu}
        >
          <Image
            source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/150?img=47" }}
            style={styles.avatar}
          />
        </Pressable>
      </View>
    </View>
  );
}

// Component dropdown menu — được render ở tầng root để không bị clip
type ProfileMenuProps = {
  onClose: () => void;
  onEditProfile: () => void;
};

export function ProfileDropdown({ onClose, onEditProfile }: ProfileMenuProps) {
  const { user, logout } = useAuthStore();

  const handleActionPress = (text: string) => {
    onClose();
    if (text === "Log out") {
      logout();
      router.replace("/(auth)/login");
    } else if (text === "My Profile") {
      router.push(`/profile/${user?._id || "me"}` as any);
    } else if (text === "Edit Profile") {
      // Mở modal Edit Profile — render ở tầng root (index.tsx)
      onEditProfile();
    }
  };

  return (
    <>
      {/* Lớp nền trong suốt để bấm ngoài đóng menu */}
      <Pressable style={styles.profileOverlay} onPress={onClose} />

      <View style={styles.profileMenuFloating}>
        <TouchableOpacity
          style={styles.profileTop}
          onPress={() => {
            onClose();
            router.push(`/profile/${user?._id || "me"}` as any);
          }}
        >
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
        </TouchableOpacity>

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
    </>
  );
}