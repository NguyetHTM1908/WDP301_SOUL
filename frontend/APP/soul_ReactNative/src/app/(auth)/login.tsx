import { useState, useEffect } from "react";
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
import { API_BASE_URL } from "@/api/config";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = "174376142-i5mmq3ssn1n6n8h2k3bttlllh21ep2qo.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "174376142-cdasefrkjmif196msi88l0p4av2qpf68.apps.googleusercontent.com";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  // States inline validation
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  // States phục vụ WebView fallback
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");

  const loginAction = useAuthStore((state) => state.login);
  const setSession = useAuthStore((state) => state.setSession);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  // ── expo-auth-session Google ──────────────────────────────────
  // Khi dùng androidClientId, expo-auth-session tự tạo redirect URI đúng:
  // com.googleusercontent.apps.{androidClientId}:/oauth2redirect
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  // Log redirect URI để debug
  useEffect(() => {
    if (request) {
      console.log("[Google Auth] redirectUri đang dùng:", request.redirectUri);
      console.log("[Google Auth] clientId:", request.clientId);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      console.error("[Google Auth Error]:", response.error);
      Alert.alert("Lỗi đăng nhập Google", response.error?.message || "Đã có lỗi xảy ra");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    setGLoading(true);
    try {
      // Lấy thông tin user từ Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await userInfoRes.json();
      console.log("[Google Profile]:", profile);

      // Gửi lên backend để tạo/cập nhật tài khoản và nhận JWT
      const result = await loginWithGoogle(
        profile.email,
        profile.name,
        profile.sub,
        profile.picture,
        undefined // idToken không cần khi dùng accessToken flow
      );

      setGLoading(false);
      if (result.success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("Lỗi đăng nhập", result.message || "Đăng nhập Google thất bại.");
      }
    } catch (err: any) {
      setGLoading(false);
      console.error("[Google Token Error]:", err);
      Alert.alert("Lỗi", "Không lấy được thông tin Google: " + err.message);
    }
  };

  // ── Validate helpers ──────────────────────────────────────────
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("Vui lòng nhập email");
    } else if (!emailRegex.test(value)) {
      setEmailError("Email không hợp lệ (vd: example@gmail.com)");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Vui lòng nhập mật khẩu");
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setServerError("");
    validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setServerError("");
    validatePassword(value);
  };

  // ── Submit login ──────────────────────────────────────────────
  const handleLogin = async () => {
    validateEmail(email);
    validatePassword(password);

    if (!email.trim() || !emailRegex.test(email) || !password) {
      return;
    }

    setServerError("");
    setLoading(true);
    const result = await loginAction(email, password);
    setLoading(false);

    if (result.success) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser.role === "admin") {
        router.replace("/(admin)");
      } else {
        router.replace("/(tabs)");
      }
    } else {
      const isUnverified = result.message?.includes("xác thực email") || result.message?.includes("OTP");
      if (isUnverified) {
        Alert.alert(
          "Xác thực tài khoản",
          result.message || "Tài khoản chưa được xác thực email. Bạn có muốn nhập mã OTP ngay không?",
          [
            { text: "Để sau", style: "cancel" },
            {
              text: "Nhập mã OTP",
              onPress: () =>
                router.push({
                  pathname: "/(auth)/verify",
                  params: { email, type: "register" },
                }),
            },
          ]
        );
      } else {
        setServerError(result.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  };

  // ── Google Sign-In ────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      // On Web: use backend route which uses registered callback http://localhost:5000/api/auth/google/callback
      window.location.href = `${API_BASE_URL}/auth/google`;
      return;
    }
    // On Mobile: use expo-auth-session with native Android Client ID
    await promptAsync();
  };

  // ── WebView fallback nav handler ──────────────────────────────
  const handleGoogleNavigation = async (navState: any) => {
    const urlStr = navState.url;
    const hasToken = urlStr.includes("token=");

    if (hasToken) {
      setShowGoogleAuth(false);
      try {
        const tokenMatch = urlStr.match(/token=([^&]+)/);
        const userMatch = urlStr.match(/user=([^&]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          const userJsonEncoded = userMatch ? userMatch[1] : "";
          if (userJsonEncoded) {
            const userObj = JSON.parse(decodeURIComponent(userJsonEncoded));
            setSession(token, userObj);
            if (userObj && userObj.role === "admin") {
              router.replace("/(admin)");
            } else {
              router.replace("/(tabs)");
            }
          }
        }
      } catch (error: any) {
        Alert.alert("Lỗi đăng nhập", "Lỗi xử lý xác thực: " + error.message);
      }
    } else if (urlStr.includes("error=")) {
      setShowGoogleAuth(false);
      Alert.alert("Đăng nhập thất bại", "Quyền truy cập tài khoản Google bị từ chối hoặc lỗi.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Khu vực ảnh minh họa phía trên */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../../assets/images/onboarding1.png")}
            style={styles.illustration}
          />
        </View>

        {/* Card chứa form đăng nhập */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Login</Text>

          {/* Server error box */}
          {serverError ? (
            <View style={styles.serverErrorBox}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Ô nhập Email */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="email-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="soul.user@gmail.com"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
              onChangeText={handlePasswordChange}
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
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Hàng liên kết quên mật khẩu và nút Login */}
          <View style={styles.loginRow}>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtnSmall} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnSmallText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Đường gạch ngang */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or login with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Nút Google */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={!request || gLoading}
            >
              {gLoading ? (
                <ActivityIndicator color="#EA4335" size="small" />
              ) : (
                <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
              )}
            </TouchableOpacity>
          </View>

          {/* Chuyển sang màn Đăng ký */}
          <View style={styles.centerLinkContainer}>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.forgotText}>
                {"Don't have an account? "}
                <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal WebView fallback (dành cho Web) */}
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
