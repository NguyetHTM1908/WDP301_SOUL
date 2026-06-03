import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { colors } from "@/constants/colors";
import { eventAdminService } from "@/services/eventApi";
import { styles } from "@/styles/admin-events.styles";

type RegistrationStatus = "registered" | "cancelled";

type Registration = {
  userId:
    | {
        _id: string;
        fullName?: string;
        email?: string;
        phone?: string;
        avatarUrl?: string | null;
      }
    | string;
  status: RegistrationStatus;
  registeredAt?: string;
  cancelledAt?: string | null;
};

type RegistrationSummary = {
  registered: number;
  cancelled: number;
  capacity: number | null;
  remainingSlots: number | null;
};

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Registered", value: "registered" },
  { label: "Cancelled", value: "cancelled" },
];

const statusMeta = {
  registered: {
    label: "Registered",
    color: colors.darkTeal,
    bg: "#D9FBEF",
    icon: "account-check",
  },
  cancelled: {
    label: "Cancelled",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: "account-cancel",
  },
};

export default function AdminEventRegistrations() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [event, setEvent] = useState<any>(null);
  const [summary, setSummary] = useState<RegistrationSummary>({
    registered: 0,
    cancelled: 0,
    capacity: null,
    remainingSlots: null,
  });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchRegistrations = useCallback(
    async (nextFilter = filter, isRefresh = false) => {
      if (!id) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await eventAdminService.getEventRegistrations(id, {
          status: nextFilter,
          page: 1,
          limit: 100,
        });

        if (response.success) {
          setEvent(response.data.event);
          setSummary(response.data.summary);
          setRegistrations(response.data.registrations || []);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Unable to load event registrations");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, id]
  );

  useFocusEffect(
    useCallback(() => {
      fetchRegistrations(filter);
    }, [fetchRegistrations, filter])
  );

  const getUser = (item: Registration) => {
    return typeof item.userId === "string"
      ? { _id: item.userId, fullName: "Unknown participant", email: item.userId }
      : item.userId;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Not available";
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFilterPress = (nextFilter: string) => {
    setFilter(nextFilter);
    fetchRegistrations(nextFilter);
  };

  const confirmRemove = (registration: Registration) => {
    const user = getUser(registration);
    if (!user._id || removingUserId) return;

    const remove = async () => {
      setRemovingUserId(user._id);
      try {
        await eventAdminService.removeEventRegistration(id, user._id);
        await fetchRegistrations(filter, true);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Unable to remove registration");
      } finally {
        setRemovingUserId(null);
      }
    };

    const message = "Are you sure you want to remove this registration from the event?";

    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        remove();
      }
      return;
    }

    Alert.alert("Remove Registration", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: remove },
    ]);
  };

  const renderRegistration = ({ item }: { item: Registration }) => {
    const user = getUser(item);
    const meta = statusMeta[item.status];
    const isRemoving = removingUserId === user._id;

    return (
      <View style={styles.registrationCard}>
        <View style={styles.registrationTop}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.registrationUser}>
            <Text style={styles.registrationName} numberOfLines={1}>
              {user.fullName || "SOUL Participant"}
            </Text>
            <Text style={styles.registrationEmail} numberOfLines={1}>
              {user.email || "No email"}
            </Text>
            <Text style={styles.registrationPhone} numberOfLines={1}>
              {user.phone || "No phone number"}
            </Text>
          </View>
          <View style={[styles.registrationBadge, { backgroundColor: meta.bg }]}>
            <MaterialCommunityIcons name={meta.icon as any} size={14} color={meta.color} />
            <Text style={[styles.registrationBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        <View style={styles.registrationInfoBlock}>
          <Text style={styles.registrationInfoLabel}>Registered At:</Text>
          <Text style={styles.registrationInfoValue}>{formatDate(item.registeredAt)}</Text>
        </View>

        <View style={styles.registrationInfoBlock}>
          <Text style={styles.registrationInfoLabel}>Status:</Text>
          <Text style={[styles.registrationInfoValue, { color: meta.color }]}>
            {meta.label}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.removeRegistrationButton, isRemoving && { opacity: 0.65 }]}
          disabled={isRemoving}
          onPress={() => confirmRemove(item)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#B91C1C" />
          <Text style={styles.removeRegistrationText}>
            {isRemoving ? "Removing..." : "Remove Registration"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Registrations</Text>
        <TouchableOpacity onPress={() => fetchRegistrations(filter, true)}>
          <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={registrations}
          renderItem={renderRegistration}
          keyExtractor={(item) => getUser(item)._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.registrationListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRegistrations(filter, true)}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={() => (
            <>
              <View style={styles.registrationHero}>
                <View style={styles.registrationHeroText}>
                  <Text style={styles.registrationHeroTitle} numberOfLines={2}>
                    {event?.title || "Event"}
                  </Text>
                  <Text style={styles.registrationHeroSub}>
                    Monitor real event registrations and remove invalid entries when needed.
                  </Text>
                </View>
                <View style={styles.registrationHeroIcon}>
                  <MaterialCommunityIcons name="clipboard-account" size={32} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.registrationStatsGrid}>
                <View style={styles.registrationStatCard}>
                  <Text style={styles.registrationStatValue}>{summary.registered}</Text>
                  <Text style={styles.registrationStatLabel}>Registered</Text>
                </View>
                <View style={styles.registrationStatCard}>
                  <Text style={styles.registrationStatValue}>{summary.cancelled}</Text>
                  <Text style={styles.registrationStatLabel}>Cancelled</Text>
                </View>
                <View style={styles.registrationStatCard}>
                  <Text style={styles.registrationStatValue}>{summary.capacity ?? "∞"}</Text>
                  <Text style={styles.registrationStatLabel}>Capacity</Text>
                </View>
                <View style={styles.registrationStatCard}>
                  <Text style={styles.registrationStatValue}>{summary.remainingSlots ?? "∞"}</Text>
                  <Text style={styles.registrationStatLabel}>Remaining Slots</Text>
                </View>
              </View>

              <View style={styles.registrationFilters}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.registrationFilterButton,
                      filter === option.value && styles.registrationFilterActive,
                    ]}
                    onPress={() => handleFilterPress(option.value)}
                  >
                    <Text
                      style={[
                        styles.registrationFilterText,
                        filter === option.value && styles.registrationFilterTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search" size={56} color="#B6CCC4" />
              <Text style={styles.emptyStateText}>No registrations found</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
