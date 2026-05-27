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
  Modal,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "@/store";
import { authStyles as styles } from "@/styles/auth.styles";
import { WebView } from "react-native-webview";
import { API_BASE_URL } from "@/config/env";


export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  // States phục vụ WebView đăng nhập/đăng ký Google
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");

  const registerAction = useAuthStore((state) => state.register);
  const setSession = useAuthStore((state) => state.setSession);

  // Kích hoạt hiển thị WebView mở đường dẫn đăng nhập Google từ Backend
  const handleGoogleSignUp = () => {
    const authUrl = `${API_BASE_URL}/auth/google`;
    console.log("[Google SignUp WebView] Khởi động, load URL:", authUrl);
    setGoogleAuthUrl(authUrl);
    setShowGoogleAuth(true);
  };

  // Lắng nghe sự thay đổi URL bên trong WebView để hứng Token trả về
  const handleGoogleNavigation = async (navState: any) => {
    const urlStr = navState.url;
    console.log("[Google SignUp WebView] Lắng nghe chuyển hướng URL:", urlStr);

    const hasToken = urlStr.includes("token=");

    if (hasToken) {
      setShowGoogleAuth(false); // Đóng ngay Modal WebView

      try {
        // Tách token JWT và thông tin user JSON từ callback URL
        const tokenMatch = urlStr.match(/token=([^&]+)/);
        const userMatch = urlStr.match(/user=([^&]+)/);

        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          const userJsonEncoded = userMatch ? userMatch[1] : "";

          if (userJsonEncoded) {
            const userDecoded = decodeURIComponent(userJsonEncoded);
            const userObj = JSON.parse(userDecoded);

            // Lưu phiên đăng nhập vào Zustand Store toàn cục
            setSession(token, userObj);

            // Điều hướng thẳng vào trang chủ
            router.replace("/(tabs)");
          } else {
            Alert.alert("Lỗi đăng ký", "Không trích xuất được thông tin người dùng Google.");
          }
        } else {
          Alert.alert("Lỗi đăng ký", "Không trích xuất được Token xác thực từ Google.");
        }
      } catch (error: any) {
        console.error("[Google SignUp WebView Error]:", error);
        Alert.alert("Lỗi đăng ký", "Lỗi xử lý xác thực: " + error.message);
      }
    } else if (urlStr.includes("error=")) {
      setShowGoogleAuth(false);
      Alert.alert("Đăng nhập thất bại", "Quyền truy cập tài khoản Google bị từ chối hoặc lỗi.");
    }
  };



  // Xử lý tạo tài khoản mới khi nhấn nút "Create account"
  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Thông báo", "Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    setLoading(true);
    const result = await registerAction({
      fullName,
      email,
      password,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert("Thành công", "Đăng ký tài khoản thành công! Hãy đăng nhập lại.", [
        { text: "OK", onPress: () => router.push("/(auth)/login") },
      ]);
    } else {
      Alert.alert("Lỗi đăng ký", result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Nút quay lại màn Login */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F766E" />
        </TouchableOpacity>

        {/* Ảnh minh họa phía trên */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../../assets/images/onboarding1.png")}
            style={styles.illustration}
          />
        </View>

        {/* Thẻ chứa form đăng ký */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign Up</Text>

          {/* Ô nhập Họ tên / Username */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="yourusername"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Ô nhập Email */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="emailaddress@gmail.com"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Ô nhập Mật khẩu */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={secureText}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <MaterialCommunityIcons
                name={secureText ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#8193A5"
              />
            </TouchableOpacity>
          </View>

          {/* Nút Đăng ký tài khoản */}
          <TouchableOpacity style={styles.buttonLarge} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonLargeText}>Create account</Text>
            )}
          </TouchableOpacity>

          {/* Đường ngăn cách */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Nút Đăng nhập MXH (Chỉ giữ lại Google theo yêu cầu) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
              <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
            </TouchableOpacity>
          </View>

          {/* Chuyển về màn Đăng nhập */}
          <View style={styles.centerLinkContainer}>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.forgotText}>
                Already have an account? <Text style={styles.linkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal chứa WebView hiển thị Google Login thật */}
      {Platform.OS !== "web" && (
        <Modal
          visible={showGoogleAuth}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowGoogleAuth(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E2E8F0"
            }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#1E293B" }}>Đăng nhập bằng Google</Text>
              <TouchableOpacity onPress={() => setShowGoogleAuth(false)}>
                <Text style={{ fontSize: 16, color: "#EF4444", fontWeight: "700" }}>HỦY</Text>
              </TouchableOpacity>
            </View>
            {googleAuthUrl ? (
              <WebView
                source={{ uri: googleAuthUrl }}
                userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                onNavigationStateChange={handleGoogleNavigation}
                startInLoadingState={true}
                domStorageEnabled={true}
                javaScriptEnabled={true}
              />
            ) : null}
          </SafeAreaView>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}
