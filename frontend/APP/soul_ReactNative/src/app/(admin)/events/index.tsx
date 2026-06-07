import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { styles } from "@/styles/admin-events.styles";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";
import { getComputedEventStatus, getFillRate } from "@/utils/eventRegistration";

const statusMeta = {
  upcoming: { label: "Upcoming", bg: "#FEF3C7", color: "#D97706" },
  ongoing: { label: "Ongoing", bg: "#D1FAE5", color: "#059669" },
  completed: { label: "Completed", bg: "#E5E7EB", color: "#4B5563" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", color: "#DC2626" },
};

export default function AdminEventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAdminService.getEvents();

      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEvent = ({ item }: { item: any }) => {
    const computedStatus = getComputedEventStatus(item);
    const status = statusMeta[computedStatus] || statusMeta.upcoming;
    const registeredCount = item.registeredCount || 0;
    const fillRate = getFillRate(item.capacity, registeredCount);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/(admin)/events/${item._id}`)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.eventInfoRow}>
          <MaterialCommunityIcons name="calendar-clock" size={16} color="#6B7280" />
          <Text style={styles.eventInfoText}>{formatDate(item.startDateTime)}</Text>
        </View>

        <View style={styles.eventInfoRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
          <Text style={styles.eventInfoText}>{item.location || "Chưa xác định"}</Text>
        </View>

        <View style={styles.eventStatsGrid}>
          <View style={styles.eventStatBox}>
            <Text style={styles.eventStatValue}>{registeredCount}</Text>
            <Text style={styles.eventStatLabel}>Đăng ký</Text>
          </View>
          <View style={styles.eventStatBox}>
            <Text style={styles.eventStatValue}>{item.capacity || "Open"}</Text>
            <Text style={styles.eventStatLabel}>Sức chứa</Text>
          </View>
          <View style={styles.eventStatBox}>
            <Text style={styles.eventStatValue}>{fillRate}%</Text>
            <Text style={styles.eventStatLabel}>Fill Rate</Text>
          </View>
        </View>

        {item.capacity ? (
          <View style={styles.eventProgressBlock}>
            <View style={styles.eventProgressHeader}>
              <Text style={styles.eventProgressText}>
                {registeredCount} / {item.capacity} người đăng ký
              </Text>
              <Text style={styles.eventProgressPercent}>{fillRate}%</Text>
            </View>
            <View style={styles.eventProgressTrack}>
              <View style={[styles.eventProgressFill, { width: `${fillRate}%` }]} />
            </View>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Sự kiện</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(admin)/events/create")}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshing={loading}
            onRefresh={fetchEvents}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="calendar-blank" size={60} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>Chưa có sự kiện nào</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
