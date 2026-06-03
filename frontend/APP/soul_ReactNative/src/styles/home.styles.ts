import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  page: {
  flex: 1,
  flexDirection: "row",
  backgroundColor: "#F2FFFB",

  overflow: "visible",
},

menuButtonActive: {
  backgroundColor: "#E0F7EF",
},
  sidebar: {
  width: 250,
  backgroundColor: "#FFFFFF",
  padding: 28,
  borderTopRightRadius: 36,
  borderBottomRightRadius: 36,
  shadowColor: "#2D7D73",
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 8,
  zIndex: 999,
},

  logoBox: {
    alignItems: "center",
    marginBottom: 34,
  },

  logoText: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "900",
    color: "#005F56",
    letterSpacing: 1,
  },

  sideItem: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  sideItemActive: {
    backgroundColor: "#E0F7EF",
  },

  sideText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#52708A",
    fontWeight: "700",
  },

  sideTextActive: {
    color: "#006B5C",
    fontWeight: "900",
  },

  reminderCard: {
    marginTop: "auto",
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0B5345",
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },

  reminderTitle: {
    marginTop: 10,
    color: "#005F56",
    fontWeight: "900",
  },

  reminderText: {
    marginTop: 8,
    color: "#6B7C93",
    lineHeight: 21,
  },

  main: {
  flex: 1,
  paddingHorizontal: 28,
  paddingTop: 44,

  overflow: "visible",
},

 header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 28,

  position: "relative",
  zIndex: 9999,
},
  menuButton: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 34,
    shadowColor: "#0B5345",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  greetingBox: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 44,
    fontWeight: "900",
    color: "#003D3A",
  },

  headerSubtitle: {
    marginTop: 6,
    fontSize: 17,
    color: "#70869E",
  },

 headerRight: {
  flexDirection: "row",
  alignItems: "center",
  gap: 24,

  position: "relative",
  zIndex: 9999,
},
profileWrapper: {
  position: "relative",
  zIndex: 99999,
},

bellWrap: {
  width: 56,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
},

  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#FF7892",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    borderColor: "#21B99A",
  },

  heroCard: {
  minHeight: 400,
  borderRadius: 30,
  backgroundColor: "#006B5C",
  padding: 36,
  marginBottom: 24,

  overflow: "hidden",

  position: "relative",
  zIndex: 1,
},

  profileMenu: {
  position: "absolute",

  top: 92,
  right: 0,

  width: 340,

  borderRadius: 24,
  padding: 22,

  backgroundColor: "#FFFFFF",

  shadowColor: "#0B5345",
  shadowOpacity: 0.16,
  shadowRadius: 24,

  elevation: 30,

  zIndex: 999999,
},

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEF0",
  },

  profileImg: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 16,
  },

  profileName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#004C43",
  },

  profileSub: {
    marginTop: 5,
    color: "#61798D",
    fontWeight: "600",
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
    fontSize: 16,
    fontWeight: "700",
    color: "#183A48",
  },

  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginBottom: 28,
  },

  heroBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  heroTitle: {
    fontSize: 43,
    lineHeight: 56,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  heroDescription: {
    marginTop: 20,
    fontSize: 20,
    color: "#E8FFFA",
    lineHeight: 30,
  },

  heroButton: {
    marginTop: 30,
    width: 250,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  heroButtonText: {
    color: "#004C43",
    fontWeight: "900",
    fontSize: 16,
  },

  heroDecor: {
    position: "absolute",
    right: 90,
    bottom: 8,
  },

  featureGrid: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 24,
  },

  featureCard: {
    flex: 1,
    height: 255,
    borderRadius: 30,
    padding: 26,
  },

  featureIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 34,
  },

  featureTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#004C43",
  },

  featureSub: {
    marginTop: 10,
    color: "#587088",
    fontWeight: "600",
  },

  arrowCircle: {
    marginTop: "auto",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 24,
  },

  panel: {
    flex: 1,
    minHeight: 315,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    shadowColor: "#0B5345",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#004C43",
  },

  panelLink: {
    color: "#006B5C",
    fontWeight: "800",
  },

  chartRow: {
    height: 170,
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
    fontSize: 22,
  },

  chartBar: {
    width: 30,
    borderRadius: 18,
    backgroundColor: "#36BFA6",
  },

  day: {
    marginTop: 10,
    color: "#31576C",
    fontWeight: "700",
  },

  noteBox: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: "#F0FBF7",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  noteText: {
    flex: 1,
    color: "#587088",
    lineHeight: 22,
    fontWeight: "600",
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
    fontSize: 16,
  },

  startButton: {
    marginTop: 18,
    backgroundColor: "#006B5C",
    paddingHorizontal: 34,
    paddingVertical: 14,
    borderRadius: 14,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  communityWrap: {
    flexDirection: "row",
    gap: 20,
    marginTop: 22,
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  smallAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  userName: {
    fontWeight: "900",
    color: "#133B4A",
    fontSize: 16,
  },

  newTag: {
    fontSize: 12,
    color: "#13996F",
  },

  time: {
    color: "#8193A5",
    marginTop: 3,
  },

  postText: {
    marginTop: 20,
    color: "#163D4E",
    lineHeight: 24,
    fontSize: 16,
  },

  illustrationBox: {
    width: 170,
    height: 150,
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
  },

  eventTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "900",
    color: "#102A36",
  },

  eventMeta: {
    marginTop: 13,
    color: "#587088",
    fontWeight: "700",
  },

  eventImage: {
    width: 160,
    height: 150,
    borderRadius: 24,
    backgroundColor: "#FFF1D8",
    alignItems: "center",
    justifyContent: "center",
  },

  joinButton: {
    marginTop: 22,
    alignSelf: "flex-start",
    backgroundColor: "#FF8A1D",
    paddingHorizontal: 34,
    paddingVertical: 15,
    borderRadius: 16,
  },

  joinText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  footer: {
    height: 94,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#0B5345",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  

  footerItem: {
    alignItems: "center",
  },

  footerText: {
    marginTop: 6,
    color: "#40657D",
    fontWeight: "700",
  },

  footerPlus: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#26A98F",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -38,
    shadowColor: "#0B5345",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});