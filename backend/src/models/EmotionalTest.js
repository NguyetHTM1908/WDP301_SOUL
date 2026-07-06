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
      default: 0,
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

    imageUrl: {
      type: String,
      default: null,
    },

    answerImageUrl: {
      type: String,
      default: null,
    },

    correctAnswer: {
      type: String,
      default: null,
      trim: true,
    },

    explanation: {
      type: String,
      default: null,
    },

    options: {
      type: [testOptionSchema],
      default: [],
    },
  },
  { _id: false }
);

const resultRuleSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["rat_thap", "duoi_trung_binh", "trung_binh", "tot", "xuat_sac"],
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

    title: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: null,
    },

    advice: {
      type: String,
      default: null,
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

    questions: {
      type: [testQuestionSchema],
      default: [],
    },

    resultRules: {
      type: [resultRuleSchema],
      default: [],
    },

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

emotionalTestSchema.index({ isActive: 1 });
emotionalTestSchema.index({ createdBy: 1 });

module.exports = mongoose.model(
  "EmotionalTest",
  emotionalTestSchema,
  "emotional_tests"
);