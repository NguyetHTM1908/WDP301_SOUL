import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const isMobile = width < 768;
const isSmallMobile = width < 380;

const wp = (percent: number) => (width * percent) / 100;
const hp = (percent: number) => (height * percent) / 100;

const fs = (size: number) => {
  if (isSmallMobile) return size - 2;
  if (isMobile) return size - 1;
  return size;
};

const cardShadow =
  Platform.OS === "web"
    ? {
        boxShadow: "0px 8px 24px rgba(11, 83, 69, 0.10)",
      }
    : {
        shadowColor: "#0B5345",
        shadowOpacity: 0.1,
        shadowRadius: 22,
        elevation: 5,
      };

const softShadow =
  Platform.OS === "web"
    ? {
        boxShadow: "0px 6px 18px rgba(11, 83, 69, 0.08)",
      }
    : {
        shadowColor: "#0B5345",
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 4,
      };

const strongShadow =
  Platform.OS === "web"
    ? {
        boxShadow: "0px 10px 30px rgba(11, 83, 69, 0.16)",
      }
    : {
        shadowColor: "#0B5345",
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 30,
      };

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    flexDirection: isMobile ? "column" : "row",
    backgroundColor: "#F2FFFB",
    overflow: "visible",
    position: "relative",
  },

  menuButtonActive: {
    backgroundColor: "#E0F7EF",
  },

  sidebar: {
    position: isMobile ? "absolute" : "relative",
    left: 0,
    top: 0,
    bottom: 0,
    width: isMobile ? wp(72) : 250,
    backgroundColor: "#FFFFFF",
    padding: isMobile ? 20 : 28,
    paddingTop: isMobile ? 56 : 28,
    borderTopRightRadius: 36,
    borderBottomRightRadius: 36,
    zIndex: 99999,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 8px 24px rgba(45, 125, 115, 0.08)" }
      : {
          shadowColor: "#2D7D73",
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 8,
        }),
  },

  logoBox: {
    alignItems: "center",
    marginBottom: isMobile ? 24 : 34,
  },

  logoText: {
    marginTop: 8,
    fontSize: fs(isMobile ? 24 : 30),
    fontWeight: "900",
    color: "#005F56",
    letterSpacing: 1,
  },

  sideItem: {
    height: isMobile ? 50 : 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isMobile ? 14 : 18,
    marginBottom: 10,
  },

  sideItemActive: {
    backgroundColor: "#E0F7EF",
  },

  sideText: {
    marginLeft: 14,
    fontSize: fs(15),
    color: "#52708A",
    fontWeight: "700",
  },

  sideTextActive: {
    color: "#006B5C",
    fontWeight: "900",
  },

  reminderCard: {
    marginTop: "auto",
    padding: isMobile ? 16 : 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    ...cardShadow,
  },

  reminderTitle: {
    marginTop: 10,
    color: "#005F56",
    fontWeight: "900",
    fontSize: fs(14),
  },

  reminderText: {
    marginTop: 8,
    color: "#6B7C93",
    lineHeight: 21,
    fontSize: fs(13),
  },

  main: {
    flex: 1,
    paddingHorizontal: isMobile ? 16 : 28,
    paddingTop: isMobile ? 24 : 44,
    overflow: "visible",
  },

  mainContent: {
    paddingBottom: isMobile ? 110 : 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: isMobile ? 18 : 28,
    position: "relative",
    zIndex: 9999,
  },

  menuButton: {
    width: isMobile ? 48 : 84,
    height: isMobile ? 48 : 84,
    borderRadius: isMobile ? 16 : 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: isMobile ? 12 : 34,
    ...softShadow,
  },

  greetingBox: {
    flex: 1,
  },

  headerTitle: {
    fontSize: fs(isMobile ? 22 : 44),
    fontWeight: "900",
    color: "#003D3A",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: fs(isMobile ? 13 : 17),
    color: "#70869E",
  },
