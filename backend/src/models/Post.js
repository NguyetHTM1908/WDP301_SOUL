const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "support", "hug"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    mediaUrls: [mediaSchema],

    emotionStatus: {
      type: String,
      enum: ["happy", "sad", "stress", "anxious", "angry", "neutral"],
      default: "neutral",
    },

    hashtags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden", "deleted"],
      default: "pending",
    },

    statistics: {
      likeCount: { type: Number, default: 0 },
      supportCount: { type: Number, default: 0 },
      hugCount: { type: Number, default: 0 },
      commentCount: { type: Number, default: 0 },
      reportCount: { type: Number, default: 0 },
    },

    isFlagged: {
      type: Boolean,
      default: false,
    },

    toxicityLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    reactions: [reactionSchema],

    editedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

postSchema.index({ authorId: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isFlagged: 1 });

module.exports = mongoose.model("Post", postSchema);