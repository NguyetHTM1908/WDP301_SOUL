import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "@/styles/home.styles";
import { useAuthStore } from "@/store";
import { eventOwnerService } from "@/services/eventApi";

type OwnerEventItem = {
  _id?: string;
  id?: string;
  title?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  registeredCount?: number;
  capacity?: number | null;
};

function normalizeRole(role?: string) {
  return String(role || "").trim().toLowerCase();
}

function isAdminRole(role?: string) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "administrator";
}

function isEventOrganizerRole(role?: string) {
  const normalizedRole = normalizeRole(role);

  return (
    normalizedRole === "event_organizer" ||
    normalizedRole === "event-organizer" ||
    normalizedRole === "eventorganizer" ||
    normalizedRole === "organizer"
  );
}

function getEventsFromResponse(response: any): OwnerEventItem[] {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.events)) return response.data.events;
  if (Array.isArray(response?.events)) return response.events;
  return [];
}

export function EventCard() {
  const user = useAuthStore((state: any) => state.user);

  const isAdmin = isAdminRole(user?.role);
  const isEventOrganizer = isEventOrganizerRole(user?.role);

  const [ownerEvents, setOwnerEvents] = useState<OwnerEventItem[]>([]);
  const [loadingOwnerEvents, setLoadingOwnerEvents] = useState(false);

  useEffect(() => {
    if (!isEventOrganizer) return;

    let mounted = true;

    const fetchOwnerEvents = async () => {
      setLoadingOwnerEvents(true);

      try {
        const response = await eventOwnerService.getMyEvents();
        const events = getEventsFromResponse(response);

        if (mounted) {
          setOwnerEvents(events);
        }
      } catch {
        if (mounted) {
          setOwnerEvents([]);
        }
      } finally {
        if (mounted) {
          setLoadingOwnerEvents(false);
        }
      }
    };

    fetchOwnerEvents();

    return () => {
      mounted = false;
    };
  }, [isEventOrganizer]);

  const organizerStats = useMemo(() => {
    const totalEvents = ownerEvents.length;

    const pendingEvents = ownerEvents.filter(
      (event) => event.approvalStatus === "pending"
    ).length;

    const approvedEvents = ownerEvents.filter(
      (event) => event.approvalStatus === "approved"
    ).length;

    const rejectedEvents = ownerEvents.filter(
      (event) => event.approvalStatus === "rejected"
    ).length;

    const totalRegistrations = ownerEvents.reduce((total, event) => {
      return total + (event.registeredCount || 0);
    }, 0);

    return {
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      totalRegistrations,
    };
  }, [ownerEvents]);

  const openEvents = () => {
    if (isAdmin) {
      router.push("/(admin)/events" as any);
      return;
    }

    if (isEventOrganizer) {
      router.push("/(organizer)/events" as any);
      return;
    }

    router.push("/user-events" as any);
  };

  if (isAdmin) {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Quản lý sự kiện</Text>

          <TouchableOpacity onPress={openEvents}>
            <Text style={styles.panelLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.communityWrap}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>Duyệt sự kiện từ organizer</Text>

            <Text style={styles.eventMeta}>
              Xem tất cả event, duyệt hoặc từ chối
            </Text>

            <Text style={styles.eventMeta}>
              Admin không xem danh sách người đăng ký
            </Text>

            <TouchableOpacity style={styles.joinButton} onPress={openEvents}>
              <Text style={styles.joinText}>Vào quản lý event</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventImage}>
            <MaterialCommunityIcons
              name="shield-check"
              size={92}
              color="#E58A1F"
            />
          </View>
        </View>
      </View>
    );
  }

  if (isEventOrganizer) {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Event của tôi</Text>

          <TouchableOpacity onPress={openEvents}>
            <Text style={styles.panelLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.communityWrap}>
          <View style={{ flex: 1 }}>
            {loadingOwnerEvents ? (
              <>
                <ActivityIndicator size="small" color="#00866B" />
                <Text style={styles.eventMeta}>Đang tải event của bạn...</Text>
              </>
            ) : (
              <>
                <Text style={styles.eventTitle}>
                  Bạn đã tạo {organizerStats.totalEvents} event
                </Text>

                <Text style={styles.eventMeta}>
                  Tổng người đăng ký: {organizerStats.totalRegistrations}
                </Text>

                <Text style={styles.eventMeta}>
                  Chờ duyệt: {organizerStats.pendingEvents} · Đã duyệt:{" "}
                  {organizerStats.approvedEvents} · Từ chối:{" "}
                  {organizerStats.rejectedEvents}
                </Text>
              </>
            )}

            <TouchableOpacity style={styles.joinButton} onPress={openEvents}>
              <Text style={styles.joinText}>Xem event của tôi</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventImage}>
            <MaterialCommunityIcons
              name="calendar-star"
              size={92}
              color="#E58A1F"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Sự kiện sắp diễn ra</Text>

        <TouchableOpacity onPress={openEvents}>
          <Text style={styles.panelLink}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.communityWrap}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventTitle}>
            Workshop Chánh niệm & Thiền định
          </Text>

          <Text style={styles.eventMeta}>
            Xem lịch sự kiện mới nhất của SOUL
          </Text>

          <Text style={styles.eventMeta}>
            Hoạt động trực tuyến và tại trường
          </Text>

          <TouchableOpacity style={styles.joinButton} onPress={openEvents}>
            <Text style={styles.joinText}>Khám phá sự kiện</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.eventImage}>
          <MaterialCommunityIcons
            name="meditation"
            size={92}
            color="#E58A1F"
          />
        </View>
      </View>
    </View>
  );
}