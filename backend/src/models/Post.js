const mongoose = require("mongoose");

const REACTION_TYPES = ["support", "hug", "encourage", "thankyou"];

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: REACTION_TYPES,
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
      trim: true,
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

    mediaUrls: {
      type: [mediaSchema],
      default: [],
    },

    emotionStatus: {
      type: String,
      enum: ["happy", "sad", "stress", "anxious", "angry", "neutral"],
      default: "neutral",
    },

    hashtags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags)
          ? tags
              .map((tag) =>
                String(tag).replace("#", "").trim().toLowerCase()
              )
              .filter(Boolean)
          : [],
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    anonymousName: {
      type: String,
      trim: true,
      default: null,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "hidden", "deleted"],
      default: "approved",
    },

    statistics: {
      supportCount: { type: Number, default: 0 },
      hugCount: { type: Number, default: 0 },
      encourageCount: { type: Number, default: 0 },
      thankyouCount: { type: Number, default: 0 },
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

    reactions: {
      type: [reactionSchema],
      default: [],
    },

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
  {
    timestamps: true,
  }
);

postSchema.index({ authorId: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isFlagged: 1 });
postSchema.index({ toxicityLevel: 1 });

module.exports = mongoose.model("Post", postSchema);