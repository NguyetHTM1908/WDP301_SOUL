const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    emotion: {
      type: String,
      default: "neutral",
    },

    riskLevel: {
  type: String,
  enum: ["low", "medium", "high", "emergency", "unknown"],
  default: "low",
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);