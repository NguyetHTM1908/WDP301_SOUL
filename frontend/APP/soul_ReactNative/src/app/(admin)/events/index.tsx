import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { styles } from "@/styles/admin-events.styles";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";

export default function AdminEventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // In real app, fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAdminService.getEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch(error: any) {
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

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'upcoming': return styles.statusUpcoming;
      case 'ongoing': return styles.statusOngoing;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusUpcoming;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'upcoming': return 'Sắp diễn ra';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã kết thúc';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

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

  const renderEvent = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      activeOpacity={0.7}
      onPress={() => router.push(`/(admin)/events/${item._id}`)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(item.status).backgroundColor }]}>
          <Text style={[styles.statusText, { color: getStatusStyle(item.status).color }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.eventInfoRow}>
        <MaterialCommunityIcons name="calendar-clock" size={16} color="#6B7280" />
        <Text style={styles.eventInfoText}>{formatDate(item.startDateTime)}</Text>
      </View>
      
      <View style={styles.eventInfoRow}>
        <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7280" />
        <Text style={styles.eventInfoText}>{item.location || 'Chưa xác định'}</Text>
      </View>

      <View style={styles.eventInfoRow}>
        <MaterialCommunityIcons name="account-group-outline" size={16} color="#6B7280" />
        <Text style={styles.eventInfoText}>
          Đã đăng ký: {item.registeredCount} {item.capacity ? `/ ${item.capacity}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Sự kiện</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(admin)/events/create')}
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
