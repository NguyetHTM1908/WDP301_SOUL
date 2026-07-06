import React from "react";
import { View, Text, Image, StyleProp, ViewStyle, ImageStyle } from "react-native";

interface AvatarFallbackProps {
  uri?: string;
  name?: string;
  size: number;
  style?: StyleProp<any>;
}

export function AvatarFallback({ uri, name, size, style }: AvatarFallbackProps) {
  // Nếu có avatar thực tế (không phải link rỗng và không phải link placeholder pravatar)
  const hasAvatar = uri && uri.trim() !== "" && !uri.includes("pravatar.cc");

  if (hasAvatar) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  // Lấy chữ cái đầu tiên của tên (nếu tên nhiều chữ, lấy chữ cái đầu của từ cuối cùng cho thân thiện, ví dụ "Nguyen Van A" -> lấy "A")
  const getInitials = (fullName?: string) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(" ");
    const lastWord = parts[parts.length - 1];
    return lastWord.charAt(0).toUpperCase();
  };

  const initials = getInitials(name);

  // Sinh màu nền ngẫu nhiên nhưng nhất quán theo tên
  const colors = ["#006B5C", "#0F766E", "#0284C7", "#7C3AED", "#B45309", "#DC2626", "#059669"];
  const charCodeSum = name ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const bgColor = colors[charCodeSum % colors.length];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#FFFFFF", fontSize: size * 0.45, fontWeight: "bold" }}>
        {initials}
      </Text>
    </View>
  );
}
