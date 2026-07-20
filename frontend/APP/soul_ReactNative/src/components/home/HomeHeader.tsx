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
import { AvatarFallback } from "../profile/AvatarFallback";
import { useState, useEffect, useRef } from "react";
import { getUnreadCount } from "@/api/messageApi";

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
  const { user, token } = useAuthStore();

  const greetingName = user ? user.fullName.split(" ")[0] : "Vy";

  // Polling unread message count
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!token) return;
      try {
        const res = await getUnreadCount(token);
        if (res?.success) {
          setUnreadMsgCount(res.count || 0);
        }
      } catch (e) {
        // silent
      }
    };

    fetchUnread();
    pollingRef.current = setInterval(fetchUnread, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token]);

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
        {/* Nút tin nhắn */}
        <TouchableOpacity
          style={styles.bellWrap}
          onPress={() => router.push("/messages/conversations" as any)}
        >
          <MaterialCommunityIcons
            name="message-text-outline"
            size={28}
            color="#005F56"
          />
          {unreadMsgCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadMsgCount > 99 ? "99+" : unreadMsgCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

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

        {/* Bấm Avatar để hiển thị menu hồ sơ (menu render ở tầng root) */}
        <Pressable
          style={styles.profileWrapper}
          onPress={onToggleProfileMenu}
        >
          <AvatarFallback
            uri={user?.avatarUrl}
            name={user?.fullName || "Người dùng SOUL"}
            size={40}
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
    if (text === "Đăng xuất") {
      logout();
      router.replace("/(auth)/login");
    } else if (text === "Hồ sơ của tôi") {
      router.push(`/profile/${user?._id || "me"}` as any);
    } else if (text === "Chỉnh sửa hồ sơ") {
      // Mở modal Edit Profile — render ở tầng root (index.tsx)
      onEditProfile();
    } else if (text === "Tin nhắn") {
      router.push("/messages/conversations" as any);
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
          <AvatarFallback
            uri={user?.avatarUrl}
            name={user?.fullName || "Người dùng SOUL"}
            size={50}
            style={styles.profileImg}
          />
          <View>
            <Text style={styles.profileName}>{user?.fullName || "Vy Nguyễn"}</Text>
            <Text style={styles.profileSub}>
              {user?.bio || "Chăm sóc tâm trí của bạn 🌱"}
            </Text>
          </View>
        </TouchableOpacity>

        {[
          ["account-outline", "Hồ sơ của tôi"],
          ["pencil-outline", "Chỉnh sửa hồ sơ"],
          ["message-text-outline", "Tin nhắn"],
          ["trophy-outline", "Thành tích"],
          ["bell-outline", "Lời nhắc"],
          ["logout", "Đăng xuất"],
        ].map(([icon, text], index) => (
          <TouchableOpacity
            key={text}
            onPress={() => handleActionPress(text)}
            style={[
              styles.profileAction,
              index === 5 && styles.profileLogout,
            ]}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={22}
              color={index === 5 ? "#FF6B6B" : "#214B5B"}
            />
            <Text style={styles.profileActionText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}