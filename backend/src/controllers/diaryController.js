const mongoose = require("mongoose");
const Diary = require("../models/Diary");
const AiAnalysis = require("../models/AiAnalysis");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const User = require("../models/User");
const DailySummary = require("../models/DailySummary");
const emotionAnalysisService = require("../services/emotionAnalysisService");
const {
  getCalendarDateString,
  getStartAndEndOfDay,
  recalculateDailySummary,
  recalculateUserProfileFromDailySummaries,
} = require("../services/dailySummaryService");
const {
  normalizeMoodScore,
  calculateFinalMentalScore,
  getMentalHealthStatus,
  formatMentalHealthResponse,
} = require("../utils/mentalHealthHelper");

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
    emotionScore: analysisResult.diaryScore ?? analysisResult.emotionScore,
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

    diary.diaryScore = null;
    await diary.save();
    return null;
  }

  const analysisResult = await emotionAnalysisService.analyzeFromDiary(
    userId,
    diary._id,
    diary.note
  );

  diary.aiInsight = buildAiInsightFromAnalysis(analysisResult);
  diary.diaryScore = analysisResult.diaryScore ?? analysisResult.emotionScore;
  diary.diaryAnalysisId = analysisResult.analysisId || null;
  diary.sentiment = analysisResult.sentiment || "neutral";
  diary.emotionalIntensity = analysisResult.emotionalIntensity || "medium";
  diary.stressLevel = analysisResult.stressLevel || "low";
  diary.anxietyLevel = analysisResult.anxietyLevel || "low";
  diary.hopelessnessLevel = analysisResult.hopelessnessLevel || "low";
  diary.motivationLevel = analysisResult.motivationLevel || "medium";
  diary.riskLevel = analysisResult.riskLevel || "low";
  diary.generatedAt = new Date();

  await diary.save();

  return analysisResult;
}

