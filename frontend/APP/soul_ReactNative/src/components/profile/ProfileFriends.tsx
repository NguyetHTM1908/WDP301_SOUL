import React, { useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles as s } from "@/styles/profile.styles";
import { AvatarFallback } from "./AvatarFallback";
import { useAuthStore } from "@/store";
import { searchUsers, friendshipAction } from "@/api/userApi";

interface ProfileFriendsProps {
  userProfile: any;
  friends: any[];
  recommendations: any[];
  pendingRequests: any[];
  isMyProfile: boolean;
  onAcceptRequest: (requesterId: string) => Promise<void>;
  onDeclineRequest: (requesterId: string) => Promise<void>;
  onRecommendationAction: (rec: any, action: "add" | "cancel" | "accept") => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

export function ProfileFriends({
  userProfile,
  friends,
  recommendations,
  pendingRequests,
  isMyProfile,
  onAcceptRequest,
  onDeclineRequest,
  onRecommendationAction,
  onRefreshData,
}: ProfileFriendsProps) {
  const token = useAuthStore((state: any) => state.token);

  // ── Search state & Pagination ───────────────────────────────────
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [visibleRecCount, setVisibleRecCount] = useState(5);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!text.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await searchUsers(token, text.trim());
          setSearchResults(res?.data || []);
        } catch {
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 400);
    },
    [token]
  );

  const handleSearchFriendshipAction = async (user: any) => {
    if (!token) return;
    let action: "add" | "cancel" | "accept" = "add";
    if (user.friendshipStatus === "pending_sent") action = "cancel";
    else if (user.friendshipStatus === "pending_received") action = "accept";

    try {
      await friendshipAction(token, user._id, action);
      // Cập nhật local status trong searchResults
      setSearchResults((prev) =>
        prev.map((u) => {
          if (u._id !== user._id) return u;
          const nextStatus =
            action === "add"
              ? "pending_sent"
              : action === "cancel"
              ? "none"
              : "friends";
          return { ...u, friendshipStatus: nextStatus };
        })
      );
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (e: any) {
      console.warn("Search friendship action error:", e);
    }
  };

  // Phân loại kết quả search
  const friendResults = useMemo(
    () => searchResults.filter((u) => u.friendshipStatus === "friends"),
    [searchResults]
  );
  const otherResults = useMemo(
    () => searchResults.filter((u) => u.friendshipStatus !== "friends"),
    [searchResults]
  );

  // Gợi ý lời nhắn cảm xúc
  const moodMessage = useMemo(() => {
    const mood = userProfile?.moodReputation || "neutral";
    if (mood === "negative") {
      return {
        text: "Hệ thống gợi ý những người có năng lượng tích cực (Positive) để kết nối, chia sẻ khó khăn và lắng nghe nâng đỡ tinh thần bạn. 💚",
        bgColor: "#E6FFFA",
        textColor: "#006B5C",
        icon: "heart-flash",
      };
    } else if (mood === "positive") {
      return {
        text: "Bạn đang tràn ngập năng lượng tích cực! Hệ thống gợi ý những người bạn đang gặp áp lực (Negative) để bạn lan tỏa sự ấm áp và giúp đỡ họ. 🌻",
        bgColor: "#FFFDF5",
        textColor: "#B45309",
        icon: "sprout",
      };
    } else {
      return {
        text: "Gợi ý những người bạn đáng yêu để bạn mở rộng kết nối và đồng hành trên hành trình tự chữa lành. 🌱",
        bgColor: "#F0F9FF",
        textColor: "#0284C7",
        icon: "leaf",
      };
    }
  }, [userProfile?.moodReputation]);

  // ── Render add button cho search results ────────────────────────
  const renderSearchActionBtn = (user: any) => {
    const st = user.friendshipStatus;
    if (st === "friends") {
      return (
        <View style={ss.friendBadge}>
          <Text style={ss.friendBadgeText}>Bạn bè</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[
          s.addButton,
          st === "pending_sent" && { backgroundColor: "#EDF2F7" },
          st === "pending_received" && { backgroundColor: "#E6FFFA" },
        ]}
        onPress={() => handleSearchFriendshipAction(user)}
      >
        <MaterialCommunityIcons
          name={
            st === "pending_sent"
              ? "account-clock"
              : st === "pending_received"
              ? "account-check"
              : "account-plus"
          }
          size={20}
          color={st === "pending_sent" ? "#4A5568" : "#006B5C"}
        />
      </TouchableOpacity>
    );
  };

  const isSearchActive = query.trim().length > 0;

  return (
    <View>
      {/* ── SEARCH BAR (Chỉ hiển thị trên trang cá nhân của chính mình) ── */}
      {isMyProfile && (
        <View style={ss.searchWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="#94A3B8"
            style={ss.searchIcon}
          />
          <TextInput
            style={ss.searchInput}
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setSearchResults([]);
              }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── KẾT QUẢ TÌM KIẾM ── */}
      {isSearchActive && (
        <View style={[s.card, { marginBottom: 16 }]}>
          <Text style={s.friendsSectionTitle}>
            Kết quả tìm kiếm "{query}"
          </Text>

          {searching ? (
            <ActivityIndicator color="#006B5C" style={{ marginVertical: 16 }} />
          ) : searchResults.length === 0 ? (
            <Text style={ss.emptyText}>Không tìm thấy người dùng nào.</Text>
          ) : (
            <>
              {/* Bạn bè trong kết quả */}
              {friendResults.length > 0 && (
                <>
                  <Text style={ss.sectionLabel}>Bạn bè</Text>
                  {friendResults.map((user) => (
                    <View key={user._id} style={s.recCard}>
                      <TouchableOpacity
                        onPress={() => router.push(`/profile/${user._id}` as any)}
                      >
                        <AvatarFallback
                          uri={user.avatarUrl}
                          name={user.fullName || "Người dùng SOUL"}
                          size={46}
                          style={s.recAvatar}
                        />
                      </TouchableOpacity>
                      <View style={s.recInfo}>
                        <TouchableOpacity
                          onPress={() => router.push(`/profile/${user._id}` as any)}
                        >
                          <Text style={s.recName}>{user.fullName}</Text>
                        </TouchableOpacity>
                        <Text style={ss.bioText} numberOfLines={1}>
                          {user.bio || "Thành viên SOUL 🌱"}
                        </Text>
                      </View>
                      {renderSearchActionBtn(user)}
                    </View>
                  ))}
                </>
              )}

              {/* Người dùng khác trong kết quả */}
              {otherResults.length > 0 && (
                <>
                  <Text style={[ss.sectionLabel, { marginTop: friendResults.length > 0 ? 12 : 0 }]}>
                    Người dùng khác
                  </Text>
                  {otherResults.map((user) => (
                    <View key={user._id} style={s.recCard}>
                      <TouchableOpacity
                        onPress={() => router.push(`/profile/${user._id}` as any)}
                      >
                        <AvatarFallback
                          uri={user.avatarUrl}
                          name={user.fullName || "Người dùng SOUL"}
                          size={46}
                          style={s.recAvatar}
                        />
                      </TouchableOpacity>
                      <View style={s.recInfo}>
                        <TouchableOpacity
                          onPress={() => router.push(`/profile/${user._id}` as any)}
                        >
                          <Text style={s.recName}>{user.fullName}</Text>
                        </TouchableOpacity>
                        <Text style={ss.bioText} numberOfLines={1}>
                          {user.bio || "Thành viên SOUL 🌱"}
                        </Text>
                      </View>
                      {renderSearchActionBtn(user)}
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      )}

      {/* ── CHỈ HIỂN THỊ DANH SÁCH & GỢI Ý KHI KHÔNG SEARCH ── */}
      {!isSearchActive && (
        <>
          {/* Lời mời kết bạn đang chờ (incoming pending requests) */}
          {isMyProfile && pendingRequests.length > 0 && (
            <View style={[s.card, { marginBottom: 16 }]}>
              <Text style={s.friendsSectionTitle}>
                Lời mời kết bạn ({pendingRequests.length})
              </Text>
              <View style={s.recommendationsContainer}>
                {pendingRequests.map((req) => (
                  <View key={req._id} style={[s.recCard, { paddingVertical: 10 }]}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          `/profile/${req.requester?._id || req.requester}` as any
                        )
                      }
                    >
                      <AvatarFallback
                        uri={req.requester?.avatarUrl}
                        name={req.requester?.fullName || "Người dùng SOUL"}
                        size={50}
                        style={s.recAvatar}
                      />
                    </TouchableOpacity>
                    <View style={s.recInfo}>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/profile/${req.requester?._id || req.requester}` as any
                          )
                        }
                      >
                        <Text style={s.recName}>
                          {req.requester?.fullName || "Người dùng SOUL"}
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={{ fontSize: 11, color: "#718096", marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {req.requester?.bio || "Muốn kết nối với bạn! 🌱"}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#006B5C",
                          height: 32,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() =>
                          onAcceptRequest(req.requester?._id || req.requester)
                        }
                      >
                        <Text
                          style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}
                        >
                          Xác nhận
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          backgroundColor: "#EDF2F7",
                          height: 32,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() =>
                          onDeclineRequest(req.requester?._id || req.requester)
                        }
                      >
                        <Text
                          style={{ color: "#4A5568", fontSize: 11, fontWeight: "bold" }}
                        >
                          Xóa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Danh sách bạn bè */}
          <View style={s.card}>
            <Text style={s.friendsSectionTitle}>
              Danh sách bạn bè ({friends.length})
            </Text>
            <View style={s.friendsGrid}>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <TouchableOpacity
                    key={friend._id}
                    style={s.friendCard}
                    onPress={() => router.push(`/profile/${friend._id}` as any)}
                  >
                    <AvatarFallback
                      uri={friend.avatarUrl}
                      name={friend.fullName || "Người dùng SOUL"}
                      size={60}
                      style={s.friendAvatar}
                    />
                    <Text style={s.friendName} numberOfLines={1}>
                      {friend.fullName}
                    </Text>
                    <Text style={s.friendBio} numberOfLines={1}>
                      {friend.bio || "Thành viên SOUL 🌱"}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={{
                    color: "#A0AEC0",
                    fontSize: 13,
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Chưa kết nối với người bạn nào.
                </Text>
              )}
            </View>
          </View>

          {/* Gợi ý kết bạn dựa trên cảm xúc & Khám phá người dùng (Chỉ hiển thị ở trang cá nhân của chính mình) */}
          {isMyProfile && (
            <View style={s.card}>
              <Text style={s.friendsSectionTitle}>Gợi ý kết nối phù hợp</Text>

              <View style={[s.recBanner, { backgroundColor: moodMessage.bgColor }]}>
                <MaterialCommunityIcons
                  name={moodMessage.icon as any}
                  size={24}
                  color={moodMessage.textColor}
                />
                <Text style={[s.recBannerText, { color: moodMessage.textColor }]}>
                  {moodMessage.text}
                </Text>
              </View>

              {/* Recommendations list */}
              <View style={s.recommendationsContainer}>
                {recommendations.length > 0 ? (
                  <>
                    {recommendations.slice(0, visibleRecCount).map((rec) => {
                      const scoreColor =
                        rec.matchScore >= 60
                          ? "#0F766E"
                          : rec.matchScore >= 40
                          ? "#B45309"
                          : "#64748B";
                      const scoreBg =
                        rec.matchScore >= 60
                          ? "#D8F8EC"
                          : rec.matchScore >= 40
                          ? "#FEF9C3"
                          : "#F1F5F9";

                      return (
                        <View key={rec._id} style={s.recCard}>
                          <TouchableOpacity
                            onPress={() => router.push(`/profile/${rec._id}` as any)}
                          >
                            <AvatarFallback
                              uri={rec.avatarUrl}
                              name={rec.fullName || "Người dùng SOUL"}
                              size={50}
                              style={s.recAvatar}
                            />
                          </TouchableOpacity>
                          <View style={s.recInfo}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <TouchableOpacity
                                onPress={() =>
                                  router.push(`/profile/${rec._id}` as any)
                                }
                              >
                                <Text style={s.recName}>{rec.fullName}</Text>
                              </TouchableOpacity>
                              {rec.matchScore !== undefined && (
                                <View
                                  style={{
                                    backgroundColor: scoreBg,
                                    borderRadius: 10,
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "800",
                                      color: scoreColor,
                                    }}
                                  >
                                    ⭐ {rec.matchScore}đ
                                  </Text>
                                </View>
                              )}
                            </View>

                            <Text
                              style={{ fontSize: 12, color: "#718096" }}
                              numberOfLines={1}
                            >
                              {rec.bio || "Rất vui được làm quen!"}
                            </Text>

                            {rec.sharedTags && rec.sharedTags.length > 0 && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  gap: 4,
                                  marginTop: 4,
                                }}
                              >
                                {rec.sharedTags.map((tag: string) => (
                                  <View
                                    key={tag}
                                    style={{
                                      backgroundColor: "#E0F7EF",
                                      borderRadius: 8,
                                      paddingHorizontal: 6,
                                      paddingVertical: 2,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 10,
                                        color: "#006B5C",
                                        fontWeight: "700",
                                      }}
                                    >
                                      #{tag}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>

                          <TouchableOpacity
                            style={[
                              s.addButton,
                              rec.friendshipStatus === "pending_sent" && {
                                backgroundColor: "#EDF2F7",
                              },
                              rec.friendshipStatus === "pending_received" && {
                                backgroundColor: "#E6FFFA",
                              },
                            ]}
                            onPress={() => {
                              let action: "add" | "cancel" | "accept" = "add";
                              if (rec.friendshipStatus === "pending_sent") {
                                action = "cancel";
                              } else if (rec.friendshipStatus === "pending_received") {
                                action = "accept";
                              }
                              onRecommendationAction(rec, action);
                            }}
                          >
                            <MaterialCommunityIcons
                              name={
                                rec.friendshipStatus === "pending_sent"
                                  ? "account-clock"
                                  : rec.friendshipStatus === "pending_received"
                                  ? "account-check"
                                  : "account-plus"
                              }
                              size={20}
                              color={
                                rec.friendshipStatus === "pending_sent"
                                  ? "#4A5568"
                                  : "#006B5C"
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    {visibleRecCount < recommendations.length && (
                      <TouchableOpacity
                        style={ss.loadMoreBtn}
                        onPress={() => setVisibleRecCount((prev) => prev + 10)}
                      >
                        <Text style={ss.loadMoreText}>&lt;&lt; Xem thêm &gt;&gt;</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text
                    style={{
                      color: "#A0AEC0",
                      fontSize: 13,
                      width: "100%",
                      textAlign: "center",
                      paddingVertical: 16,
                    }}
                  >
                    Chưa có người dùng gợi ý khác.
                  </Text>
                )}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    padding: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  bioText: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#A0AEC0",
    textAlign: "center",
    paddingVertical: 16,
  },
  friendBadge: {
    backgroundColor: "#E6FFFA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  friendBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#006B5C",
  },
  loadMoreBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6FFFA",
    borderWidth: 1.5,
    borderColor: "#006B5C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 8,
    alignSelf: "center",
    width: "100%",
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#006B5C",
    letterSpacing: 0.5,
  },
});
