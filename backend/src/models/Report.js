const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: {
        type: String,
        enum: ["post", "comment", "user"],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      required: true,
      default: "pending",
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNote: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reportSchema.index({ reporterId: 1 });
reportSchema.index({ "target.type": 1, "target.id": 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
