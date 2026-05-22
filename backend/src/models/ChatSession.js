const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isSafetyResponse: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    overallSentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },
    highestRiskLevel: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    messages: [chatMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ "messages._id": 1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema, "chat_sessions");

module.exports = ChatSession;
