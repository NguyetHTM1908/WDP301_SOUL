import { Platform, StyleSheet } from "react-native";

export const eventStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEFDF8",
  },

  page: {
    flex: 1,
    backgroundColor: "#EEFDF8",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEFDF8",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "800",
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

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroTitle: {
    marginTop: 18,
    color: "#064D3D",
    fontSize: 32,
    lineHeight: 38,
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
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
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

  adminHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: "#DFFAF2",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    lineHeight: 36,
    fontWeight: "900",
  },

  adminSubtitle: {
    marginTop: 6,
    color: "#3B635B",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
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

  filterScroll: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  filterChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9F2EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  filterChipText: {
    color: "#45615A",
    fontSize: 13,
    fontWeight: "900",
  },

  filterChipTextActive: {
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextWhite: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  actionTextRed: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "900",
  },

  adminActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },

  approveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  rejectButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  formContainer: {
    flex: 1,
    backgroundColor: "#EEFDF8",
  },

  formContent: {
    padding: 16,
    paddingBottom: 40,
  },

  formSection: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDEFEA",
  },

  formSectionTitle: {
    color: "#064D3D",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    color: "#244D44",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },

  input: {
    minHeight: 52,
    borderRadius: 17,
    backgroundColor: "#F7FFFC",
    borderWidth: 1,
    borderColor: "#DCEFE9",
    paddingHorizontal: 14,
    color: "#0A3F36",
    fontSize: 14,
    fontWeight: "700",
  },

  textArea: {
    minHeight: 115,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  typeGrid: {
    gap: 10,
    marginBottom: 14,
  },

  typeCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DCEFE9",
    backgroundColor: "#F7FFFC",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  typeCardActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  typeTitle: {
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "900",
  },

  typeTitleActive: {
    color: "#FFFFFF",
  },

  typeDescription: {
    marginTop: 3,
    color: "#66807A",
    fontSize: 12,
    fontWeight: "700",
  },

  typeDescriptionActive: {
    color: "rgba(255,255,255,0.82)",
  },

  hintBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#C8F7E3",
    flexDirection: "row",
    gap: 9,
  },

  hintText: {
    flex: 1,
    color: "#0F766E",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  submitButton: {
    marginTop: 18,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  secondaryButton: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCEFE9",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.6,
  },

  emptyBox: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDEFEA",
  },

  emptyTitle: {
    color: "#064D3D",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: "#6A807B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    fontWeight: "700",
  },

  searchInput: {
    margin: 14,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDEFEA",
    paddingHorizontal: 14,
    color: "#0A3F36",
    fontWeight: "700",
  },

  registrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8FAF3",
    alignItems: "center",
    justifyContent: "center",
  },

  participantInfo: {
    flex: 1,
  },

  participantName: {
    color: "#0A3F36",
    fontSize: 16,
    fontWeight: "900",
  },

  participantMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  timelineRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timelineText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
  },
});