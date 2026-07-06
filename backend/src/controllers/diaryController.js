const mongoose = require("mongoose");
const Diary = require("../models/Diary");
const AiAnalysis = require("../models/AiAnalysis");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const User = require("../models/User");
const emotionAnalysisService = require("../services/emotionAnalysisService");

function getCurrentUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.userId ||
    req.body.userId ||
    req.query.userId
  );
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildAiInsightFromAnalysis(analysisResult) {
  return {
    sentiment: analysisResult.sentiment,
    emotion: analysisResult.emotion,
    emotionScore: analysisResult.emotionScore,
    riskLevel: analysisResult.riskLevel,
    summary: analysisResult.summary,
    suggestion: analysisResult.suggestion,
    analyzedAt: analysisResult.analyzedAt || new Date(),
  };
}

async function analyzeDiaryAndUpdateInsight(diary, userId) {
  if (!diary.note || !diary.note.trim()) {
    diary.aiInsight = {
      sentiment: null,
      emotion: null,
      emotionScore: null,
      riskLevel: null,
      summary: null,
      suggestion: null,
      analyzedAt: null,
    };

    await diary.save();
    return null;
  }

  const analysisResult = await emotionAnalysisService.analyzeFromDiary(
    userId,
    diary._id,
    diary.note
  );

  diary.aiInsight = buildAiInsightFromAnalysis(analysisResult);

  await diary.save();

  return analysisResult;
}

async function recalculateUserEmotionProfile(userId) {
  const recentAnalyses = await AiAnalysis.find({
    userId,
    analysisType: "emotion_analysis",
  })
    .sort({ analyzedAt: -1 })
    .limit(7);

  if (recentAnalyses.length === 0) {
    const profile = await UserEmotionProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          currentSentiment: "neutral",
          averageEmotionScore: 50,
          latestEmotion: null,
          latestRiskLevel: "low",
          positiveCount: 0,
          neutralCount: 0,
          negativeCount: 0,
          analysisCount: 0,
          lastAnalysisId: null,
          lastSource: null,
          lastSourceId: null,
          lastAnalyzedAt: null,
          isVisibleToOthers: false,
          privacyLevel: "internal_only",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    await User.findByIdAndUpdate(userId, {
      moodReputation: "neutral",
      moodReputationScore: 50,
      moodReputationUpdatedAt: new Date(),
    });

    return profile;
  }

  const positiveCount = recentAnalyses.filter(
    (item) => item.sentiment === "positive"
  ).length;

  const neutralCount = recentAnalyses.filter(
    (item) => item.sentiment === "neutral"
  ).length;

  const negativeCount = recentAnalyses.filter(
    (item) => item.sentiment === "negative"
  ).length;

  const totalScore = recentAnalyses.reduce(
    (sum, item) => sum + item.emotionScore,
    0
  );

  const averageEmotionScore = Math.round(totalScore / recentAnalyses.length);

  let currentSentiment = "neutral";

  if (negativeCount >= 3 || averageEmotionScore <= 40) {
    currentSentiment = "negative";
  } else if (positiveCount >= 3 || averageEmotionScore >= 65) {
    currentSentiment = "positive";
  }

  const latestAnalysis = recentAnalyses[0];

  const profile = await UserEmotionProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        currentSentiment,
        averageEmotionScore,
        latestEmotion: latestAnalysis.emotion,
        latestRiskLevel: latestAnalysis.riskLevel,
        positiveCount,
        neutralCount,
        negativeCount,
        analysisCount: recentAnalyses.length,
        lastAnalysisId: latestAnalysis._id,
        lastSource: latestAnalysis.target.type,
        lastSourceId: latestAnalysis.target.id,
        lastAnalyzedAt: latestAnalysis.analyzedAt,
        isVisibleToOthers: false,
        privacyLevel: "internal_only",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  await User.findByIdAndUpdate(userId, {
    moodReputation: profile.currentSentiment,
    moodReputationScore: profile.averageEmotionScore,
    moodReputationUpdatedAt: new Date(),
  });

  return profile;
}

