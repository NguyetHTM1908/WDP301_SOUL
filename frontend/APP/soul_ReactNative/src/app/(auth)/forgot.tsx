import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtpAction = useAuthStore((state) => state.requestOtp);

  // Xử lý gửi yêu cầu quên mật khẩu lên backend
  const handleSend = async () => {
    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setLoading(true);
    const result = await requestOtpAction(email);
    setLoading(false);

    if (result.success) {
      router.push({
        pathname: "/(auth)/verify",
        params: { email, type: "reset-password" },
      });
    } else {
      Alert.alert("Lỗi", result.message);
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
        {/* Header chứa tiêu đề màn hình */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Forgot Password</Text>
        </View>

        {/* Khu vực ảnh minh họa */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../../assets/images/onboarding1.png")}
            style={styles.illustration}
          />
        </View>

        {/* Card nhập Email */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Find your account</Text>
          <Text style={styles.subText}>
            Please enter your email address to recover your forgotten password
          </Text>

          {/* Ô nhập Email */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="soul.user@gmail.com"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Thử cách khác */}
          <TouchableOpacity style={styles.centerLinkContainer}>
            <Text style={[styles.forgotText, styles.linkText]}>Try another way</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          {/* Nút gửi yêu cầu */}
          <TouchableOpacity style={styles.buttonLarge} onPress={handleSend} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonLargeText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
