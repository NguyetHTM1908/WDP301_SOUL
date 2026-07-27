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
import { API_BASE_URL } from "@/api/config";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = "174376142-i5mmq3ssn1n6n8h2k3bttlllh21ep2qo.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = "174376142-cdasefrkjmif196msi88l0p4av2qpf68.apps.googleusercontent.com";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [gLoading, setGLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "event_organizer">("user");

  // States inline validation
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // States phục vụ WebView đăng nhập/đăng ký Google
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState("");

  const registerAction = useAuthStore((state) => state.register);
  const setSession = useAuthStore((state) => state.setSession);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  // ── expo-auth-session Google ──────────────────────────────────
  // ── expo-auth-session Google ──────────────────────────────────
  // Khi dùng androidClientId, expo-auth-session tự tạo redirect URI đúng:
  // com.googleusercontent.apps.{androidClientId}:/oauth2redirect
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ["openid", "profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    } else if (response?.type === "error") {
      console.error("[Google SignUp Error]:", response.error);
      Alert.alert("Lỗi đăng ký Google", response.error?.message || "Đã có lỗi xảy ra");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleGoogleToken = async (accessToken: string) => {
    setGLoading(true);
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await userInfoRes.json();
      const result = await loginWithGoogle(
        profile.email,
        profile.name,
        profile.sub,
        profile.picture,
        undefined
      );
      setGLoading(false);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Lỗi", result.message || "Đăng ký Google thất bại.");
      }
    } catch (err: any) {
      setGLoading(false);
      Alert.alert("Lỗi", "Không lấy được thông tin Google: " + err.message);
    }
  };

  // ── Validate helpers ──────────────────────────────────────────
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Vui lòng nhập họ tên");
    } else {
      setNameError("");
    }
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại");
    } else if (value.trim().length < 10) {
      setPhoneError("Số điện thoại không hợp lệ (ít nhất 10 số)");
    } else {
      setPhoneError("");
    }
  };

  const validateGender = (value: string) => {
    if (!value) {
      setGenderError("Vui lòng chọn giới tính");
    } else {
      setGenderError("");
    }
  };

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
    } else if (value.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
    } else {
      setPasswordError("");
    }
  };

  // ── onChangeText handlers ─────────────────────────────────────
  const handleNameChange = (value: string) => {
    setFullName(value);
    setServerError("");
    validateName(value);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setServerError("");
    validatePhone(value);
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

  // ── Google Auth ───────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    if (Platform.OS === "web") {
      window.location.href = `${API_BASE_URL}/auth/google`;
      return;
    }
    await promptAsync();
  };

  const handleGoogleNavigation = async (navState: any) => {
    const urlStr = navState.url;
    console.log("[Google SignUp WebView] Lắng nghe chuyển hướng URL:", urlStr);

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
            const userDecoded = decodeURIComponent(userJsonEncoded);
            const userObj = JSON.parse(userDecoded);
            setSession(token, userObj);
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

  // ── Submit ────────────────────────────────────────────────────
  const handleRegister = async () => {
    // Validate tất cả fields trước khi gọi API
    validateName(fullName);
    validatePhone(phone);
    validateGender(gender);
    validateEmail(email);
    validatePassword(password);

    if (
      !fullName.trim() ||
      !phone.trim() ||
      phone.trim().length < 10 ||
      !gender ||
      !emailRegex.test(email) ||
      password.length < 6
    ) {
      return;
    }

    setServerError("");
    setLoading(true);
    const result = await registerAction({ fullName, email, password, phone, gender, role: selectedRole });
    setLoading(false);

    if (result.success) {
      setShowSuccessModal(true);
    } else {
      setServerError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
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

          {/* Server error box */}
          {serverError ? (
            <View style={styles.serverErrorBox}>
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Ô nhập Họ tên */}
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
              onChangeText={handleNameChange}
              autoCapitalize="words"
            />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          {/* Ô nhập Số điện thoại */}
          <View style={styles.inputGroup}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#8193A5"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Số điện thoại"
              placeholderTextColor="#A0AEC0"
              style={styles.input}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

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
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          {/* Chọn giới tính */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#466986", marginBottom: 8, marginTop: 4 }}>
            Giới tính
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {["male", "female", "other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: gender === g ? "#0F766E" : "#D1EFE6",
                  backgroundColor: gender === g ? "#D8F8EC" : "#F3FAF8",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setGender(g);
                  setGenderError("");
                  setServerError("");
                }}
              >
                <Text
                  style={{
                    color: gender === g ? "#0F766E" : "#8193A5",
                    fontWeight: "600",
                    fontSize: 14,
                    textTransform: "capitalize",
                  }}
                >
                  {g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

          {/* Chọn loại tài khoản */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#466986", marginBottom: 8, marginTop: 4 }}>
            Loại tài khoản
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            {([
              { value: "user", label: "Người dùng thường", icon: "account-outline" },
              { value: "event_organizer", label: "Người tổ chức\nsự kiện", icon: "calendar-star" },
            ] as { value: "user" | "event_organizer"; label: string; icon: string }[]).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  flex: 1,
                  minHeight: 64,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: selectedRole === opt.value ? "#0F766E" : "#D1EFE6",
                  backgroundColor: selectedRole === opt.value ? "#D8F8EC" : "#F3FAF8",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  gap: 4,
                }}
                onPress={() => setSelectedRole(opt.value)}
              >
                <MaterialCommunityIcons
                  name={opt.icon as any}
                  size={20}
                  color={selectedRole === opt.value ? "#0F766E" : "#8193A5"}
                />
                <Text
                  style={{
                    color: selectedRole === opt.value ? "#0F766E" : "#8193A5",
                    fontWeight: "600",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
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

          {/* Nút Đăng nhập Google */}
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

      {/* Custom Success Popup Modal */}
      <Modal
        transparent={true}
        visible={showSuccessModal}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header Icon */}
            <View style={styles.successIconCircle}>
              <MaterialCommunityIcons name="party-popper" size={44} color="#006B5C" />
            </View>
            
            {/* Title */}
            <Text style={styles.modalTitleText}>Đăng ký thành công!</Text>
            
            {/* Description */}
            <Text style={styles.modalDescText}>
              Mã OTP xác thực 6 số đã được gửi tới email:{"\n"}
              <Text style={{ fontWeight: "700", color: "#0F766E" }}>{email}</Text>
            </Text>
            
            {/* Button */}
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.push({
                  pathname: "/(auth)/verify",
                  params: { email, type: "register" },
                });
              }}
            >
              <Text style={styles.modalConfirmButtonText}>NHẬP MÃ OTP XÁC THỰC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
