const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
  {
    target: {
      type: {
        type: String,
        enum: ["post", "comment", "user", "report"],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    action: {
      type: String,
      enum: [
        "hide_content",
        "delete_content",
        "restore_content",
        "warn_user",
        "block_user",
        "resolve_report",
        "reject_report",
      ],
      required: true,
    },
    reason: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Moderation logs are append-only histories
  }
);

// Indexes
moderationLogSchema.index({ "target.type": 1, "target.id": 1 });
moderationLogSchema.index({ performedBy: 1 });
moderationLogSchema.index({ action: 1 });
moderationLogSchema.index({ createdAt: -1 });

const ModerationLog = mongoose.model("ModerationLog", moderationLogSchema, "moderation_logs");

module.exports = ModerationLog;
