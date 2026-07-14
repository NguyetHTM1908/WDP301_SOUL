import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles as s } from "@/styles/profile.styles";

import { AvatarFallback } from "./AvatarFallback";

interface ProfileHeaderProps {
  userProfile: any;
  isMe: boolean;
  coverPhoto: string;
  friendsCount: number;
  friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" | "self" | "loading";
  onShowCoverPresetModal: () => void;
  onAvatarPress: () => void;
  onBioPress: () => void;
  onFriendshipAction: () => void;
}

export function ProfileHeader({
  userProfile,
  isMe,
  coverPhoto,
  friendsCount,
  friendshipStatus,
  onShowCoverPresetModal,
  onAvatarPress,
  onBioPress,
  onFriendshipAction,
}: ProfileHeaderProps) {
  return (
    <View style={s.headerSection}>
      <View style={s.coverContainer}>
        <Image source={{ uri: coverPhoto }} style={s.coverImage} resizeMode="cover" />
        
        {/* Back Button */}
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#006B5C" />
        </TouchableOpacity>

        {/* Change Cover Camera button */}
        {isMe && (
          <TouchableOpacity style={s.coverCamera} onPress={onShowCoverPresetModal}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Basic details */}
      <View style={s.profileInfoContainer}>
        <View style={s.avatarContainer}>
          <AvatarFallback
            uri={userProfile?.avatarUrl}
            name={userProfile?.fullName || "Người dùng SOUL"}
            size={120}
            style={s.avatarImage}
          />
          {isMe && (
            <TouchableOpacity
              style={s.avatarCamera}
              onPress={onAvatarPress}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.userName}>{userProfile?.fullName || "Người dùng SOUL"}</Text>
        
        {/* Bio section with editing ability */}
        <TouchableOpacity
          disabled={!isMe}
          onPress={onBioPress}
          style={{ paddingVertical: 4 }}
        >
          <Text style={s.userBio}>
            {userProfile?.bio || "Chưa có tiểu sử. Bấm vào đây để viết gì đó... 🌱"}
          </Text>
        </TouchableOpacity>

        {/* Stats section */}
        <View style={{ flexDirection: "row", alignItems: "center", width: "100%", marginTop: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#F0F5F4", paddingVertical: 12 }}>
          {isMe ? (
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
              <View style={s.statCol}>
                <Text style={s.statVal}>{friendsCount}</Text>
                <Text style={s.statLabel}>Bạn bè</Text>
              </View>
              <View style={s.statCol}>
                <Text style={[s.statVal, { color: userProfile?.moodReputation === "positive" ? "#2BC56D" : userProfile?.moodReputation === "negative" ? "#EF4444" : "#0284C7" }]}>
                  {userProfile?.moodReputation === "positive" ? "Tích cực" : userProfile?.moodReputation === "negative" ? "Cần chia sẻ" : "Cân bằng"}
                </Text>
                <Text style={s.statLabel}>Cảm xúc</Text>
              </View>
              <View style={s.statCol}>
                <Text style={s.statVal}>{userProfile?.moodReputationScore || 0}%</Text>
                <Text style={s.statLabel}>Chỉ số</Text>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              {/* Cột 1: Bạn bè */}
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={s.statCol}>
                  <Text style={s.statVal}>{friendsCount}</Text>
                  <Text style={s.statLabel}>Bạn bè</Text>
                </View>
              </View>
              
              {/* Cột 2: Nút hành động */}
              {friendshipStatus !== "self" && friendshipStatus !== "loading" && (
                <View style={{ flex: 1, alignItems: "center" }}>
                  <TouchableOpacity
                    style={[
                      s.friendActionMiniButton,
                      { marginLeft: 0, width: "85%", height: 38 },
                      friendshipStatus === "friends"
                        ? { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", borderWidth: 1 }
                        : friendshipStatus === "pending_sent"
                        ? { backgroundColor: "#EDF2F7", borderColor: "#CBD5E0", borderWidth: 1 }
                        : { backgroundColor: "#006B5C" }
                    ]}
                    onPress={onFriendshipAction}
                  >
                    <MaterialCommunityIcons
                      name={
                        friendshipStatus === "none"
                          ? "account-plus"
                          : friendshipStatus === "pending_sent"
                          ? "account-clock"
                          : friendshipStatus === "pending_received"
                          ? "account-check"
                          : "account-minus"
                      }
                      size={16}
                      color={
                        friendshipStatus === "friends"
                          ? "#DC2626"
                          : friendshipStatus === "pending_sent"
                          ? "#4A5568"
                          : "#FFFFFF"
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        s.friendActionMiniText,
                        {
                          color:
                            friendshipStatus === "friends"
                              ? "#DC2626"
                              : friendshipStatus === "pending_sent"
                              ? "#4A5568"
                              : "#FFFFFF",
                        },
                      ]}
                    >
                      {friendshipStatus === "none"
                        ? "Thêm bạn bè"
                        : friendshipStatus === "pending_sent"
                        ? "Chờ xác nhận"
                        : friendshipStatus === "pending_received"
                        ? "Xác nhận"
                        : "Hủy kết bạn"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
