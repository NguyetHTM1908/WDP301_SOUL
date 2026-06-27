import { Platform, StyleSheet } from "react-native";
import { colors } from "@/constants/colors";

export const eventStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEFDF8",
  },

  page: {
    flex: 1,
    backgroundColor: "#EEFDF8",
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    backgroundColor: "#DFFAF2",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
  },

  heroCircleOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(0, 134, 107, 0.10)",
    right: -70,
    top: -45,
  },

  heroCircleTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    left: -40,
    bottom: -45,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButtonLight: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#064D3D",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  iconButtonGreen: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00866B",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  heroTitle: {
    marginTop: 22,
    color: "#064D3D",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },

  heroSubtitle: {
    marginTop: 8,
    color: "#3B635B",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },

  heroStats: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },

  heroStatCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  heroStatValue: {
    color: "#064D3D",
    fontSize: 22,
    fontWeight: "900",
  },

  heroStatLabel: {
    marginTop: 4,
    color: "#58716C",
    fontSize: 12,
    fontWeight: "800",
  },

  tabWrap: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    padding: 5,
    borderWidth: 1,
    borderColor: "#D9F2EB",
    shadowColor: "#064D3D",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  tabButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  tabButtonActive: {
    backgroundColor: "#00866B",
  },

  tabText: {
    color: "#45615A",
    fontSize: 13,
    fontWeight: "900",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  listContent: {
    padding: 14,
    paddingBottom: 44,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDEFEA",
    shadowColor: "#064D3D",
    shadowOpacity: Platform.OS === "android" ? 0.12 : 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  cardApprovedGlow: {
    borderColor: "#C8F7E3",
  },

  cardPendingGlow: {
    borderColor: "#FDE68A",
  },

  cardRejectedGlow: {
    borderColor: "#FCA5A5",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  eventIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E8FAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  eventIconWrapWarning: {
    backgroundColor: "#FFF7E6",
  },

  eventIconWrapDanger: {
    backgroundColor: "#FEF2F2",
  },

  cardTitleBlock: {
    flex: 1,
  },

  cardTitle: {
    color: "#0A3F36",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },

  cardSubtitle: {
    marginTop: 4,
    color: "#6A807B",
    fontSize: 13,
    fontWeight: "700",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  badgeGreen: {
    backgroundColor: "#DFF8EC",
  },

  badgeGreenText: {
    color: "#047857",
  },

  badgeYellow: {
    backgroundColor: "#FEF3C7",
  },

  badgeYellowText: {
    color: "#B45309",
  },

  badgeRed: {
    backgroundColor: "#FEE2E2",
  },

  badgeRedText: {
    color: "#DC2626",
  },

  badgeBlue: {
    backgroundColor: "#E0F2FE",
  },

  badgeBlueText: {
    color: "#0369A1",
  },

  infoPanel: {
    marginTop: 15,
    borderRadius: 20,
    backgroundColor: "#F6FFFC",
    padding: 13,
    borderWidth: 1,
    borderColor: "#E0F4EE",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },

  infoText: {
    flex: 1,
    color: "#385E56",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  description: {
    marginTop: 13,
    color: "#263D38",
    fontSize: 14,
    lineHeight: 21,
  },

  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  statMiniCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: "#F8FFFC",
    borderWidth: 1,
    borderColor: "#E5F3EF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  statMiniValue: {
    color: "#064D3D",
    fontSize: 17,
    fontWeight: "900",
  },

  statMiniLabel: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },

  progressBlock: {
    marginTop: 14,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  progressText: {
    color: "#3E625B",
    fontSize: 12,
    fontWeight: "800",
  },

  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: "#DDF3EC",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#00866B",
  },

  primaryButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#00866B",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  cancelButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  cancelButtonText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "900",
  },

  ownerActions: {
    marginTop: 15,
    flexDirection: "row",
    gap: 10,
  },

  editButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  lockBox: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },

  lockText: {
    color: "#0369A1",
    fontSize: 13,
    fontWeight: "900",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D9F2EB",
  },

  emptyTitle: {
    marginTop: 16,
    color: "#064D3D",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    color: "#6A807B",
    textAlign: "center",
    lineHeight: 21,
    fontSize: 14,
    fontWeight: "600",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    justifyContent: "flex-end",
  },

  modalPanel: {
    maxHeight: "93%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  modalHandle: {
    alignSelf: "center",
    width: 56,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#D8E3E0",
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },

  modalTitle: {
    color: "#064D3D",
    fontSize: 24,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 4,
    color: "#6A807B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F7F5",
    alignItems: "center",
    justifyContent: "center",
  },

  formLabel: {
    marginTop: 15,
    marginBottom: 8,
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "900",
  },

  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#0F172A",
    fontSize: 14,
  },

  textArea: {
    minHeight: 115,
    textAlignVertical: "top",
  },

  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  selectChip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    backgroundColor: "#FFFFFF",
  },

  selectChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  selectText: {
    color: "#45615A",
    fontSize: 13,
    fontWeight: "900",
  },

  selectTextActive: {
    color: "#FFFFFF",
  },

  saveButton: {
    marginTop: 22,
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00866B",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  adminHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderBottomWidth: 1,
    borderBottomColor: "#E5F3EF",
    shadowColor: "#064D3D",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  adminHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  adminTitle: {
    marginTop: 16,
    color: "#064D3D",
    fontSize: 30,
    fontWeight: "900",
  },

  adminSubtitle: {
    marginTop: 6,
    color: "#607D76",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },

  filterScrollContent: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9F2EB",
  },

  filterChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  filterChipText: {
    color: "#064D3D",
    fontSize: 13,
    fontWeight: "900",
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DDEFEA",
    shadowColor: "#064D3D",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  detailTitle: {
    color: "#064D3D",
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 30,
  },

  detailSectionTitle: {
    color: "#064D3D",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },

  decisionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDEFEA",
    marginTop: 10,
  },

  decisionTitle: {
    color: "#064D3D",
    fontSize: 18,
    fontWeight: "900",
  },

  decisionText: {
    marginTop: 6,
    color: "#6A807B",
    lineHeight: 21,
    fontSize: 14,
    fontWeight: "600",
  },

  approveButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },

  rejectButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 17,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  registrationsButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#C8F7E3",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  registrationsIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E8FAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  registrationsTitle: {
    color: "#064D3D",
    fontSize: 16,
    fontWeight: "900",
  },

  registrationsSubtitle: {
    marginTop: 3,
    color: "#6A807B",
    fontSize: 12,
    fontWeight: "700",
  },

  noticeBox: {
    backgroundColor: "#F8FFFC",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5F3EF",
  },

  noticeText: {
    color: "#45615A",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  rejectionBox: {
    marginTop: 12,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  rejectionTitle: {
    color: "#991B1B",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  rejectionText: {
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },

  searchBox: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9F2EB",
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },

  registrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DDEFEA",
  },

  registrationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#E8FAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  participantInfo: {
    flex: 1,
  },

  participantName: {
    color: "#064D3D",
    fontSize: 15,
    fontWeight: "900",
  },

  participantMeta: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },

  timelineRow: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  timelineLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "800",
  },

  timelineValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
});