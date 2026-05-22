const mongoose = require("mongoose");

const testOptionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const testQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [testOptionSchema],
  },
  { _id: false }
);

const resultRuleSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    minScore: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    suggestion: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const emotionalTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    questions: [testQuestionSchema],
    resultRules: [resultRuleSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
emotionalTestSchema.index({ isActive: 1 });
emotionalTestSchema.index({ createdBy: 1 });

const EmotionalTest = mongoose.model("EmotionalTest", emotionalTestSchema, "emotional_tests");

module.exports = EmotionalTest;
