const mongoose = require("mongoose");

const REACTION_TYPES = [
  "support",
  "hug",
  "encourage",
  "thankyou",
];

const EMOTION_TYPES = [
  "happy",
  "sad",
  "stress",
  "anxious",
  "angry",
  "neutral",
  "positive",
  "negative",
];

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
  {
    _id: false,
  }
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
  {
    _id: false,
  }
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
  {
    _id: false,
  }
);

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    displayAuthor: {
      type: displayAuthorSchema,
      default: null,
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
      enum: EMOTION_TYPES,
      default: "neutral",
      trim: true,
      lowercase: true,
    },

    hashtags: {
      type: [String],
      default: [],

      set: (tags) =>
        Array.isArray(tags)
          ? tags
              .map((tag) =>
                String(tag)
                  .replace("#", "")
                  .trim()
                  .toLowerCase()
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

    postType: {
      type: String,
      enum: ["forum", "profile"],
      default: "forum",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "hidden",
        "deleted",
      ],
      default: "approved",
    },

    statistics: {
      supportCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      hugCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      encourageCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      thankyouCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      commentCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      reportCount: {
        type: Number,
        default: 0,
        min: 0,
      },
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
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({
  authorId: 1,
});

postSchema.index({
  "displayAuthor.id": 1,
});

postSchema.index({
  hashtags: 1,
});

postSchema.index({
  status: 1,
});

postSchema.index({
  createdAt: -1,
});

postSchema.index({
  isFlagged: 1,
});

postSchema.index({
  toxicityLevel: 1,
});

postSchema.index({
  postType: 1,
  status: 1,
  visibility: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Post",
  postSchema
);