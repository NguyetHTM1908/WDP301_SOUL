const mongoose = require("mongoose");

const testAnswerSchema = new mongoose.Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },

    correctAnswer: {
      type: String,
      default: null,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const emotionalTestResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmotionalTest",
      required: true,
      index: true,
    },

    answers: {
      type: [testAnswerSchema],
      required: true,
      default: [],
    },

    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },

    resultLevel: {
      type: String,
      enum: ["rat_thap", "duoi_trung_binh", "trung_binh", "tot", "xuat_sac"],
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

    nextTestDueAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emotionalTestResultSchema.index({ userId: 1, createdAt: -1 });
emotionalTestResultSchema.index({ testId: 1 });
emotionalTestResultSchema.index({ resultLevel: 1 });

module.exports = mongoose.model(
  "EmotionalTestResult",
  emotionalTestResultSchema,
  "test_results"
);