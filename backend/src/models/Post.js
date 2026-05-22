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
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image"],
          default: "image",
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "followers_only", null],
      default: "public",
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
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ authorId: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isFlagged: 1 });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
