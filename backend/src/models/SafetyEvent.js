const mongoose = require("mongoose");

const safetyEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
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
    riskLevel: {
      type: String,
      enum: ["medium", "high"],
      required: true,
    },
    safetyType: {
      type: String,
      enum: [
        "self_harm_risk",
        "suicidal_intent",
        "hopelessness",
        "panic_crisis",
        "medical_advice_request",
        "medication_request",
        "violence_risk",
      ],
      required: true,
    },
    detectedText: {
      type: String,
      default: null,
    },
    systemAction: {
      type: String,
      enum: [
        "show_safety_response",
        "block_ai_response",
        "suggest_human_support",
        "notify_admin_review",
      ],
      required: true,
    },
    safetyMessage: {
      type: String,
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
safetyEventSchema.index({ userId: 1 });
safetyEventSchema.index({ riskLevel: 1 });
safetyEventSchema.index({ safetyType: 1 });
safetyEventSchema.index({ isResolved: 1 });
safetyEventSchema.index({ createdAt: -1 });

const SafetyEvent = mongoose.model("SafetyEvent", safetyEventSchema, "safety_events");

module.exports = SafetyEvent;
