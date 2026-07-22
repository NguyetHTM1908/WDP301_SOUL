import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F2FFFB",
  },

  main: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    position: "relative",
    zIndex: 999,
  },

  menuButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    elevation: 3,
  },

  menuButtonActive: {
    backgroundColor: "#E0F7EF",
  },

  greetingBox: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#003D3A",
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#70869E",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    position: "relative",
    zIndex: 999,
  },

  bellWrap: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF7892",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  profileWrapper: {
    position: "relative",
    zIndex: 9999,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#21B99A",
  },

  profileMenu: {
    position: "absolute",
    top: 58,
    right: 0,
    width: 280,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFFFF",
    elevation: 30,
    zIndex: 99999,
  },

  // Dropdown render ở tầng root để không bị clip bởi ScrollView
  profileMenuFloating: {
    position: "absolute",
    top: 100,
    right: 18,
    width: 280,
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#FFFFFF",
    elevation: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    zIndex: 99999,
  },

  profileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEF0",
  },

  profileImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  profileName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#004C43",
  },

  profileSub: {
    marginTop: 4,
    color: "#61798D",
    fontSize: 12,
    fontWeight: "600",
  },

  profileAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },

  profileLogout: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E7EEF0",
    paddingTop: 14,
  },

  profileActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#183A48",
  },

  heroCard: {
    minHeight: 280,
    borderRadius: 28,
    backgroundColor: "#006B5C",
    padding: 24,
    marginBottom: 18,
    overflow: "hidden",
    position: "relative",
  },

  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 18,
  },

  heroBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  heroTitle: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroDescription: {
    marginTop: 14,
    fontSize: 16,
    color: "#E8FFFA",
    lineHeight: 24,
  },

  heroButton: {
    marginTop: 24,
    width: 210,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  heroButtonText: {
    color: "#004C43",
    fontWeight: "900",
    fontSize: 14,
  },

  heroDecor: {
    position: "absolute",
    right: -36,
    bottom: -10,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },

  featureCard: {
    width: "48%",
    minHeight: 170,
    borderRadius: 24,
    padding: 18,
  },

  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  featureTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#004C43",
  },

  featureSub: {
    marginTop: 8,
    color: "#587088",
    fontSize: 12,
    fontWeight: "600",
  },

  arrowCircle: {
    marginTop: "auto",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 16,
  },

  panel: {
    width: "100%",
    minHeight: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    elevation: 3,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#004C43",
  },

  panelLink: {
    color: "#006B5C",
    fontWeight: "800",
    fontSize: 13,
  },

  chartRow: {
    height: 150,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  chartItem: {
    alignItems: "center",
  },

  emoji: {
    marginBottom: 6,
    fontSize: 18,
  },

  chartBar: {
    width: 22,
    borderRadius: 12,
    backgroundColor: "#36BFA6",
  },

  day: {
    marginTop: 8,
    color: "#31576C",
    fontWeight: "700",
    fontSize: 11,
  },

  noteBox: {
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: "#F0FBF7",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  noteText: {
    flex: 1,
    color: "#587088",
    lineHeight: 20,
    fontSize: 13,
    fontWeight: "600",
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },

  suggestionText: {
    marginTop: 8,
    textAlign: "center",
    color: "#35596C",
    fontWeight: "800",
    lineHeight: 23,
    fontSize: 15,
  },

  startButton: {
    marginTop: 16,
    backgroundColor: "#006B5C",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  communityWrap: {
    flexDirection: "column",
    gap: 16,
    marginTop: 18,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  smallAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  userName: {
    fontWeight: "900",
    color: "#133B4A",
    fontSize: 15,
  },

  newTag: {
    fontSize: 11,
    color: "#13996F",
  },

  time: {
    color: "#8193A5",
    marginTop: 3,
    fontSize: 12,
  },

  postText: {
    marginTop: 16,
    color: "#163D4E",
    lineHeight: 22,
    fontSize: 14,
  },

  illustrationBox: {
    width: "100%",
    height: 130,
    borderRadius: 22,
    backgroundColor: "#FFF1E2",
    alignItems: "center",
    justifyContent: "center",
  },

  reactRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 24,
  },

  reactText: {
    color: "#466986",
    fontWeight: "800",
  },

  eventTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "900",
    color: "#102A36",
  },

  eventMeta: {
    marginTop: 10,
    color: "#587088",
    fontWeight: "700",
    fontSize: 13,
  },

  eventImage: {
    width: "100%",
    height: 130,
    borderRadius: 22,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center",
  },

  joinButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    backgroundColor: "#FF8A1D",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },

  joinText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  footer: {
    height: 82,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 6,
  },

  footerItem: {
    alignItems: "center",
  },

  footerText: {
    marginTop: 4,
    color: "#40657D",
    fontWeight: "700",
    fontSize: 11,
  },

  footerPlus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#26A98F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    elevation: 8,
  },

  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 10,
    zIndex: 99999,
  },

  logoBox: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoText: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
    color: "#005F56",
  },

  sideItem: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 8,
  },

  sideItemActive: {
    backgroundColor: "#E0F7EF",
  },

  sideText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#52708A",
    fontWeight: "700",
  },

  sideTextActive: {
    color: "#006B5C",
    fontWeight: "900",
  },

  reminderCard: {
    marginTop: "auto",
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#F0FBF7",
  },

  reminderTitle: {
    marginTop: 10,
    color: "#005F56",
    fontWeight: "900",
  },

  reminderText: {
    marginTop: 8,
    color: "#6B7C93",
    lineHeight: 20,
    fontSize: 13,
  },
});