const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mood: {
      type: String,
      required: true,
      trim: true,
    },

    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },

    isPrivate: {
      type: Boolean,
      default: true,
    },

    aiInsight: {
      sentiment: {
        type: String,
        enum: ["positive", "neutral", "negative", null],
        default: null,
      },

      emotion: {
        type: String,
        enum: ["positive", "neutral", "negative", null],
        default: null,
      },

      emotionScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      riskLevel: {
        type: String,
        enum: ["low", "medium", "high", null],
        default: null,
      },

      summary: {
        type: String,
        default: null,
      },

      suggestion: {
        type: String,
        default: null,
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    collection: "diaries",
  }
);

diarySchema.index({ userId: 1, createdAt: -1 });
diarySchema.index({ mood: 1 });

module.exports = mongoose.model("Diary", diarySchema);