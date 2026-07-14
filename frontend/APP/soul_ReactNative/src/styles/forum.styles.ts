import { StyleSheet } from "react-native";

export const forumStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F0FBF7",
  },

  header: {
    backgroundColor: "#E4F8F1",
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
  },

  headerTitleWrap: {
    flex: 1,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#064D3D",
  },

  subtitle: {
    marginTop: 6,
    color: "#385E56",
    fontSize: 14,
    lineHeight: 20,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    marginTop: 22,
    height: 54,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#D9EEE8",
  },

  searchInput: {
    flex: 1,
    color: "#1C3430",
    fontSize: 15,
  },

  filterRow: {
    paddingTop: 16,
    paddingBottom: 2,
    gap: 10,
  },

  filterChip: {
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: "800",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 130,
  },

  postCard: {
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

  postCardFlagged: {
    borderColor: "#FCD34D",
    backgroundColor: "#FFFDF7",
  },

  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },

  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  authorInfo: {
    flex: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D7F2EA",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },

  authorName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#073E34",
  },

  postMeta: {
    color: "#758783",
    marginTop: 3,
    fontSize: 13,
    fontWeight: "600",
  },

  mineActions: {
    alignItems: "flex-end",
    gap: 8,
  },

  ownerActions: {
    flexDirection: "row",
    gap: 12,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusBadgeSuccess: {
    backgroundColor: "#DFF8EC",
  },

  statusBadgeWarning: {
    backgroundColor: "#FFF4D6",
  },

  statusBadgeDanger: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    color: "#A16207",
    fontWeight: "900",
    fontSize: 11,
    textTransform: "capitalize",
  },

  statusTextSuccess: {
    color: "#047857",
  },

  statusTextDanger: {
    color: "#DC2626",
  },

  aiReviewBox: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "#FFF7E6",
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },

  aiReviewText: {
    flex: 1,
    color: "#92400E",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },

  postContent: {
    marginTop: 14,
    color: "#172F2B",
    fontSize: 16,
    lineHeight: 24,
  },

  tagRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  tag: {
    backgroundColor: "#EAF7F3",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  tagText: {
    color: "#064D3D",
    fontSize: 12,
    fontWeight: "800",
  },

  postImage: {
    marginTop: 16,
    height: 270,
    width: "100%",
    borderRadius: 18,
    backgroundColor: "#E8F5F1",
  },

  webPreview: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    marginTop: 12,
  },

  mediaPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    marginTop: 12,
  },

  mediaPlaceholderText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },

  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 10,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 48,
  },

  actionEmoji: {
    fontSize: 20,
  },

  actionText: {
    color: "#36534D",
    fontSize: 14,
    fontWeight: "800",
  },

  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF7F3",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  anonymousBadgeText: {
    color: "#00866B",
    fontSize: 11,
    fontWeight: "900",
  },

  iconButtonSoft: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F7F5",
    alignItems: "center",
    justifyContent: "center",
  },

  reactionBar: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  reactionPill: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#F0FBF7",
    borderWidth: 1,
    borderColor: "#DCEBE7",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  commentPill: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EAF7F3",
    borderWidth: 1,
    borderColor: "#D4EAE3",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 70,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 52,
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: "900",
    color: "#064D3D",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 6,
    color: "#6A807B",
    fontSize: 15,
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 47, 43, 0.48)",
    justifyContent: "flex-end",
  },

  createModal: {
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
    fontSize: 24,
    fontWeight: "900",
  },

  modalSub: {
    textAlign: "center",
    marginTop: 8,
    color: "#6D7D79",
    fontSize: 15,
    lineHeight: 21,
  },

  safeNotice: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#EAF7F3",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  safeNoticeText: {
    flex: 1,
    color: "#064D3D",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  bigInputWrap: {
    marginTop: 22,
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    padding: 14,
    backgroundColor: "#FFFFFF",
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
    fontSize: 12,
  },

  formInput: {
    marginTop: 14,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },

  formTextInput: {
    flex: 1,
    fontSize: 15,
    color: "#1C3430",
  },

  hashIcon: {
    fontSize: 30,
    color: "#7A8A87",
    fontWeight: "500",
  },

  feelingLabel: {
    marginTop: 20,
    color: "#064D3D",
    fontSize: 15,
    fontWeight: "800",
  },

  emotionGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  emotionCard: {
    width: "31%",
    height: 78,
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
    fontSize: 26,
  },

  emotionName: {
    marginTop: 5,
    fontSize: 11,
    color: "#263C37",
    fontWeight: "700",
  },

  anonymousRow: {
    marginTop: 16,
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E1E9E7",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  anonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  anonText: {
    fontSize: 15,
    color: "#173B34",
    fontWeight: "700",
  },

  submitButton: {
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

  submitText: {
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

  bottomSwitcher: {
    position: "absolute",
    bottom: 22,
    left: 16,
    right: 16,
    height: 68,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: "#0B3D35",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  bottomTab: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  bottomTabActive: {
    backgroundColor: "#00866B",
  },

  bottomTabText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#40657D",
  },

  bottomTabTextActive: {
    color: "#FFFFFF",
  },

  inlineCommentBox: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E3ECE9",
  },

  commentThread: {
    marginBottom: 10,
  },

  inlineCommentCard: {
    backgroundColor: "#F0FBF7",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },

  inlineCommentAuthor: {
    fontSize: 13,
    fontWeight: "900",
    color: "#064D3D",
    flex: 1,
  },

  inlineCommentMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#7A8A87",
  },

  inlineCommentText: {
    marginTop: 4,
    fontSize: 14,
    color: "#1C3430",
    lineHeight: 20,
  },

  commentActionRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 8,
  },

  commentActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#00866B",
  },

  commentTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  commentMenuButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  commentMenu: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 138,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E3ECE9",
    elevation: 8,
    shadowColor: "#0B3D35",
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  commentMenuItem: {
    minHeight: 38,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  commentMenuText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#064D3D",
  },

  commentMenuDeleteText: {
    color: "#EF4444",
  },

  replyList: {
    marginLeft: 22,
    marginTop: 4,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#CFE5DE",
  },

  replyCard: {
    backgroundColor: "#F7FCFA",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },

  inlineCommentInputRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inlineCommentInput: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#EEF5F3",
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1C3430",
  },

  inlineCommentSend: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  replyInputRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  replyInput: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#1C3430",
  },

  replySend: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  replySendCancel: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  reportBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 47, 43, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  reportModal: {
    width: "100%",
    maxWidth: 390,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    maxHeight: "84%",
  },

  reportIconCircle: {
    alignSelf: "center",
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#EAF7F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  reportTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#064D3D",
    textAlign: "center",
  },

  reportSub: {
    marginTop: 8,
    color: "#6D7D79",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },

  reasonList: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#EAF7F3",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  reasonChipActive: {
    backgroundColor: "#00866B",
  },

  reasonText: {
    color: "#064D3D",
    fontWeight: "800",
    fontSize: 12,
  },

  reasonTextActive: {
    color: "#FFFFFF",
  },

  reportInput: {
    marginTop: 16,
    minHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE7E4",
    padding: 14,
    textAlignVertical: "top",
    color: "#1C3430",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },

  myReportList: {
    marginTop: 16,
    maxHeight: 360,
  },

  myReportCard: {
    backgroundColor: "#F0FBF7",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  myReportReason: {
    color: "#064D3D",
    fontWeight: "900",
    fontSize: 15,
    textTransform: "capitalize",
  },

  myReportMeta: {
    marginTop: 6,
    color: "#6A807B",
    fontWeight: "700",
    fontSize: 13,
  },

  myReportDescription: {
    marginTop: 8,
    color: "#1C3430",
    lineHeight: 20,
  },

  emptyReportText: {
    textAlign: "center",
    color: "#6A807B",
    paddingVertical: 30,
  },

  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  confirmBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },

  confirmTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#064D3D",
    textAlign: "center",
  },

  confirmText: {
    marginTop: 12,
    textAlign: "center",
    color: "#60706C",
    fontSize: 15,
    lineHeight: 22,
  },

  confirmActions: {
    marginTop: 22,
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#EAF7F3",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#064D3D",
    fontWeight: "800",
    fontSize: 15,
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  crisisReviewBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },

  crisisReviewText: {
    color: "#991B1B",
  },
