import { Platform, StyleSheet } from "react-native";

export const adminForumStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4FBF8",
  },

  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#EAF8F3",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00866B",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#064D3D",
  },

  subtitle: {
    fontSize: 15,
    color: "#59736C",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
      },
      default: {
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },

  statValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#00866B",
  },

  statLabel: {
    fontSize: 11,
    color: "#6B7F79",
    marginTop: 4,
    textAlign: "center",
  },

  searchBox: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F332F",
    paddingHorizontal: 10,
    outlineStyle: "none" as any,
  },

  filterRow: {
    gap: 10,
    paddingRight: 20,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBECE3",
  },

  filterChipActive: {
    backgroundColor: "#00866B",
    borderColor: "#00866B",
  },

  filterText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00866B",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  list: {
    padding: 20,
    paddingBottom: 40,
  },

  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
      },
      default: {
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },

  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  authorBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F8F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  authorInfo: {
    flex: 1,
  },

  authorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F332F",
  },

  postDate: {
    fontSize: 12,
    color: "#7A8F89",
    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  postTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#123C35",
    marginBottom: 8,
  },

  postContent: {
    fontSize: 14,
    lineHeight: 21,
    color: "#51645F",
  },

  postMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF3F1",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },

  viewButton: {
    backgroundColor: "#EFF6FF",
  },

  approveButton: {
    backgroundColor: "#E8F8F3",
  },

  hideButton: {
    backgroundColor: "#FFF7E6",
  },

  deleteButton: {
    backgroundColor: "#FEECEC",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "800",
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 70,
    paddingHorizontal: 24,
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064D3D",
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7F79",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
});