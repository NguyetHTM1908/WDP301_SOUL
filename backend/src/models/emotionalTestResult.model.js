const mongoose = require("mongoose");

const emotionalTestResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    testType: {
      type: String,
      enum: ["WHO5", "PSS10"],
      required: true,
      index: true,
    },

    testTitle: {
      type: String,
      required: true,
    },

    answers: [
      {
        questionId: {
          type: Number,
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 5,
        },
        calculatedScore: {
          type: Number,
          required: true,
        },
      },
    ],

    rawScore: {
      type: Number,
      required: true,
    },

    percentageScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    level: {
      type: String,
      enum: [
        "good",
        "moderate",
        "low",
        "low_stress",
        "moderate_stress",
        "high_stress",
      ],
      required: true,
    },

    levelLabel: {
      type: String,
      required: true,
    },

    suggestion: {
      type: String,
      required: true,
    },

    disclaimer: {
      type: String,
      default:
        "Kết quả này chỉ nhằm hỗ trợ bạn tự nhìn lại trạng thái cảm xúc, không phải chẩn đoán y khoa hoặc thay thế chuyên gia tâm lý.",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmotionalTestResult", emotionalTestResultSchema);