identityPreview: {
  marginTop: 18,
  borderRadius: 20,
  backgroundColor: "#F0FBF7",
  borderWidth: 1,
  borderColor: "#D8EFE7",
  padding: 14,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

identityAvatar: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: "#D7F2EA",
},

identityInfo: {
  flex: 1,
},

identityLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#00866B",
  textTransform: "uppercase",
},

identityName: {
  marginTop: 3,
  fontSize: 17,
  fontWeight: "900",
  color: "#064D3D",
},

identityMeta: {
  marginTop: 3,
  fontSize: 12,
  lineHeight: 17,
  color: "#6A807B",
  fontWeight: "600",
},

identityEditButton: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#D8EFE7",
},

commentAuthorWrap: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: 9,
},

commentAvatar: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#D7F2EA",
},

commentNameRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
},

commentComposerHint: {
  marginTop: 6,
  marginBottom: 8,
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},

commentComposerHintText: {
  fontSize: 12,
  fontWeight: "800",
  color: "#60706C",
},
identitySettingsCard: {
  marginTop: 16,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#DDEBE7",
  padding: 16,
},

identitySettingsTop: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},


exitAnonymousButton: {
  marginTop: 14,
  minHeight: 48,
  borderRadius: 16,
  backgroundColor: "#FEF2F2",
  borderWidth: 1,
  borderColor: "#FCA5A5",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
},

exitAnonymousText: {
  color: "#DC2626",
  fontSize: 15,
  fontWeight: "900",
},

enableAnonymousButton: {
  marginTop: 14,
  minHeight: 48,
  borderRadius: 16,
  backgroundColor: "#EAF7F3",
  borderWidth: 1,
  borderColor: "#BFE8DC",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
},
anonSubText: {
  marginTop: 3,
  fontSize: 12,
  color: "#7A8A87",
  fontWeight: "600",
  lineHeight: 17,
},
enableAnonymousText: {
  color: "#00866B",
  fontSize: 15,
  fontWeight: "900",
},


identityPreviewAvatar: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: "#D7F2EA",
},

identityPreviewInfo: {
  flex: 1,
},

identityPreviewLabel: {
  fontSize: 12,
  fontWeight: "800",
  color: "#00866B",
  textTransform: "uppercase",
},

identityPreviewName: {
  marginTop: 3,
  fontSize: 17,
  fontWeight: "900",
  color: "#064D3D",
},

identityPreviewMeta: {
  marginTop: 3,
  fontSize: 12,
  lineHeight: 17,
  color: "#6A807B",
  fontWeight: "600",
},


});