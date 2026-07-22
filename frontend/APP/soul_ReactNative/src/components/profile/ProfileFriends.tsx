import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles as s } from "@/styles/profile.styles";
import { AvatarFallback } from "./AvatarFallback";

interface ProfileFriendsProps {
  userProfile: any;
  friends: any[];
  recommendations: any[];
  pendingRequests: any[];
  isMyProfile: boolean;
  onAcceptRequest: (requesterId: string) => Promise<void>;
  onDeclineRequest: (requesterId: string) => Promise<void>;
  onRecommendationAction: (rec: any, action: "add" | "cancel" | "accept") => Promise<void>;
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
}: ProfileFriendsProps) {
  // Gợi ý lời nhắn cảm xúc
  const moodMessage = useMemo(() => {
    const mood = userProfile?.moodReputation || "neutral";
    if (mood === "negative") {
      return {
        text: "Hệ thống gợi ý những người có năng lượng tích cực (Positive) để kết nối, chia sẻ khó khăn và lắng nghe nâng đỡ tinh thần bạn. 💚",
        bgColor: "#E6FFFA",
        textColor: "#006B5C",
        icon: "heart-flash"
      };
    } else if (mood === "positive") {
      return {
        text: "Bạn đang tràn ngập năng lượng tích cực! Hệ thống gợi ý những người bạn đang gặp áp lực (Negative) để bạn lan tỏa sự ấm áp và giúp đỡ họ. 🌻",
        bgColor: "#FFFDF5",
        textColor: "#B45309",
        icon: "sprout"
      };
    } else {
      return {
        text: "Gợi ý những người bạn đáng yêu để bạn mở rộng kết nối và đồng hành trên hành trình tự chữa lành. 🌱",
        bgColor: "#F0F9FF",
        textColor: "#0284C7",
        icon: "leaf"
      };
    }
  }, [userProfile?.moodReputation]);

  return (
    <View>
      {/* Lời mời kết bạn đang chờ (incoming pending requests) */}
      {isMyProfile && pendingRequests.length > 0 && (
        <View style={[s.card, { marginBottom: 16 }]}>
          <Text style={s.friendsSectionTitle}>Lời mời kết bạn ({pendingRequests.length})</Text>
          <View style={s.recommendationsContainer}>
            {pendingRequests.map((req) => (
              <View key={req._id} style={[s.recCard, { paddingVertical: 10 }]}>
                <TouchableOpacity onPress={() => router.push(`/profile/${req.requester?._id || req.requester}` as any)}>
                  <AvatarFallback
                    uri={req.requester?.avatarUrl}
                    name={req.requester?.fullName || "Người dùng SOUL"}
                    size={50}
                    style={s.recAvatar}
                  />
                </TouchableOpacity>
                <View style={s.recInfo}>
                  <TouchableOpacity onPress={() => router.push(`/profile/${req.requester?._id || req.requester}` as any)}>
                    <Text style={s.recName}>{req.requester?.fullName || "Người dùng SOUL"}</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 11, color: "#718096", marginTop: 2 }} numberOfLines={1}>
                    {req.requester?.bio || "Muốn kết nối với bạn! 🌱"}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                  {/* Chấp nhận kết bạn */}
                  <TouchableOpacity
                    style={{ backgroundColor: "#006B5C", height: 32, paddingHorizontal: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" }}
                    onPress={() => onAcceptRequest(req.requester?._id || req.requester)}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "bold" }}>Xác nhận</Text>
                  </TouchableOpacity>

                  {/* Từ chối kết bạn */}
                  <TouchableOpacity
                    style={{ backgroundColor: "#EDF2F7", height: 32, paddingHorizontal: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" }}
                    onPress={() => onDeclineRequest(req.requester?._id || req.requester)}
                  >
                    <Text style={{ color: "#4A5568", fontSize: 11, fontWeight: "bold" }}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Danh sách bạn bè */}
      <View style={s.card}>
        <Text style={s.friendsSectionTitle}>Danh sách bạn bè ({friends.length})</Text>
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
            <Text style={{ color: "#A0AEC0", fontSize: 13, width: "100%", textAlign: "center" }}>
              Chưa kết nối với người bạn nào.
            </Text>
          )}
        </View>
      </View>

      {/* Gợi ý kết bạn dựa trên cảm xúc - Chỉ hiển thị ở trang cá nhân của chính mình */}
      {isMyProfile && (
        <View style={s.card}>
          <Text style={s.friendsSectionTitle}>Gợi ý kết nối phù hợp</Text>
          
          <View style={[s.recBanner, { backgroundColor: moodMessage.bgColor }]}>
            <MaterialCommunityIcons name={moodMessage.icon as any} size={24} color={moodMessage.textColor} />
            <Text style={[s.recBannerText, { color: moodMessage.textColor }]}>
              {moodMessage.text}
            </Text>
          </View>

          {/* Recommendations list */}
          <View style={s.recommendationsContainer}>
            {recommendations.map((rec) => {
              // Màu badge theo điểm matchScore
              const scoreColor =
                rec.matchScore >= 60 ? "#0F766E" :
                rec.matchScore >= 40 ? "#B45309" : "#64748B";
              const scoreBg =
                rec.matchScore >= 60 ? "#D8F8EC" :
                rec.matchScore >= 40 ? "#FEF9C3" : "#F1F5F9";

              return (
                <View key={rec._id} style={s.recCard}>
                  <TouchableOpacity onPress={() => router.push(`/profile/${rec._id}` as any)}>
                    <AvatarFallback
                      uri={rec.avatarUrl}
                      name={rec.fullName || "Người dùng SOUL"}
                      size={50}
                      style={s.recAvatar}
                    />
                  </TouchableOpacity>
                  <View style={s.recInfo}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <TouchableOpacity onPress={() => router.push(`/profile/${rec._id}` as any)}>
                        <Text style={s.recName}>{rec.fullName}</Text>
                      </TouchableOpacity>
                      {/* Match Score badge */}
                      {rec.matchScore !== undefined && (
                        <View style={{ backgroundColor: scoreBg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: "800", color: scoreColor }}>
                            ⭐ {rec.matchScore}đ
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ fontSize: 12, color: "#718096" }} numberOfLines={1}>
                      {rec.bio || "Rất vui được làm quen!"}
                    </Text>



                    {/* Shared tags */}
                    {rec.sharedTags && rec.sharedTags.length > 0 && (
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                        {rec.sharedTags.map((tag: string) => (
                          <View key={tag} style={{ backgroundColor: "#E0F7EF", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, color: "#006B5C", fontWeight: "700" }}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      s.addButton,
                      rec.friendshipStatus === "pending_sent" && { backgroundColor: "#EDF2F7" },
                      rec.friendshipStatus === "pending_received" && { backgroundColor: "#E6FFFA" }
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
          </View>
        </View>
      )}
    </View>
  );
}

