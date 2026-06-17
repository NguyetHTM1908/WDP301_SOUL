const mongoose = require("mongoose");

const userEmotionProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentSentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
      default: "neutral",
    },

    averageEmotionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 50,
    },

    latestEmotion: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },

    latestRiskLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: "low",
    },

    positiveCount: {
      type: Number,
      default: 0,
    },

    neutralCount: {
      type: Number,
      default: 0,
    },

    negativeCount: {
      type: Number,
      default: 0,
    },

    analysisCount: {
      type: Number,
      default: 0,
    },

    lastAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiAnalysis",
      default: null,
    },

    lastSource: {
      type: String,
      enum: ["chat_message", "diary", "post", "comment", "test_result", null],
      default: null,
    },

    lastSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    lastAnalyzedAt: {
      type: Date,
      default: null,
    },

    isVisibleToOthers: {
      type: Boolean,
      default: false,
    },

    privacyLevel: {
      type: String,
      enum: ["private", "internal_only"],
      default: "internal_only",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: "user_emotion_profiles",
  }
);

userEmotionProfileSchema.index({ currentSentiment: 1 });
userEmotionProfileSchema.index({ averageEmotionScore: -1 });
userEmotionProfileSchema.index({ latestRiskLevel: 1 });
userEmotionProfileSchema.index({ lastAnalyzedAt: -1 });

module.exports = mongoose.model("UserEmotionProfile", userEmotionProfileSchema);