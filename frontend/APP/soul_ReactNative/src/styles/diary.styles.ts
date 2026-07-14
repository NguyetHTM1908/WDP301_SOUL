import { StyleSheet } from "react-native";

export const diaryStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F0FBF7",
  },

  header: {
    backgroundColor: "#E4F8F1",
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 18,
    color: "#064D3D",
    fontSize: 32,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 8,
    color: "#385E56",
    fontSize: 15,
    lineHeight: 22,
  },

  todayCard: {
    marginTop: 18,
    minHeight: 96,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D9EEE8",
  },

  todayLabel: {
    color: "#00866B",
    fontSize: 13,
    fontWeight: "900",
  },

  todayTitle: {
    marginTop: 6,
    color: "#073E34",
    fontSize: 19,
    fontWeight: "900",
  },

  todayEmoji: {
    fontSize: 42,
  },

  filterRow: {
    paddingTop: 16,
    gap: 10,
  },

  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EAF6F2",
    borderWidth: 1,
    borderColor: "#D9EEE8",
  },

  filterChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  filterText: {
    color: "#064D3D",
    fontSize: 13,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },

  diaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3ECE9",
    shadowColor: "#0B3D35",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  diaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  moodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0FBF7",
    alignItems: "center",
    justifyContent: "center",
  },

  moodCircleText: {
    fontSize: 28,
  },

  diaryHeaderInfo: {
    flex: 1,
  },

  diaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  diaryMood: {
    color: "#073E34",
    fontSize: 17,
    fontWeight: "900",
  },

  privateBadge: {
    borderRadius: 999,
    backgroundColor: "#EAF7F3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  privateBadgeText: {
    color: "#00866B",
    fontSize: 11,
    fontWeight: "900",
  },

  diaryDate: {
    marginTop: 4,
    color: "#6A807B",
    fontSize: 13,
    fontWeight: "700",
  },

  diaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  smallIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F7F5",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteIconButton: {
    backgroundColor: "#FEF2F2",
  },

  scoreRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  scoreLabel: {
    color: "#60706C",
    fontSize: 12,
    fontWeight: "800",
  },

  scoreBar: {
    flex: 1,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#EAF1EF",
    overflow: "hidden",
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
  },

  scoreValue: {
    color: "#064D3D",
    fontSize: 12,
    fontWeight: "900",
  },

  diaryNote: {
    marginTop: 14,
    color: "#172F2B",
    fontSize: 15,
    lineHeight: 23,
  },

  aiInsightBox: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: "#F0FBF7",
    borderWidth: 1,
    borderColor: "#D7ECE5",
    padding: 13,
  },

  aiInsightMedium: {
    backgroundColor: "#FFF7E6",
    borderColor: "#FCD34D",
  },

  aiInsightHigh: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },

  aiInsightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
  },

  aiInsightTitle: {
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "900",
    flex: 1,
  },

  aiInsightTitleHigh: {
    color: "#991B1B",
  },

  riskBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "#DFF8EC",
  },

  riskBadgeMedium: {
    backgroundColor: "#FEF3C7",
  },

  riskBadgeHigh: {
    backgroundColor: "#FEE2E2",
  },

  riskBadgeText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "900",
  },

  riskBadgeTextHigh: {
    color: "#DC2626",
  },

  insightMetaRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  insightMeta: {
    color: "#60706C",
    fontSize: 12,
    fontWeight: "800",
  },

  insightText: {
    marginTop: 10,
    color: "#1C3430",
    lineHeight: 20,
    fontSize: 14,
  },

  suggestionText: {
    marginTop: 10,
    color: "#064D3D",
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    fontSize: 54,
  },

  emptyTitle: {
    marginTop: 12,
    color: "#064D3D",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 8,
    color: "#6A807B",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  emptyButton: {
    marginTop: 18,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 47, 43, 0.48)",
    justifyContent: "flex-end",
  },

  modalBox: {
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },

  modalHandle: {
    alignSelf: "center",
    width: 55,
    height: 6,
    borderRadius: 99,
    backgroundColor: "#D4DAD8",
    marginBottom: 20,
  },

  closeButton: {
    position: "absolute",
    right: 20,
    top: 28,
    zIndex: 5,
  },

  modalTitle: {
    textAlign: "center",
    color: "#064D3D",
    fontSize: 25,
    fontWeight: "900",
  },

  modalSub: {
    textAlign: "center",
    marginTop: 8,
    color: "#6D7D79",
    fontSize: 15,
    lineHeight: 21,
  },

  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    color: "#064D3D",
    fontSize: 15,
    fontWeight: "900",
  },

  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  moodOption: {
    width: "31%",
    height: 82,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E1E9E7",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  moodEmoji: {
    fontSize: 27,
  },

  moodText: {
    marginTop: 5,
    color: "#263C37",
    fontSize: 12,
    fontWeight: "800",
  },

  scorePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  scoreDot: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#EAF7F3",
    alignItems: "center",
    justifyContent: "center",
  },

  scoreDotActive: {
    backgroundColor: "#00866B",
  },

  scoreDotText: {
    color: "#064D3D",
    fontSize: 14,
    fontWeight: "900",
  },

  scoreDotTextActive: {
    color: "#FFFFFF",
  },

  noteInputBox: {
    minHeight: 170,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    padding: 14,
    backgroundColor: "#FFFFFF",
  },

  noteInput: {
    flex: 1,
    minHeight: 130,
    textAlignVertical: "top",
    color: "#1C3430",
    fontSize: 15,
    lineHeight: 22,
  },

  counter: {
    textAlign: "right",
    color: "#7D8B88",
    fontSize: 12,
  },

  privateRow: {
    marginTop: 16,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E9E7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  privateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  privateTitle: {
    color: "#173B34",
    fontSize: 15,
    fontWeight: "900",
  },

  privateSub: {
    marginTop: 2,
    color: "#6A807B",
    fontSize: 12,
    fontWeight: "600",
  },

  saveButton: {
    marginTop: 20,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  cancelText: {
    marginTop: 18,
    textAlign: "center",
    color: "#6F7E7B",
    fontSize: 16,
    fontWeight: "700",
  },
});