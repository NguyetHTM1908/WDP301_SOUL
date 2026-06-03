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
    score: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmotionalTest",
      required: true,
    },
    answers: [testAnswerSchema],
    totalScore: {
      type: Number,
      required: true,
    },
    resultLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    suggestion: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt for test results history
  }
);

// Indexes
testResultSchema.index({ userId: 1 });
testResultSchema.index({ userId: 1, createdAt: -1 });

const TestResult = mongoose.model("TestResult", testResultSchema, "test_results");

module.exports = TestResult;
