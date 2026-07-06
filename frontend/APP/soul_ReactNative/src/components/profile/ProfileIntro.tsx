import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles as s } from "@/styles/profile.styles";

interface ProfileIntroProps {
  userProfile: any;
}

export function ProfileIntro({ userProfile }: ProfileIntroProps) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Thông tin cá nhân</Text>
      
      <View style={s.infoItem}>
        <MaterialCommunityIcons name="account-details-outline" size={24} color="#006B5C" />
        <Text style={s.infoText}>Họ và tên: {userProfile?.fullName}</Text>
      </View>

      <View style={s.infoItem}>
        <MaterialCommunityIcons name="email-outline" size={24} color="#006B5C" />
        <Text style={s.infoText}>Email: {userProfile?.email}</Text>
      </View>

      {userProfile?.phone && (
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="phone-outline" size={24} color="#006B5C" />
          <Text style={s.infoText}>Số điện thoại: {userProfile.phone}</Text>
        </View>
      )}

      <View style={s.infoItem}>
        <MaterialCommunityIcons name="gender-male-female" size={24} color="#006B5C" />
        <Text style={s.infoText}>
          Giới tính: {userProfile?.gender === "male" ? "Nam" : userProfile?.gender === "female" ? "Nữ" : "Khác"}
        </Text>
      </View>

      <View style={s.infoItem}>
        <MaterialCommunityIcons name="calendar-range" size={24} color="#006B5C" />
        <Text style={s.infoText}>
          Ngày tham gia: {userProfile?.createdAt ? new Date(userProfile?.createdAt).toLocaleDateString("vi-VN") : ""}
        </Text>
      </View>
    </View>
  );
}
