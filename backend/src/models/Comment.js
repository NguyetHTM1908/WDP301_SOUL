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

const displayAuthorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: null,
    },

    fullName: {
      type: String,
      default: null,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    displayAuthor: {
      type: displayAuthorSchema,
      default: null,
    },

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    content: {
      type: String,
      required: true,
      trim: true,
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

    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },

    statistics: {
      supportCount: { type: Number, default: 0 },
      hugCount: { type: Number, default: 0 },
      encourageCount: { type: Number, default: 0 },
      thankyouCount: { type: Number, default: 0 },
      replyCount: { type: Number, default: 0 },
      reportCount: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ "displayAuthor.id": 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ status: 1 });

module.exports = mongoose.model("Comment", commentSchema);