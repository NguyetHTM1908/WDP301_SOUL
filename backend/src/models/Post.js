const mongoose =
  require("mongoose");

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

const LIKELIHOOD_TYPES = [
  "UNKNOWN",
  "VERY_UNLIKELY",
  "UNLIKELY",
  "POSSIBLE",
  "LIKELY",
  "VERY_LIKELY",
];

const reactionSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose
            .Schema
            .Types
            .ObjectId,

        ref:
          "User",

        required:
          true,
      },

      type: {
        type:
          String,

        enum:
          REACTION_TYPES,

        required:
          true,
      },

      createdAt: {
        type:
          Date,

        default:
          Date.now,
      },
    },
    {
      _id:
        false,
    }
  );

const mediaSchema =
  new mongoose.Schema(
    {
      url: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      type: {
        type:
          String,

        enum: [
          "image",
          "video",
        ],

        required:
          true,
      },
    },
    {
      _id:
        false,
    }
  );

const displayAuthorSchema =
  new mongoose.Schema(
    {
      id: {
        type:
          String,

        default:
          null,
      },

      fullName: {
        type:
          String,

        default:
          null,

        trim:
          true,
      },

      avatarUrl: {
        type:
          String,

        default:
          null,
      },

      isAnonymous: {
        type:
          Boolean,

        default:
          false,
      },
    },
    {
      _id:
        false,
    }
  );

const googleSafeSearchSchema =
  new mongoose.Schema(
    {
      provider: {
        type:
          String,

        default:
          "google_safe_search",
      },

      checked: {
        type:
          Boolean,

        default:
          false,
      },

      categories: {
        adult: {
          type:
            String,

          enum:
            LIKELIHOOD_TYPES,

          default:
            "UNKNOWN",
        },

        spoof: {
          type:
            String,

          enum:
            LIKELIHOOD_TYPES,

          default:
            "UNKNOWN",
        },

        medical: {
          type:
            String,

          enum:
            LIKELIHOOD_TYPES,

          default:
            "UNKNOWN",
        },

        violence: {
          type:
            String,

          enum:
            LIKELIHOOD_TYPES,

          default:
            "UNKNOWN",
        },

        racy: {
          type:
            String,

          enum:
            LIKELIHOOD_TYPES,

          default:
            "UNKNOWN",
        },
      },

      riskLevel: {
        type:
          String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default:
          "low",
      },

      isViolationSuspected: {
        type:
          Boolean,

        default:
          false,
      },

      needsAdminReview: {
        type:
          Boolean,

        default:
          false,
      },

      reason: {
        type:
          String,

        default:
          null,
      },

      error: {
        type:
          String,

        default:
          null,
      },
    },
    {
      _id:
        false,
    }
  );

const visionAiSchema =
  new mongoose.Schema(
    {
      provider: {
        type:
          String,

        default:
          "vision_ai",
      },

      checked: {
        type:
          Boolean,

        default:
          false,
      },

      selfHarmSuspected: {
        type:
          Boolean,

        default:
          false,
      },

      woundOrBlood: {
        type:
          Boolean,

        default:
          false,
      },

      dangerousObject: {
        type:
          Boolean,

        default:
          false,
      },

      contextType: {
        type:
          String,

        enum: [
          "self_harm",
          "medical",
          "art",
          "violence",
          "safe",
          "unknown",
        ],

        default:
          "unknown",
      },

      confidenceScore: {
        type:
          Number,

        min:
          0,

        max:
          100,

        default:
          0,
      },

      riskLevel: {
        type:
          String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default:
          "low",
      },

      isViolationSuspected: {
        type:
          Boolean,

        default:
          false,
      },

      needsAdminReview: {
        type:
          Boolean,

        default:
          false,
      },

      reason: {
        type:
          String,

        default:
          null,
      },

      description: {
        type:
          String,

        default:
          null,
      },

      error: {
        type:
          String,

        default:
          null,
      },
    },
    {
      _id:
        false,
    }
  );

const imageModerationItemSchema =
  new mongoose.Schema(
    {
      imageUrl: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      checked: {
        type:
          Boolean,

        default:
          false,
      },

      decision: {
        type:
          String,

        enum: [
          "safe",
          "review_required",
          "blocked",
        ],

        default:
          "review_required",
      },

      riskLevel: {
        type:
          String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default:
          "low",
      },

      isViolationSuspected: {
        type:
          Boolean,

        default:
          false,
      },

      needsAdminReview: {
        type:
          Boolean,

        default:
          false,
      },

      reason: {
        type:
          String,

        default:
          null,
      },

      layer1: {
        type:
          googleSafeSearchSchema,

        default:
          () => ({}),
      },

      layer2: {
        type:
          visionAiSchema,

        default:
          () => ({}),
      },

      checkedAt: {
        type:
          Date,

        default:
          Date.now,
      },
    },
    {
      _id:
        false,
    }
  );

