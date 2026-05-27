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
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { authStyles as styles } from "@/styles/auth.styles";
import { colors } from "@/constants/colors";

export default function VerificationScreen() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const email = useAuthStore((state) => state.forgotEmail);
  const verifyOtpAction = useAuthStore((state) => state.verifyOtp);
  const requestOtpAction = useAuthStore((state) => state.requestOtp);

  // Tạo các Ref cho các ô nhập để tự động dịch chuyển con trỏ chuột (focus)
  const inputRef1 = useRef<TextInput>(null);
  const inputRef2 = useRef<TextInput>(null);
  const inputRef3 = useRef<TextInput>(null);
  const inputRef4 = useRef<TextInput>(null);

  const refs = [inputRef1, inputRef2, inputRef3, inputRef4];

  // Xử lý thay đổi ký tự trong từng ô nhập
  const handleChangeText = (text: string, index: number) => {
    // Chỉ lấy ký tự số
    const cleanText = text.replace(/[^0-9]/g, "");
    const newCode = [...code];
    newCode[index] = cleanText;
    setCode(newCode);

    // Nếu đã nhập số và chưa phải ô cuối cùng, tự động di chuyển sang ô tiếp theo
    if (cleanText && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  // Xử lý khi nhấn nút xóa (BackSpace) trên bàn phím
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      // Tự động quay về ô trước đó nếu ô hiện tại trống
      refs[index - 1].current?.focus();
    }
  };

  // Xác thực mã OTP khi nhấn nút "Verify"
  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 4) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ mã xác thực 4 chữ số.");
      return;
    }

    setLoading(true);
    const result = await verifyOtpAction(fullCode);
    setLoading(false);

    if (result.success) {
      // Chuyển sang màn hình Nhập mật khẩu mới
      router.push("/(auth)/recovery");
    } else {
      Alert.alert("Lỗi xác minh", result.message);
    }
  };

  // Gửi lại mã OTP
  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    const result = await requestOtpAction(email);
    setLoading(false);
    if (result.success) {
      Alert.alert("Gửi lại mã", `Mã xác thực mới (MOCK): ${result.code}`);
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
        {/* Tiêu đề thanh Header */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Verification</Text>
        </View>

        {/* Biểu tượng khiên bảo vệ ở trung tâm */}
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

        {/* Card chứa form xác nhận OTP */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Verify your email</Text>
          <Text style={styles.subText}>
            Please enter 4 verification codes that we have send to your email address:{"\n"}
            <Text style={{ fontWeight: "bold", color: colors.dark }}>{email || "email của bạn"}</Text>
          </Text>

          {/* Hàng chứa 4 ô nhập OTP */}
          <View style={styles.otpRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={refs[index]}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Gửi lại mã */}
          <View style={styles.centerLinkContainer}>
            <Text style={styles.forgotText}>{"Don't receive code?"}</Text>
            <TouchableOpacity onPress={handleResend} style={{ marginTop: 6 }}>
              <Text style={[styles.forgotText, styles.linkText]}>Resend code</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          {/* Nút kiểm tra mã */}
          <TouchableOpacity style={styles.buttonLarge} onPress={handleVerify} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonLargeText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
