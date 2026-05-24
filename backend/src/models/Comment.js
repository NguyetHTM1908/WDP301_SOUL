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

    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },

    statistics: {
      likeCount: { type: Number, default: 0 },
      supportCount: { type: Number, default: 0 },
      hugCount: { type: Number, default: 0 },
      reportCount: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ status: 1 });

module.exports = mongoose.model("Comment", commentSchema);