const imageModerationSchema =
  new mongoose.Schema(
    {
      checked: {
        type:
          Boolean,

        default:
          false,
      },

      status: {
        type:
          String,

        enum: [
          "not_checked",
          "not_applicable",
          "safe",
          "review_required",
          "blocked",
          "failed",
        ],

        default:
          "not_checked",
      },

      overallRiskLevel: {
        type:
          String,

        enum: [
          "low",
          "medium",
          "high",
        ],

        default:
          "low",
      },

      isViolationSuspected: {
        type:
          Boolean,

        default:
          false,
      },

      needsAdminReview: {
        type:
          Boolean,

        default:
          false,
      },

      reason: {
        type:
          String,

        default:
          null,
      },

      results: {
        type: [
          imageModerationItemSchema,
        ],

        default:
          [],
      },

      checkedAt: {
        type:
          Date,

        default:
          null,
      },
    },
    {
      _id:
        false,
    }
  );

const postSchema =
  new mongoose.Schema(
    {
      authorId: {
        type:
          mongoose
            .Schema
            .Types
            .ObjectId,

        ref:
          "User",

        required:
          true,
      },

      displayAuthor: {
        type:
          displayAuthorSchema,

        default:
          null,
      },

      content: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      mediaUrls: {
        type: [
          mediaSchema,
        ],

        default:
          [],
      },

      imageModeration: {
        type:
          imageModerationSchema,

        default:
          () => ({}),
      },

      emotionStatus: {
        type:
          String,

        enum:
          EMOTION_TYPES,

        default:
          "neutral",

        trim:
          true,

        lowercase:
          true,
      },

      hashtags: {
        type: [
          String,
        ],

        default:
          [],

        set: (tags) =>
          Array.isArray(tags)
            ? tags
                .map(
                  (tag) =>
                    String(tag)
                      .replace(
                        "#",
                        ""
                      )
                      .trim()
                      .toLowerCase()
                )
                .filter(
                  Boolean
                )
            : [],
      },

      isAnonymous: {
        type:
          Boolean,

        default:
          false,
      },

      anonymousName: {
        type:
          String,

        trim:
          true,

        default:
          null,
      },

      visibility: {
        type:
          String,

        enum: [
          "public",
          "private",
        ],

        default:
          "public",
      },

      postType: {
        type:
          String,

        enum: [
          "forum",
          "profile",
        ],

        default:
          "forum",
      },

      status: {
        type:
          String,

        enum: [
          "pending",
          "approved",
          "rejected",
          "hidden",
          "deleted",
        ],

        /*
         * Quan trọng:
         * Bài mới mặc định phải chờ duyệt.
         */
        default:
          "pending",
      },

      statistics: {
        supportCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },

        hugCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },

        encourageCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },

        thankyouCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },

        commentCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },

        reportCount: {
          type:
            Number,

          default:
            0,

          min:
            0,
        },
      },

      isFlagged: {
        type:
          Boolean,

        default:
          false,
      },

      toxicityLevel: {
        type:
          String,

        enum: [
          "low",
          "medium",
          "high",
          null,
        ],

        default:
          null,
      },

      reactions: {
        type: [
          reactionSchema,
        ],

        default:
          [],
      },

      editedAt: {
        type:
          Date,

        default:
          null,
      },

      approvedAt: {
        type:
          Date,

        default:
          null,
      },

      approvedBy: {
        type:
          mongoose
            .Schema
            .Types
            .ObjectId,

        ref:
          "User",

        default:
          null,
      },

      rejectedReason: {
        type:
          String,

        default:
          null,

        trim:
          true,
      },
    },
    {
      timestamps:
        true,
    }
  );

postSchema.index({
  authorId:
    1,
});

postSchema.index({
  "displayAuthor.id":
    1,
});

postSchema.index({
  hashtags:
    1,
});

postSchema.index({
  status:
    1,
});

postSchema.index({
  createdAt:
    -1,
});

postSchema.index({
  isFlagged:
    1,
});

postSchema.index({
  toxicityLevel:
    1,
});

postSchema.index({
  "imageModeration.status":
    1,
});

postSchema.index({
  "imageModeration.overallRiskLevel":
    1,
});

postSchema.index({
  postType:
    1,

  status:
    1,

  visibility:
    1,

  createdAt:
    -1,
});

module.exports =
  mongoose.model(
    "Post",
    postSchema
  );