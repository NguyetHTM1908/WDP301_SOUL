import { StyleSheet, Dimensions } from "react-native";
import { colors } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7F6",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F7F6",
  },
  
  // Header Area
  headerSection: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#0B5345",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  coverContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#E2F2ED",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  coverCamera: {
    position: "absolute",
    bottom: 12,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Avatar & Basic Info
  profileInfoContainer: {
    alignItems: "center",
    marginTop: -60,
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarCamera: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#006B5C",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#214B5B",
    marginTop: 12,
    fontFamily: "Georgia",
    textAlign: "center",
  },
  userBio: {
    fontSize: 14,
    color: "#6B7C93",
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F5F4",
    paddingVertical: 12,
  },
  statCol: {
    alignItems: "center",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#006B5C",
  },
  statLabel: {
    fontSize: 11,
    color: "#A0AEC0",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Tabs Bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    paddingHorizontal: 10,
    elevation: 1,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 6,
    position: "relative",
  },
  tabButtonActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8193A5",
  },
  tabTextActive: {
    color: "#006B5C",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: "#006B5C",
    borderRadius: 1.5,
  },

  // Content Area
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Intro tab
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0B5345",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#214B5B",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  infoText: {
    fontSize: 14,
    color: "#4A5568",
    marginLeft: 12,
    flex: 1,
  },

  // Feed Tab - Create Post
  createPostBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  createPostPlaceholder: {
    flex: 1,
    height: 40,
    backgroundColor: "#F3FAF8",
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  createPostPlaceholderText: {
    color: "#A0AEC0",
    fontSize: 14,
  },

  // Photos Grid
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoWrapper: {
    width: (SCREEN_WIDTH - 32 - 16) / 3,
    height: (SCREEN_WIDTH - 32 - 16) / 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#E2F2ED",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  emptyPhotosText: {
    textAlign: "center",
    color: "#A0AEC0",
    fontSize: 14,
    marginTop: 20,
    width: "100%",
  },

  // Friends & Recommendations
  friendsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#214B5B",
    marginTop: 10,
    marginBottom: 12,
  },
  friendsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  friendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    width: (SCREEN_WIDTH - 32 - 10) / 2,
    elevation: 1,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#214B5B",
    textAlign: "center",
  },
  friendBio: {
    fontSize: 11,
    color: "#8193A5",
    textAlign: "center",
    marginTop: 2,
  },

  // Recommendation Card Banner
  recBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  recBannerText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    flex: 1,
    marginLeft: 10,
  },
  recommendationsContainer: {
    gap: 12,
  },
  recCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    elevation: 1,
  },
  recAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  recInfo: {
    flex: 1,
  },
  recName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#214B5B",
  },
  recMoodBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  recMoodText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#D8F8EC",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  friendActionMiniButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#006B5C",
    marginLeft: 6,
  },
  friendActionMiniText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
