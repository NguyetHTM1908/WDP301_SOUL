const mongoose = require("mongoose");

const dailySummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: "YYYY-MM-DD"
      required: true,
      index: true,
    },
    averageDiaryScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    averageMoodScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    averageFinalMentalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    highestRiskLevel: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low",
    },
    dominantSentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },
    entryCount: {
      type: Number,
      required: true,
      default: 0,
    },
    mentalHealthStatus: {
      type: String,
      enum: ["critical", "poor", "fair", "good", "excellent"],
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailySummary", dailySummarySchema);
