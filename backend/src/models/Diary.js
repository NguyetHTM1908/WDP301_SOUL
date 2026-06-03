const mongoose = require("mongoose");

const aiInsightSchema = new mongoose.Schema(
  {
    emotion: {
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
  },
  { _id: false } // No separate _id for this embedded subdocument
);

const diarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
      trim: true,
    },
    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    aiInsight: {
      type: aiInsightSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
diarySchema.index({ userId: 1 });
diarySchema.index({ userId: 1, createdAt: -1 });

const Diary = mongoose.model("Diary", diarySchema);

module.exports = Diary;
