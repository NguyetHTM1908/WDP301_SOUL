import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { colors } from "@/constants/colors";

export default function AdminProfile() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);

  // Profile states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // Banner message states
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  
  // Password visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync fields with current user store
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatarUrl || "");
      setBio(user.bio || "");
    }
  }, [user]);

  // Handle Profile save
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      setProfileErrorMsg("Họ tên không được để trống.");
      setProfileSuccessMsg("");
      return;
    }

    setSavingProfile(true);
    setProfileSuccessMsg("");
    setProfileErrorMsg("");
    try {
      const result = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      if (result.success) {
        setProfileSuccessMsg("Thông tin cá nhân đã được cập nhật thành công.");
        setProfileErrorMsg("");
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => setProfileSuccessMsg(""), 5000);
      } else {
        setProfileErrorMsg(result.message || "Cập nhật thất bại.");
        setProfileSuccessMsg("");
      }
    } catch (error: any) {
      setProfileErrorMsg(error.message || "Đã xảy ra lỗi.");
      setProfileSuccessMsg("");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErrorMsg("Vui lòng nhập đầy đủ tất cả các trường mật khẩu.");
      setPasswordSuccessMsg("");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setPasswordSuccessMsg("");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordErrorMsg("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
      setPasswordSuccessMsg("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("Mật khẩu xác nhận không khớp.");
      setPasswordSuccessMsg("");
      return;
    }

    setSavingPassword(true);
    setPasswordSuccessMsg("");
    setPasswordErrorMsg("");
    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        setPasswordSuccessMsg("Đổi mật khẩu thành công!");
        setPasswordErrorMsg("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => setPasswordSuccessMsg(""), 5000);
      } else {
        setPasswordErrorMsg(result.message || "Đổi mật khẩu thất bại.");
        setPasswordSuccessMsg("");
      }
    } catch (error: any) {
      setPasswordErrorMsg(error.message || "Đã xảy ra lỗi.");
      setPasswordSuccessMsg("");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(admin)")}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ Quản trị</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Admin Info Banner */}
          <View style={styles.profileBanner}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: avatarUrl || user?.avatarUrl || "https://i.pravatar.cc/150?img=47",
                }}
                style={styles.avatarLarge}
              />
              <View style={styles.badgeContainer}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.adminNameText}>{user?.fullName || "Quản trị viên"}</Text>
            <Text style={styles.adminRoleText}>Tài khoản: {user?.email || "admin@soul.com"}</Text>
          </View>

          {/* Navigation Tab buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "info" && styles.activeTabButton]}
              onPress={() => setActiveTab("info")}
            >
              <MaterialCommunityIcons
                name="account-edit-outline"
                size={20}
                color={activeTab === "info" ? "#FFFFFF" : colors.dark}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
                Thông tin cá nhân
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "security" && styles.activeTabButton]}
              onPress={() => setActiveTab("security")}
            >
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={20}
                color={activeTab === "security" ? "#FFFFFF" : colors.dark}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, activeTab === "security" && styles.activeTabText]}>
                Bảo mật & Mật khẩu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Render Tab Content */}
          {activeTab === "info" ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionHeading}>Cập nhật thông tin</Text>

              {/* Success Banner */}
              {profileSuccessMsg ? (
                <View style={styles.successBanner}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#0D9488" />
                  <Text style={styles.successBannerText}>{profileSuccessMsg}</Text>
                </View>
              ) : null}

              {/* Error Banner */}
              {profileErrorMsg ? (
                <View style={styles.errorBanner}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{profileErrorMsg}</Text>
                </View>
              ) : null}
              
              {/* Full Name */}
              <Text style={styles.inputLabel}>Họ và Tên *</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor="#94A3B8"
                  editable={!savingProfile}
                />
              </View>

              {/* Phone */}
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="phone-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại liên hệ"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  editable={!savingProfile}
                />
              </View>

              {/* Avatar Url */}
              <Text style={styles.inputLabel}>Đường dẫn ảnh đại diện (Avatar URL)</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="link-variant" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="Nhập link ảnh (http://...)"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  editable={!savingProfile}
                />
              </View>

              {/* Bio */}
              <Text style={styles.inputLabel}>Mô tả bản thân (Bio)</Text>
              <View style={[styles.inputWrapper, { height: 80, alignItems: "flex-start", paddingTop: 8 }]}>
                <MaterialCommunityIcons name="pencil-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { height: "100%", textAlignVertical: "top" }]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Viết đôi dòng giới thiệu ngắn..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  editable={!savingProfile}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, savingProfile && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.sectionHeading}>Thay đổi mật khẩu</Text>

              {/* Success Banner */}
              {passwordSuccessMsg ? (
                <View style={styles.successBanner}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#0D9488" />
                  <Text style={styles.successBannerText}>{passwordSuccessMsg}</Text>
                </View>
              ) : null}

              {/* Error Banner */}
              {passwordErrorMsg ? (
                <View style={styles.errorBanner}>
                  <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
                  <Text style={styles.errorBannerText}>{passwordErrorMsg}</Text>
                </View>
              ) : null}

              {/* Current Password */}
              <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showCurrentPass}
                  editable={!savingPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPass(!showCurrentPass)}>
                  <MaterialCommunityIcons
                    name={showCurrentPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-plus-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNewPass}
                  editable={!savingPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                  <MaterialCommunityIcons
                    name={showNewPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPass}
                  editable={!savingPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                  <MaterialCommunityIcons
                    name={showConfirmPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Save Password Button */}
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: "#EF4444" }, savingPassword && styles.disabledButton]}
                onPress={handleSavePassword}
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="key-change" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Đổi Mật Khẩu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2F2ED",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  profileBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2F2ED",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.softMint,
    backgroundColor: colors.softMint,
  },
  badgeContainer: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  adminNameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    fontFamily: "Georgia",
    marginBottom: 4,
  },
  adminRoleText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2F2ED",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  activeTabButton: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.dark,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2F2ED",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    paddingVertical: 8,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: "#94A3B8",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: "#065F46",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
});
