import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/constants/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const authStyles = StyleSheet.create({
  // Vùng chứa chính của màn hình
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  // Nút quay lại ở góc trên bên trái
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 10,
  },
  // Tiêu đề của thanh header (ở màn hình quên mật khẩu/xác minh)
  headerTitleContainer: {
    paddingTop: 58,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dark,
    fontFamily: "Georgia",
  },

  // Khu vực hiển thị ảnh minh họa phía trên
  illustrationContainer: {
    height: SCREEN_HEIGHT * 0.28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    paddingTop: 30,
  },
  illustration: {
    width: "100%",
    height: "90%",
    resizeMode: "contain",
  },

  // Form chứa nội dung chính (Màu trắng, bo góc tròn phía trên)
  formCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 20,
    shadowColor: "#0B5345",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  // Tiêu đề lớn (Login / Sign Up)
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Georgia",
  },

  // Khung nhập liệu (Input field wrapper)
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3FAF8",
    borderWidth: 1,
    borderColor: "#D1EFE6",
    borderRadius: 18,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.dark,
    fontSize: 16,
    height: "100%",
  },

  // Liên kết "Quên mật khẩu?" và nút Login bên cạnh
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: "#6B7C93",
    fontWeight: "600",
  },
  loginBtnSmall: {
    backgroundColor: colors.dark,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    elevation: 3,
  },
  loginBtnSmallText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  // Nút bấm lớn (Create account, Send, Verify, Save)
  buttonLarge: {
    backgroundColor: "#639A88", // Màu xanh lá úa trung tính giống mockup
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  buttonLargeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Đường gạch ngang "Or sign up with"
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#A0AEC0",
    fontSize: 13,
  },

  // Khu vực các nút đăng nhập MXH
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // Màn hình quên mật khẩu & xác minh
  subText: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 10,
  },
  linkText: {
    color: "#0F766E",
    fontWeight: "bold",
  },
  centerLinkContainer: {
    alignItems: "center",
    marginTop: 15,
  },

  // Inline error text dưới ô nhập liệu
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 8,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Server error text hiển thị dưới form
  serverErrorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  serverErrorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },

  // Nhập mã OTP 4 số
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 30,
  },
  otpInput: {
    width: 60,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  // Màn hình Chúc mừng (Congratulations)
  congratsContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  congratsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    shadowColor: "#0B5345",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  congratsIllustration: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 30,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 12,
    fontFamily: "Georgia",
  },
  congratsSubText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
  // Custom Alert Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#006B5C",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2F2ED",
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2F2ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#004C43",
    textAlign: "center",
    marginBottom: 10,
  },
  modalDescText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalConfirmButton: {
    backgroundColor: "#006B5C",
    borderRadius: 16,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    shadowColor: "#006B5C",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  modalConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
