import { StyleSheet } from "react-native";

export const forumStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5FBF9",
  },

  header: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 22,
    backgroundColor: "#DFF7EF",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#123D36",
  },

  subtitle: {
    marginTop: 8,
    color: "#4B7D73",
    fontSize: 15,
    lineHeight: 22,
  },

  createButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#2A9D8F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2A9D8F",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 5,
  },

  searchBox: {
    marginTop: 22,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#123D36",
  },

  filterRow: {
    paddingVertical: 18,
    paddingLeft: 20,
    gap: 10,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D8EFE8",
  },

  chipActive: {
    backgroundColor: "#2A9D8F",
    borderColor: "#2A9D8F",
  },

  chipText: {
    color: "#4B7D73",
    fontWeight: "700",
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#0B3D35",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "#DFF7EF",
  },

  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#123D36",
  },

  time: {
    marginTop: 3,
    color: "#8AA7A0",
    fontSize: 12,
  },

  moodPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFF4D8",
  },

  moodText: {
    color: "#A86B00",
    fontWeight: "800",
    fontSize: 12,
  },

  content: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#263F3A",
  },

  media: {
    marginTop: 14,
    width: "100%",
    height: 190,
    borderRadius: 22,
    backgroundColor: "#EDF8F5",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF9F6",
  },

  tagText: {
    color: "#2A9D8F",
    fontWeight: "700",
    fontSize: 12,
  },

  actionRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEF3F1",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionText: {
    color: "#55736D",
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18,61,54,0.35)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#123D36",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#F4FAF8",
    borderRadius: 18,
    padding: 14,
    minHeight: 110,
    textAlignVertical: "top",
    color: "#123D36",
    fontSize: 15,
  },

  smallInput: {
    marginTop: 12,
    backgroundColor: "#F4FAF8",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    color: "#123D36",
  },

  submitButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2A9D8F",
    alignItems: "center",
    justifyContent: "center",
  },

  submitText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },

  cancelText: {
    textAlign: "center",
    marginTop: 14,
    color: "#78958E",
    fontWeight: "700",
  },
});