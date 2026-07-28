import { useState, useRef } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/store";
import { authStyles as styles } from "@/styles/auth.styles";
import { colors } from "@/constants/colors";

export default function VerificationScreen() {
  const params = useLocalSearchParams<{ email?: string; type?: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const storeEmail = useAuthStore((state) => state.forgotEmail);
  const verifyOtpAction = useAuthStore((state) => state.verifyOtp);
  const verifyRegisterOtpAction = useAuthStore((state) => state.verifyRegisterOtp);
  const resendOtpAction = useAuthStore((state) => state.resendOtp);

  // Email ưu tiên từ params, nếu không có lấy từ store
  const email = params.email || storeEmail || "";
  const flowType = (params.type === "register" ? "register" : "reset-password") as "register" | "reset-password";

  // Tạo Ref cho 6 ô nhập OTP
  const inputRef1 = useRef<TextInput>(null);
  const inputRef2 = useRef<TextInput>(null);
  const inputRef3 = useRef<TextInput>(null);
  const inputRef4 = useRef<TextInput>(null);
  const inputRef5 = useRef<TextInput>(null);
  const inputRef6 = useRef<TextInput>(null);

  const refs = [inputRef1, inputRef2, inputRef3, inputRef4, inputRef5, inputRef6];

  // Xử lý khi nhập OTP
  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    if (cleanText && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  // Xử lý nút Xóa (Backspace)
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  // Xác thực mã OTP
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ mã OTP 6 chữ số.");
      return;
    }

    setLoading(true);

    if (flowType === "register") {
      const result = await verifyRegisterOtpAction(email, fullCode);
      setLoading(false);
      if (result.success) {
        // Tự động chuyển hướng vào Trang chủ (Tránh Alert.alert bị treo callback trên Web)
        if (Platform.OS === "web") {
          router.replace("/(tabs)");
        } else {
          Alert.alert("Thành công", "Tài khoản của bạn đã được xác thực!", [
            { text: "Bắt đầu trải nghiệm", onPress: () => router.replace("/(tabs)") },
          ]);
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("Lỗi xác minh", result.message);
      }
    } else {
      const result = await verifyOtpAction(email, fullCode);
      setLoading(false);
      if (result.success) {
        router.push({
          pathname: "/(auth)/recovery",
          params: { email, code: fullCode },
        });
      } else {
        Alert.alert("Lỗi xác minh", result.message);
      }
    }
  };

  // Gửi lại mã OTP
  const handleResend = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Không tìm thấy địa chỉ email.");
      return;
    }
    setLoading(true);
    const result = await resendOtpAction(email, flowType);
    setLoading(false);
    if (result.success) {
      Alert.alert("Gửi lại OTP", result.message || "Mã OTP mới đã được gửi tới email của bạn.");
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
        {/* Header Title */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Xác thực OTP</Text>
        </View>

        {/* Shield Icon */}
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
            <MaterialCommunityIcons name="shield-check-outline" size={72} color="#0F766E" />
          </View>
        </View>

        {/* Card chứa form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {flowType === "register" ? "Xác thực email đăng ký" : "Quên mật khẩu"}
          </Text>
          <Text style={styles.subText}>
            Vui lòng nhập mã OTP 6 số đã được gửi tới email:{"\n"}
            <Text style={{ fontWeight: "bold", color: colors.dark }}>{email || "email của bạn"}</Text>
          </Text>

          {/* Hàng chứa 6 ô nhập OTP */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 20 }}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={refs[index]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 44,
                  height: 52,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: digit ? "#0F766E" : "#CBD5E1",
                  backgroundColor: digit ? "#F0FDF4" : "#F8FAFC",
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#0F766E",
                }}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Gửi lại mã */}
          <View style={styles.centerLinkContainer}>
            <Text style={styles.forgotText}>Chưa nhận được mã OTP?</Text>
            <TouchableOpacity onPress={handleResend} style={{ marginTop: 6 }}>
              <Text style={[styles.forgotText, styles.linkText]}>Gửi lại mã OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          {/* Nút xác nhận */}
          <TouchableOpacity style={styles.buttonLarge} onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonLargeText}>Xác nhận OTP</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
