import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { profileStyles as s } from "@/styles/profile.styles";

interface ProfilePhotosProps {
  userPosts: any[];
}

export function ProfilePhotos({ userPosts }: ProfilePhotosProps) {
  const userPhotos = useMemo(() => {
    const photos: string[] = [];
    userPosts.forEach((post) => {
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        post.mediaUrls.forEach((media: any) => {
          if (media.type === "image" && media.url) {
            photos.push(media.url);
          }
        });
      }
    });
    return photos;
  }, [userPosts]);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Bộ sưu tập ảnh</Text>
      <View style={s.photoGrid}>
        {userPhotos.length > 0 ? (
          userPhotos.map((url, index) => (
            <TouchableOpacity
              key={index}
              style={s.photoWrapper}
              onPress={() => Alert.alert("Xem ảnh", "Link ảnh: " + url)}
            >
              <Image source={{ uri: url }} style={s.gridImage} resizeMode="cover" />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={s.emptyPhotosText}>Chưa có ảnh nào được đăng tải.</Text>
        )}
      </View>
    </View>
  );
}
