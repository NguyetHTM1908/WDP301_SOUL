const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    userAId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userBId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "blocked", "removed"],
      required: true,
      default: "active",
    },
    createdFromRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FriendRequest",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

friendshipSchema.index({ userAId: 1 });
friendshipSchema.index({ userBId: 1 });
friendshipSchema.index({ status: 1 });
friendshipSchema.index({ userAId: 1, userBId: 1 }, { unique: true });

module.exports = mongoose.model("Friendship", friendshipSchema, "friendships");