postImage: {
  width: "100%",
  height: 260,
  borderRadius: 18,
  marginTop: 14,
  backgroundColor: "#F1F5F9",
},
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: isMobile ? 10 : 24,
    position: "relative",
    zIndex: 9999,
  },

  profileWrapper: {
    position: "relative",
    zIndex: 99999,
  },

  bellWrap: {
    width: isMobile ? 40 : 56,
    height: isMobile ? 40 : 56,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: isMobile ? 20 : 25,
    height: isMobile ? 20 : 25,
    borderRadius: isMobile ? 10 : 13,
    backgroundColor: "#FF7892",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: fs(12),
    fontWeight: "900",
  },

  avatar: {
    width: isMobile ? 46 : 82,
    height: isMobile ? 46 : 82,
    borderRadius: isMobile ? 23 : 41,
    borderWidth: isMobile ? 3 : 6,
    borderColor: "#21B99A",
  },

  heroCard: {
    minHeight: isMobile ? 260 : 400,
    borderRadius: isMobile ? 24 : 30,
    backgroundColor: "#006B5C",
    padding: isMobile ? 22 : 36,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },

  profileMenu: {
    position: "absolute",
    top: isMobile ? 58 : 92,
    right: 0,
    width: isMobile ? wp(82) : 340,
    borderRadius: 24,
    padding: isMobile ? 16 : 22,
    backgroundColor: "#FFFFFF",
    zIndex: 999999,
    ...strongShadow,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEF0",
  },

  profileImg: {
    width: isMobile ? 50 : 62,
    height: isMobile ? 50 : 62,
    borderRadius: isMobile ? 25 : 31,
    marginRight: 16,
  },

  profileName: {
    fontSize: fs(isMobile ? 16 : 19),
    fontWeight: "900",
    color: "#004C43",
  },

  profileSub: {
    marginTop: 5,
    color: "#61798D",
    fontWeight: "600",
    fontSize: fs(13),
  },

  profileAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 15,
  },

  profileLogout: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E7EEF0",
    paddingTop: 18,
  },

  profileActionText: {
    fontSize: fs(16),
    fontWeight: "700",
    color: "#183A48",
  },

  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: isMobile ? 18 : 28,
  },

  heroBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: fs(14),
  },

  heroTitle: {
    fontSize: fs(isMobile ? 30 : 43),
    lineHeight: isMobile ? 38 : 56,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroDescription: {
    marginTop: isMobile ? 12 : 20,
    fontSize: fs(isMobile ? 16 : 20),
    color: "#E8FFFA",
    lineHeight: isMobile ? 24 : 30,
  },

  heroButton: {
    marginTop: isMobile ? 20 : 30,
    width: isMobile ? 190 : 250,
    height: isMobile ? 50 : 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  heroButtonText: {
    color: "#004C43",
    fontWeight: "900",
    fontSize: fs(16),
  },

  heroDecor: {
    position: "absolute",
    right: isMobile ? -40 : 90,
    bottom: isMobile ? -35 : 8,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: isMobile ? 12 : 22,
    marginBottom: 24,
  },

  featureCard: {
    width: isMobile ? "47%" : undefined,
    flex: isMobile ? undefined : 1,
    minHeight: isMobile ? 170 : 255,
    borderRadius: isMobile ? 22 : 30,
    padding: isMobile ? 16 : 26,
  },

  featureIcon: {
    width: isMobile ? 50 : 66,
    height: isMobile ? 50 : 66,
    borderRadius: isMobile ? 25 : 33,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: isMobile ? 18 : 34,
  },

  featureTitle: {
    fontSize: fs(isMobile ? 15 : 20),
    fontWeight: "900",
    color: "#004C43",
  },

  featureSub: {
    marginTop: 8,
    color: "#587088",
    fontWeight: "600",
    fontSize: fs(12),
  },

  arrowCircle: {
    marginTop: "auto",
    width: isMobile ? 42 : 48,
    height: isMobile ? 42 : 48,
    borderRadius: isMobile ? 21 : 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 16 : 22,
    marginBottom: 24,
  },

  panel: {
    width: "100%",
    flex: isMobile ? undefined : 1,
    minHeight: isMobile ? 250 : 315,
    backgroundColor: "#FFFFFF",
    borderRadius: isMobile ? 22 : 28,
    padding: isMobile ? 18 : 26,
    ...softShadow,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelTitle: {
    fontSize: fs(isMobile ? 17 : 20),
    fontWeight: "900",
    color: "#004C43",
  },

  panelLink: {
    color: "#006B5C",
    fontWeight: "800",
    fontSize: fs(13),
  },

  chartRow: {
    height: isMobile ? 140 : 170,
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  chartItem: {
    alignItems: "center",
  },

  emoji: {
    marginBottom: 8,
    fontSize: fs(22),
  },

  chartBar: {
    width: isMobile ? 24 : 30,
    borderRadius: 18,
    backgroundColor: "#36BFA6",
  },

  day: {
    marginTop: 10,
    color: "#31576C",
    fontWeight: "700",
    fontSize: fs(12),
  },

  noteBox: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: "#F0FBF7",
    padding: isMobile ? 14 : 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  noteText: {
    flex: 1,
    color: "#587088",
    lineHeight: 22,
    fontWeight: "600",
    fontSize: fs(13),
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },

  suggestionText: {
    marginTop: 8,
    textAlign: "center",
    color: "#35596C",
    fontWeight: "800",
    lineHeight: 25,
    fontSize: fs(16),
  },

  startButton: {
    marginTop: 18,
    backgroundColor: "#006B5C",
    paddingHorizontal: isMobile ? 26 : 34,
    paddingVertical: isMobile ? 12 : 14,
    borderRadius: 14,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: fs(14),
  },

  communityWrap: {
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 14 : 20,
    marginTop: 22,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  smallAvatar: {
    width: isMobile ? 46 : 52,
    height: isMobile ? 46 : 52,
    borderRadius: isMobile ? 23 : 26,
  },

  userName: {
    fontWeight: "900",
    color: "#133B4A",
    fontSize: fs(16),
  },

  newTag: {
    fontSize: fs(12),
    color: "#13996F",
  },

  time: {
    color: "#8193A5",
    marginTop: 3,
    fontSize: fs(12),
  },

  postText: {
    marginTop: 20,
    color: "#163D4E",
    lineHeight: 24,
    fontSize: fs(16),
  },

  illustrationBox: {
    width: isMobile ? "100%" : 170,
    height: isMobile ? 120 : 150,
    borderRadius: 24,
    backgroundColor: "#FFF1E2",
    alignItems: "center",
    justifyContent: "center",
  },

  reactRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 28,
  },

  reactText: {
    color: "#466986",
    fontWeight: "800",
    fontSize: fs(13),
  },

  eventTitle: {
    fontSize: fs(isMobile ? 19 : 22),
    lineHeight: isMobile ? 25 : 29,
    fontWeight: "900",
    color: "#102A36",
  },

  eventMeta: {
    marginTop: 13,
    color: "#587088",
    fontWeight: "700",
    fontSize: fs(13),
  },

  eventImage: {
    width: isMobile ? "100%" : 160,
    height: isMobile ? 120 : 150,
    borderRadius: 24,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center",
  },

  joinButton: {
    marginTop: 22,
    alignSelf: "flex-start",
    backgroundColor: "#FF8A1D",
    paddingHorizontal: isMobile ? 26 : 34,
    paddingVertical: isMobile ? 12 : 15,
    borderRadius: 16,
  },

  joinText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: fs(14),
  },

  footer: {
    height: isMobile ? 76 : 94,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    marginBottom: isMobile ? 16 : 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 999,
    ...cardShadow,
  },

  footerItem: {
    alignItems: "center",
  },

  footerText: {
    marginTop: 6,
    color: "#40657D",
    fontWeight: "700",
    fontSize: fs(11),
  },

  footerPlus: {
    width: isMobile ? 60 : 76,
    height: isMobile ? 60 : 76,
    borderRadius: isMobile ? 30 : 38,
    backgroundColor: "#26A98F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: isMobile ? -30 : -38,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 8px 16px rgba(11, 83, 69, 0.20)" }
      : {
          shadowColor: "#0B5345",
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        }),
  },
});
