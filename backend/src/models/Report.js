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
      required: true,
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

    status: {
      type: String,
      enum: ["pending", "dismissed", "action_taken"],
      default: "pending",
    },
  },
  { timestamps: true }
);

reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedUserId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

reportSchema.index(
  { targetType: 1, targetId: 1, reporterId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Report", reportSchema);