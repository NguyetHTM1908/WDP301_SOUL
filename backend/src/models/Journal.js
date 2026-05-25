const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    userId: {
      // TODO: Sau khi gắn auth middleware, dùng req.user._id (ObjectId) thay vì userId tạm từ body/query
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mood: {
      type: String,
      trim: true,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

journalSchema.index({ userId: 1 });
journalSchema.index({ createdAt: -1 });
journalSchema.index({ mood: 1 });
journalSchema.index({ isDeleted: 1 });
journalSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

const Journal = mongoose.model("Journal", journalSchema);

module.exports = Journal;
