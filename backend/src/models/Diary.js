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
      min: 0,
      max: 100,
    },

    diaryScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    finalMentalScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    mentalHealthStatus: {
      type: String,
      enum: ["critical", "poor", "fair", "good", "excellent", null],
      default: null,
    },

    moodWeight: {
      type: Number,
      default: 0.5,
    },

    diaryWeight: {
      type: Number,
      default: 0.5,
    },

    sentiment: {
      type: String,
      default: null,
    },

    emotionalIntensity: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    stressLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    anxietyLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    hopelessnessLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    motivationLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "emergency", null],
      default: null,
    },

    generatedAt: {
      type: Date,
      default: null,
    },

    diaryAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiAnalysis",
      default: null,
    },

    note: {
      type: String,
      default: null,
      trim: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
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
        enum: ["low", "medium", "high", "emergency", null],
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