const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: {
        type: String,
        enum: ["chat_message", "diary", "post", "comment"],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },
    emotion: {
      type: String,
      default: null,
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },
    toxicityLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },
    safetyTriggered: {
      type: Boolean,
      default: false,
    },
    safetyType: {
      type: String,
      enum: [
        "self_harm_risk",
        "suicidal_intent",
        "medical_advice_request",
        "medication_request",
        "violence_risk",
        "toxic_content",
        null,
      ],
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
    modelName: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for AI analysis logs
  }
);

// Indexes
aiAnalysisSchema.index({ userId: 1 });
aiAnalysisSchema.index({ "target.type": 1, "target.id": 1 });
aiAnalysisSchema.index({ riskLevel: 1 });
aiAnalysisSchema.index({ safetyTriggered: 1 });

const AIAnalysis = mongoose.model("AIAnalysis", aiAnalysisSchema, "ai_analyses");

module.exports = AIAnalysis;
