import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { notifStyles as s } from "@/styles/notification.styles";
import { useAuthStore } from "@/store";
import { getNotifUnreadCount } from "@/api/notificationApi";

// ─── Context ────────────────────────────────────────────────────
type ToastNotif = {
  id: string;
  title: string;
  body: string;
  icon: string;
  iconColor: string;
  related?: { type: string; id: string };
};

type NotifContextType = {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  showToast: (notif: Omit<ToastNotif, "id">) => void;
};

const NotifContext = createContext<NotifContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  showToast: () => {},
});

export const useNotif = () => useContext(NotifContext);

// ─── Toast Card ──────────────────────────────────────────────────
function ToastCard({
  notif,
  onDismiss,
}: {
  notif: ToastNotif;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(onDismiss);
    }, 4000);

    return () => clearTimeout(timeout);
  }, []);

  const handlePress = () => {
    onDismiss();
    if (notif.related?.type && notif.related?.id) {
      switch (notif.related.type) {
        case "user":
          router.push(`/profile/${notif.related.id}` as any);
          break;
        case "post":
          router.push("/(tabs)/forum" as any);
          break;
        case "event":
          router.push("/(tabs)/events" as any);
          break;
      }
    }
  };

  return (
    <Animated.View style={[s.toastContainer, { transform: [{ translateY }], opacity }]}>
      <TouchableOpacity
        style={s.toastCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={s.toastIconWrap}>
          <MaterialCommunityIcons
            name={notif.icon as any}
            size={22}
            color={notif.iconColor}
          />
        </View>

        <View style={s.toastContent}>
          <Text style={s.toastTitle} numberOfLines={1}>
            {notif.title}
          </Text>
          <Text style={s.toastBody} numberOfLines={2}>
            {notif.body}
          </Text>
        </View>

        <TouchableOpacity style={s.toastClose} onPress={onDismiss}>
          <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Provider (bọc ở root layout) ────────────────────────────────
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((state: any) => state.token);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotif[]>([]);
  const prevCountRef = useRef(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((notif: Omit<ToastNotif, "id">) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-1), { ...notif, id }]); // max 2 toasts
  }, []);

  // Polling unread count mỗi 10 giây
  useEffect(() => {
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await getNotifUnreadCount(token);
        if (res?.success) {
          const newCount = res.count || 0;
          setUnreadCount(newCount);

          // Nếu có thông báo mới xuất hiện → hiện toast
          if (newCount > prevCountRef.current && prevCountRef.current > 0) {
            showToast({
              title: "Thông báo mới",
              body: `Bạn có ${newCount - prevCountRef.current} thông báo mới.`,
              icon: "bell-ring",
              iconColor: "#FFFFFF",
            });
          }
          prevCountRef.current = newCount;
        }
      } catch (e) {
        // silent
      }
    };

    fetchCount();
    pollingRef.current = setInterval(fetchCount, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token, showToast]);

  return (
    <NotifContext.Provider value={{ unreadCount, setUnreadCount, showToast }}>
      {children}
      {/* Render toasts */}
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          notif={toast}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </NotifContext.Provider>
  );
}
