import { StyleSheet, Platform } from "react-native";

export const notifStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 50,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0EE",
    elevation: 3,
    shadowColor: "#006B5C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F7F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A2E2A",
    flex: 1,
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E8F5F0",
    borderRadius: 16,
  },
  markAllText: {
    fontSize: 13,
    color: "#006B5C",
    fontWeight: "600",
  },

  // ─── Section Header ───────────────────────
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAF9",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7C93",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ─── Notification Item ────────────────────
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F5F4",
    position: "relative",
  },
  notifItemUnread: {
    backgroundColor: "#F0FAF7",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  iconWrapFriend: { backgroundColor: "#E0F2FE" },
  iconWrapAccepted: { backgroundColor: "#DCFCE7" },
  iconWrapEvent: { backgroundColor: "#FEF9C3" },
  iconWrapPost: { backgroundColor: "#F3E8FF" },
  iconWrapComment: { backgroundColor: "#E0F2FE" },
  iconWrapSystem: { backgroundColor: "#F0F7F5" },

  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A2E2A",
    marginBottom: 3,
  },
  notifBody: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 5,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#006B5C",
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -5,
  },

  // ─── Empty State ──────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  // ─── Loading ──────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
  },

  // ─── Toast / Popup ────────────────────────
  toastContainer: {
    position: "absolute",
    top: Platform.OS === "web" ? 20 : 55,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2E2A",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    gap: 12,
  },
  toastIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  toastBody: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  toastClose: {
    padding: 4,
  },
});
