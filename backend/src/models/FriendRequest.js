const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      required: true,
      default: "pending",
    },
    source: {
      type: String,
      enum: ["manual", "friend_recommendation", null],
      default: null,
    },
    recommendationReason: {
      type: String,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

friendRequestSchema.index({ requesterId: 1 });
friendRequestSchema.index({ receiverId: 1 });
friendRequestSchema.index({ status: 1 });
friendRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("FriendRequest", friendRequestSchema, "friend_requests");