async function createDiary(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { mood, moodScore, note, isPrivate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!mood || !mood.trim()) {
      return res.status(400).json({
        success: false,
        message: "mood is required",
      });
    }

    if (moodScore === undefined || moodScore === null) {
      return res.status(400).json({
        success: false,
        message: "moodScore is required",
      });
    }

    if (Number(moodScore) < 1 || Number(moodScore) > 10) {
      return res.status(400).json({
        success: false,
        message: "moodScore must be from 1 to 10",
      });
    }

    // 1. Xác định khoảng thời gian của ngày hôm nay theo múi giờ Việt Nam (GMT+7)
    const now = new Date();
    const tzOffset = 7; // GMT+7
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0 - tzOffset, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setUTCHours(23 - tzOffset, 59, 59, 999);

    // 2. Tìm kiếm nhật ký đã tạo hôm nay của user
    let diary = await Diary.findOne({
      userId,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    let analysis = null;
    let analysisWarning = null;
    let isNewDiary = false;

    if (diary) {
      // Đã có nhật ký hôm nay -> Cập nhật/Append nội dung
      const oldNote = diary.note || "";
      const newNotePart = note && note.trim() ? note.trim() : "";
      
      // Append thêm dòng mới nếu nội dung trước đó đã có
      diary.note = oldNote ? `${oldNote}\n${newNotePart}` : newNotePart;
      diary.mood = mood.trim();
      diary.moodScore = Number(moodScore);
      if (isPrivate !== undefined) {
        diary.isPrivate = Boolean(isPrivate);
      }

      await diary.save();

      // Xóa các bản phân tích AI cũ của diary này để tránh trùng lặp/rác dữ liệu
      await AiAnalysis.deleteMany({
        userId,
        "target.type": "diary",
        "target.id": diary._id,
      });

      // Chạy phân tích AI cho toàn bộ nội dung mới sau khi nối
      try {
        analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
      } catch (error) {
        analysisWarning = error.message;
      }
    } else {
      // Chưa có nhật ký hôm nay -> Tạo mới
      isNewDiary = true;
      diary = await Diary.create({
        userId,
        mood: mood.trim(),
        moodScore: Number(moodScore),
        note: note && note.trim() ? note.trim() : null,
        isPrivate: isPrivate === undefined ? false : Boolean(isPrivate),
        aiInsight: {
          sentiment: null,
          emotion: null,
          emotionScore: null,
          riskLevel: null,
          summary: null,
          suggestion: null,
          analyzedAt: null,
        },
      });

      // Phân tích AI
      try {
        analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
      } catch (error) {
        analysisWarning = error.message;
      }
    }

    // 3. Cập nhật lại chỉ số cảm xúc của user (UserEmotionProfile & User.moodReputation)
    await recalculateUserEmotionProfile(userId);

    const updatedDiary = await Diary.findById(diary._id);

    return res.status(isNewDiary ? 201 : 200).json({
      success: true,
      message: isNewDiary ? "Diary created successfully" : "Diary appended and updated successfully",
      data: updatedDiary,
      analysis,
      analysisWarning,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getMyDiaries(req, res) {
  try {
    const userId = getCurrentUserId(req);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = { userId };

    if (req.query.mood) {
      filter.mood = req.query.mood;
    }

    const [diaries, total] = await Promise.all([
      Diary.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Diary.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: diaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getDiaryById(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid diary id",
      });
    }

    const diary = await Diary.findOne({
      _id: id,
      userId,
    });

    if (!diary) {
      return res.status(404).json({
        success: false,
        message: "Diary not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: diary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateDiary(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;
    const { mood, moodScore, note, isPrivate } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid diary id",
      });
    }

    const diary = await Diary.findOne({
      _id: id,
      userId,
    });

    if (!diary) {
      return res.status(404).json({
        success: false,
        message: "Diary not found",
      });
    }

    const oldNote = diary.note || "";

    if (mood !== undefined) {
      if (!mood || !mood.trim()) {
        return res.status(400).json({
          success: false,
          message: "mood cannot be empty",
        });
      }

      diary.mood = mood.trim();
    }

    if (moodScore !== undefined) {
      if (Number(moodScore) < 1 || Number(moodScore) > 10) {
        return res.status(400).json({
          success: false,
          message: "moodScore must be from 1 to 10",
        });
      }

      diary.moodScore = Number(moodScore);
    }

    if (note !== undefined) {
      diary.note = note && note.trim() ? note.trim() : null;
    }

    if (isPrivate !== undefined) {
      diary.isPrivate = Boolean(isPrivate);
    }

    await diary.save();

    let analysis = null;
    let analysisWarning = null;

    const newNote = diary.note || "";
    const noteChanged = note !== undefined && oldNote !== newNote;

    if (noteChanged) {
      await AiAnalysis.deleteMany({
        userId,
        "target.type": "diary",
        "target.id": diary._id,
      });

      try {
        analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
      } catch (error) {
        analysisWarning = error.message;
      }

      await recalculateUserEmotionProfile(userId);
    }

    const updatedDiary = await Diary.findById(diary._id);

    return res.status(200).json({
      success: true,
      message: "Diary updated successfully",
      data: updatedDiary,
      analysis,
      analysisWarning,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteDiary(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid diary id",
      });
    }

    const diary = await Diary.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!diary) {
      return res.status(404).json({
        success: false,
        message: "Diary not found",
      });
    }

    await AiAnalysis.deleteMany({
      userId,
      "target.type": "diary",
      "target.id": diary._id,
    });

    await recalculateUserEmotionProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Diary deleted successfully",
      data: diary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createDiary,
  getMyDiaries,
  getDiaryById,
  updateDiary,
  deleteDiary,
};