async function createDiary(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { mood, moodScore: rawMoodScore, note, isPrivate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!mood || !String(mood).trim()) {
      return res.status(400).json({
        success: false,
        message: "mood is required",
      });
    }

    if (rawMoodScore === undefined || rawMoodScore === null) {
      return res.status(400).json({
        success: false,
        message: "moodScore is required",
      });
    }

    const normMoodScore = normalizeMoodScore(rawMoodScore, mood);
    if (normMoodScore === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid moodScore value",
      });
    }

    // Timezone GMT+7 today start/end
    const now = new Date();
    const dateStr = getCalendarDateString(now);
    const { start: startOfToday, end: endOfToday } = getStartAndEndOfDay(dateStr);

    let diary = await Diary.findOne({
      userId,
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    let analysis = null;
    let analysisWarning = null;
    let isNewDiary = false;

    if (diary) {
      const oldNote = diary.note || "";
      const newNotePart = note && String(note).trim() ? String(note).trim() : "";

      diary.note = oldNote ? `${oldNote}\n${newNotePart}` : newNotePart;
      diary.mood = String(mood).trim();
      diary.moodScore = normMoodScore; // Store 0-100 normalized score
      if (isPrivate !== undefined) {
        diary.isPrivate = Boolean(isPrivate);
      }

      await diary.save();

      await AiAnalysis.deleteMany({
        userId,
        "target.type": "diary",
        "target.id": diary._id,
      });

      if (diary.note && diary.note.trim()) {
        try {
          analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
        } catch (error) {
          analysisWarning = error.message;
        }
      } else {
        diary.diaryScore = null;
      }
    } else {
      isNewDiary = true;
      diary = await Diary.create({
        userId,
        mood: String(mood).trim(),
        moodScore: normMoodScore,
        note: note && String(note).trim() ? String(note).trim() : null,
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

      if (diary.note && diary.note.trim()) {
        try {
          analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
        } catch (error) {
          analysisWarning = error.message;
        }
      } else {
        diary.diaryScore = null;
      }
    }

    // Determine diaryScore from direct analysis or same day analysis
    let resolvedDiaryScore = diary.diaryScore;
    if (resolvedDiaryScore === null || resolvedDiaryScore === undefined) {
      const sameDayAnalysis = await AiAnalysis.findOne({
        userId,
        "target.type": "diary",
        analyzedAt: { $gte: startOfToday, $lte: endOfToday },
      }).sort({ analyzedAt: -1 });

      if (sameDayAnalysis) {
        resolvedDiaryScore = sameDayAnalysis.emotionScore;
        diary.diaryScore = resolvedDiaryScore;
        diary.diaryAnalysisId = sameDayAnalysis._id;
        diary.sentiment = sameDayAnalysis.sentiment;
        diary.riskLevel = sameDayAnalysis.riskLevel;
      }
    }

    // Compute 50/50 Mental Health Score & Status for Level 1 Diary
    diary.finalMentalScore = calculateFinalMentalScore(normMoodScore, resolvedDiaryScore);
    diary.mentalHealthStatus = getMentalHealthStatus(diary.finalMentalScore);
    diary.moodWeight = 0.5;
    diary.diaryWeight = 0.5;
    diary.generatedAt = new Date();

    await diary.save();

    console.log("[Mental Health Score]", {
      rawMoodValue: rawMoodScore,
      normalizedMoodScore: normMoodScore,
      diaryScore: resolvedDiaryScore,
      finalMentalScore: diary.finalMentalScore,
    });

    // Trigger Level 2 (Daily Summary) and Level 3 (User Profile) Aggregations
    const dailySummary = await recalculateDailySummary(userId, dateStr);
    await recalculateUserProfileFromDailySummaries(userId);

    const updatedDiary = await Diary.findById(diary._id);
    const mentalHealthResponse = formatMentalHealthResponse(updatedDiary, analysis);

    return res.status(isNewDiary ? 201 : 200).json({
      success: true,
      message: isNewDiary ? "Diary created successfully" : "Diary appended and updated successfully",
      data: updatedDiary,
      mentalHealth: mentalHealthResponse,
      dailySummary,
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

    const filter = { userId };

    if (req.query.mood) {
      filter.mood = req.query.mood;
    }

    const rawDiaries = await Diary.find(filter).sort({ createdAt: -1 });

    const RISK_PRIORITY = { emergency: 4, high: 3, medium: 2, low: 1 };
    const dayGroups = new Map();

    for (const d of rawDiaries) {
      const dateStr = getCalendarDateString(d.createdAt);
      if (!dayGroups.has(dateStr)) {
        dayGroups.set(dateStr, []);
      }
      dayGroups.get(dateStr).push(d);
    }

    const allFormattedDays = [];

    for (const [dateStr, group] of dayGroups.entries()) {
      const primaryEntry = group[0];
      const entryCount = group.length;

      const normalizedMoodScores = group.map((item) => normalizeMoodScore(item.moodScore, item.mood) ?? 60);
      const totalMood = normalizedMoodScores.reduce((sum, s) => sum + s, 0);
      const avgMoodScore = Math.round(totalMood / entryCount);

      const validDiaryScores = group
        .map((item) => item.diaryScore)
        .filter((s) => s !== null && s !== undefined && !isNaN(Number(s)));

      const avgDiaryScore =
        validDiaryScores.length > 0
          ? Math.round(validDiaryScores.reduce((sum, s) => sum + Number(s), 0) / validDiaryScores.length)
          : null;

      const finalMentalScores = group.map((item) => {
        if (item.finalMentalScore !== null && item.finalMentalScore !== undefined) {
          return item.finalMentalScore;
        }
        const normMood = normalizeMoodScore(item.moodScore, item.mood) ?? 60;
        return calculateFinalMentalScore(normMood, item.diaryScore);
      });

      const totalFinalMental = finalMentalScores.reduce((sum, s) => sum + s, 0);
      const avgFinalMentalScore = Math.round(totalFinalMental / entryCount);

      let highestRiskLevel = "low";
      for (const item of group) {
        const r = item.riskLevel || item.aiInsight?.riskLevel || "low";
        if ((RISK_PRIORITY[r] || 1) > (RISK_PRIORITY[highestRiskLevel] || 1)) {
          highestRiskLevel = r;
        }
      }

      const mh = formatMentalHealthResponse(
        {
          ...primaryEntry.toObject(),
          moodScore: avgMoodScore,
          diaryScore: avgDiaryScore,
          finalMentalScore: avgFinalMentalScore,
          riskLevel: highestRiskLevel,
        },
        primaryEntry.aiInsight
      );

      const doc = primaryEntry.toObject();
      allFormattedDays.push({
        ...doc,
        moodScore: avgMoodScore,
        diaryScore: avgDiaryScore,
        finalMentalScore: avgFinalMentalScore,
        mentalHealth: mh,
        entryCount,
      });
    }

    const total = allFormattedDays.length;
    const skip = (page - 1) * limit;
    const paginatedDays = allFormattedDays.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      data: paginatedDays,
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

    const mh = formatMentalHealthResponse(diary);
    const doc = diary.toObject();

    return res.status(200).json({
      success: true,
      data: {
        ...doc,
        mentalHealth: mh,
      },
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
    const { mood, moodScore: rawMoodScore, note, isPrivate } = req.body;

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

    const oldDateStr = getCalendarDateString(diary.createdAt);
    const oldNote = diary.note || "";

    if (mood !== undefined) {
      if (!mood || !String(mood).trim()) {
        return res.status(400).json({
          success: false,
          message: "mood cannot be empty",
        });
      }
      diary.mood = String(mood).trim();
    }

    if (rawMoodScore !== undefined) {
      const normScore = normalizeMoodScore(rawMoodScore, mood || diary.mood);
      if (normScore === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid moodScore value",
        });
      }
      diary.moodScore = normScore;
    } else {
      diary.moodScore = normalizeMoodScore(diary.moodScore, diary.mood) ?? 60;
    }

    if (note !== undefined) {
      diary.note = note && String(note).trim() ? String(note).trim() : null;
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

      if (newNote.trim()) {
        try {
          analysis = await analyzeDiaryAndUpdateInsight(diary, userId);
        } catch (error) {
          analysisWarning = error.message;
        }
      } else {
        diary.diaryScore = null;
        diary.aiInsight = {
          sentiment: null,
          emotion: null,
          emotionScore: null,
          riskLevel: null,
          summary: null,
          suggestion: null,
          analyzedAt: null,
        };
      }
    }

    // Re-compute 50/50 Mental Health Score & Status
    const resolvedDiaryScore = diary.diaryScore;
    diary.finalMentalScore = calculateFinalMentalScore(diary.moodScore, resolvedDiaryScore);
    diary.mentalHealthStatus = getMentalHealthStatus(diary.finalMentalScore);
    diary.generatedAt = new Date();

    await diary.save();

    console.log("[Mental Health Score Update]", {
      rawMoodValue: rawMoodScore,
      normalizedMoodScore: diary.moodScore,
      diaryScore: resolvedDiaryScore,
      finalMentalScore: diary.finalMentalScore,
    });

    // Trigger Level 2 (Daily Summary) and Level 3 (User Profile) Aggregations
    const newDateStr = getCalendarDateString(diary.createdAt);
    const dailySummary = await recalculateDailySummary(userId, oldDateStr);
    if (oldDateStr !== newDateStr) {
      await recalculateDailySummary(userId, newDateStr);
    }
    await recalculateUserProfileFromDailySummaries(userId);

    const updatedDiary = await Diary.findById(diary._id);
    const mentalHealthResponse = formatMentalHealthResponse(updatedDiary, analysis);

    return res.status(200).json({
      success: true,
      message: "Diary updated successfully",
      data: updatedDiary,
      mentalHealth: mentalHealthResponse,
      dailySummary,
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

    const dateStr = getCalendarDateString(diary.createdAt);

    await Diary.deleteOne({ _id: id, userId });

    await AiAnalysis.deleteMany({
      userId,
      "target.type": "diary",
      "target.id": id,
    });

    // Trigger Level 2 (Daily Summary) and Level 3 (User Profile) Aggregations
    const dailySummary = await recalculateDailySummary(userId, dateStr);
    await recalculateUserProfileFromDailySummaries(userId);

    return res.status(200).json({
      success: true,
      message: "Diary deleted successfully",
      data: diary,
      dailySummary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getDailySummaries(req, res) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const summaries = await DailySummary.find({ userId })
      .sort({ date: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: summaries,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getDailySummaryByDate(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const dateStr = req.params.date || req.query.date;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({
        success: false,
        message: "Valid date parameter (YYYY-MM-DD) is required",
      });
    }

    const summary = await DailySummary.findOne({ userId, date: dateStr });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Daily summary not found for this date",
      });
    }

    return res.status(200).json({
      success: true,
      data: summary,
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
  getDailySummaries,
  getDailySummaryByDate,
};