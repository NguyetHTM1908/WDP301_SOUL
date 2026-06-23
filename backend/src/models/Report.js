const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reportSource: {
      type: String,
      enum: ["user", "system_ai"],
      default: "user",
    },

    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    aiReview: {
      isViolationSuspected: {
        type: Boolean,
        default: false,
      },

      violationType: {
        type: String,
        enum: [
          "toxic_language",
          "hate_speech",
          "harassment",
          "violence",
          "illegal_content",
          "self_harm",
          "sexual_content",
          "spam",
          "other",
          null,
        ],
        default: null,
      },

      severity: {
        type: String,
        enum: ["low", "medium", "high", null],
        default: null,
      },

      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      checkedAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "dismissed",
        "action_taken",
        "appeal_pending",
        "appeal_accepted",
        "appeal_rejected",
      ],
      default: "pending",
    },

    appealReason: {
      type: String,
      default: null,
      trim: true,
    },

    appealRequestedAt: {
      type: Date,
      default: null,
    },

    appealResolvedAt: {
      type: Date,
      default: null,
    },

    appealNote: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ reportSource: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.index(
  { targetType: 1, targetId: 1, reporterId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      reportSource: "user",
      reporterId: { $type: "objectId" },
    },
  }
);

reportSchema.index(
  { targetType: 1, targetId: 1, reportSource: 1 },
  {
    unique: true,
    partialFilterExpression: {
      reportSource: "system_ai",
    },
  }
);

module.exports = mongoose.model("Report", reportSchema);