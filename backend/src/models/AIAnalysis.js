const mongoose = require("mongoose");

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    target: {
      type: {
        type: String,
        enum: ["chat_message", "diary", "post", "comment", "test_result"],
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
    },

    analysisType: {
      type: String,
      enum: ["emotion_analysis", "safety_check", "toxicity_check"],
      required: true,
      default: "emotion_analysis",
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      required: true,
      index: true,
    },

    emotion: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },

    emotionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },

    confidenceScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: "low",
      index: true,
    },

    toxicityLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: "low",
    },

    safetyTriggered: {
      type: Boolean,
      default: false,
      index: true,
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

    sourceTextSnapshot: {
      type: String,
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
      default: "hybrid-emotion-v1",
    },

    analyzedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: "ai_analyses",
  }
);

aiAnalysisSchema.index({ userId: 1, analyzedAt: -1 });
aiAnalysisSchema.index({ "target.type": 1, "target.id": 1 });

module.exports = mongoose.model("AiAnalysis", aiAnalysisSchema);