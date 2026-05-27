import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { authStyles as styles } from "@/styles/auth.styles";

export default function RecoveryPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureNewText, setSecureNewText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [loading, setLoading] = useState(false);

  const resetPassAction = useAuthStore((state) => state.resetPass);

  // Xử lý lưu mật khẩu mới khi nhấn nút "Save"
  const handleSave = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp. Vui lòng nhập lại.");
      return;
    }

    setLoading(true);
    const result = await resetPassAction(newPassword);
    setLoading(false);

    if (result.success) {
      // Chuyển sang màn hình Chúc mừng sau khi đổi mật khẩu thành công
      router.push("/(auth)/congrats");
    } else {
      Alert.alert("Lỗi đặt lại mật khẩu", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="#0F766E" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Tiêu đề thanh Header */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Recovery Password</Text>
        </View>

        {/* Biểu tượng khóa bảo vệ */}
        <View style={styles.illustrationContainer}>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "#D9FBEF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="shield-lock-outline" size={72} color="#0F766E" />
          </View>
        </View>

        {/* Card chứa form điền mật khẩu mới */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Create new password</Text>
          <Text style={styles.subText}>
            Please enter your new strong password below to recover your forgotten account
          </Text>

          {/* Ô nhập mật khẩu mới */}
          <Text style={styles.forgotText}>New password</Text>
          <View style={[styles.inputGroup, { marginTop: 8 }]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={secureNewText}
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureNewText(!secureNewText)}>
              <MaterialCommunityIcons
                name={secureNewText ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#8193A5"
              />
            </TouchableOpacity>
          </View>

          {/* Ô xác nhận mật khẩu mới */}
          <Text style={styles.forgotText}>Confirm password</Text>
          <View style={[styles.inputGroup, { marginTop: 8 }]}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={secureConfirmText}
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
              <MaterialCommunityIcons
                name={secureConfirmText ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#8193A5"
              />
            </TouchableOpacity>
          </View>

          {/* Cụm từ Change Password text trang trí ở giữa giống thiết kế */}
          <View style={styles.centerLinkContainer}>
            <Text style={[styles.forgotText, { color: "#CBD5E0" }]}>Change password</Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Nút lưu */}
          <TouchableOpacity style={styles.buttonLarge} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonLargeText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
