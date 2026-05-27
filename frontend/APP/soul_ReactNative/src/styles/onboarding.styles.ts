import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const onboardingStyles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogo: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.dark,
    fontFamily: "Georgia",
    fontStyle: "italic",
    marginBottom: 40,
    letterSpacing: 2,
  },
  spinner: {
    marginTop: 20,
  },

  // Onboarding Screen Styles
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginVertical: 10,
  },
  headerText: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.dark,
    fontFamily: "Georgia",
    fontStyle: "italic",
    letterSpacing: 2,
  },
  pager: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.38,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  illustration: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  
  // Khu vực chứa danh sách thẻ cuộn ngang
  cardsRow: {
    height: 150,
    width: SCREEN_WIDTH,
    marginVertical: 10,
  },
  // Style cho phần content bên trong ScrollView thẻ
  cardsScrollContent: {
    alignItems: "center",
    paddingHorizontal: (SCREEN_WIDTH - 180) / 2, // Thêm padding hai bên để thẻ active luôn được căn giữa màn hình
  },
  card: {
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8, // Khoảng cách giữa các thẻ (margin horizontal 8px cho mỗi bên, tổng gap là 16px)
  },
  activeCard: {
    width: 180,
    height: 130,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0B5345",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    zIndex: 2,
    opacity: 1,
  },
  inactiveCard: {
    width: 180, // Chiều rộng bằng thẻ active để đồng đều trong phép tính cuộn ngang
    height: 110,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 1,
    opacity: 0.5, // Làm mờ thẻ không active
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  activeIconBg: {
    backgroundColor: colors.softMint,
  },
  inactiveIconBg: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  activeCardTitle: {
    color: colors.dark,
  },
  inactiveCardTitle: {
    color: "#6B7C93",
    fontSize: 12,
  },

  // Page Indicator
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A7F3D0",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.dark,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#CBD5E1",
  },

  // Swipe To Start Slider
  sliderTrack: {
    width: SCREEN_WIDTH * 0.85,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#BCEFE0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    alignSelf: "center",
    marginBottom: 35,
    position: "relative",
    overflow: "hidden",
  },
  sliderText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: colors.dark,
    zIndex: 1,
  },
  sliderHandle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
