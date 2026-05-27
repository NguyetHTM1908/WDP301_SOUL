import { StyleSheet } from "react-native";

export const forumStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F0FBF7",
  },

  header: {
    backgroundColor: "#E4F8F1",
    paddingTop: 58,
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
  },

  decorHeart: {
    position: "absolute",
    right: 110,
    top: 72,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#064D3D",
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 8,
    color: "#385E56",
    fontSize: 17,
    lineHeight: 24,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  bellButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  redDot: {
    position: "absolute",
    top: 6,
    right: 5,
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: "#EF4444",
  },

  plusButton: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00866B",
    shadowOpacity: 0.28,
    shadowRadius: 13,
    elevation: 6,
  },

  searchBox: {
    marginTop: 28,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#0B3D35",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    color: "#1C3430",
    fontSize: 16,
  },

  filterRow: {
    paddingTop: 18,
    paddingBottom: 4,
    gap: 12,
  },

  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#EAF6F2",
  },

  filterChipActive: {
    backgroundColor: "#00866B",
  },

  filterText: {
    color: "#064D3D",
    fontSize: 15,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3ECE9",
    shadowColor: "#0B3D35",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 28,
    backgroundColor: "#D7F2EA",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  authorName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#073E34",
  },

  postMeta: {
    color: "#758783",
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
  },

  postContent: {
    marginTop: 16,
    color: "#172F2B",
    fontSize: 17,
    lineHeight: 26,
  },

  tagRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  tag: {
    backgroundColor: "#EAF7F3",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  tagText: {
    color: "#064D3D",
    fontSize: 13,
    fontWeight: "800",
  },

  postImage: {
    marginTop: 18,
    height: 152,
    width: "100%",
    borderRadius: 17,
    backgroundColor: "#E8F5F1",
  },

  actionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  actionText: {
    color: "#36534D",
    fontSize: 15,
    fontWeight: "800",
  },

  hugIcon: {
    fontSize: 22,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 70,
  },

  emptyIcon: {
    fontSize: 52,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "900",
    color: "#064D3D",
  },

  emptyText: {
    marginTop: 6,
    color: "#6A807B",
    fontSize: 15,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 47, 43, 0.48)",
    justifyContent: "flex-end",
  },

  createModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26,
  },

  modalHandle: {
    alignSelf: "center",
    width: 55,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#D4DAD8",
    marginBottom: 22,
  },

  closeButton: {
    position: "absolute",
    right: 22,
    top: 34,
    zIndex: 5,
  },

  modalTitle: {
    textAlign: "center",
    color: "#064D3D",
    fontSize: 26,
    fontWeight: "900",
  },

  modalSub: {
    textAlign: "center",
    marginTop: 8,
    color: "#6D7D79",
    fontSize: 16,
  },

  bigInputWrap: {
    marginTop: 26,
    height: 175,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    padding: 16,
  },

  bigInput: {
    flex: 1,
    textAlignVertical: "top",
    color: "#1C3430",
    fontSize: 16,
  },

  counter: {
    textAlign: "right",
    color: "#7D8B88",
    fontSize: 13,
  },

  formInput: {
    marginTop: 16,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  formTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1C3430",
  },

  hashIcon: {
    fontSize: 34,
    color: "#7A8A87",
    fontWeight: "500",
  },

  feelingLabel: {
    marginTop: 24,
    color: "#064D3D",
    fontSize: 16,
    fontWeight: "800",
  },

  emotionGrid: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  emotionCard: {
    flex: 1,
    height: 82,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1E9E7",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  emotionCardActive: {
    borderColor: "#00866B",
    borderWidth: 2,
    backgroundColor: "#F0FBF7",
  },

  emotionEmoji: {
    fontSize: 28,
  },

  emotionName: {
    marginTop: 6,
    fontSize: 11,
    color: "#263C37",
    fontWeight: "700",
  },

  anonymousRow: {
    marginTop: 18,
    height: 64,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E9E7",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  anonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  anonText: {
    fontSize: 16,
    color: "#173B34",
    fontWeight: "700",
  },

  submitButton: {
    marginTop: 22,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#00866B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#00866B",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  cancelText: {
    marginTop: 20,
    textAlign: "center",
    color: "#6F7E7B",
    fontSize: 17,
    fontWeight: "700",
  },
});