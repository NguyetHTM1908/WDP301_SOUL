const Diary = require("../models/Diary");
const DailySummary = require("../models/DailySummary");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const User = require("../models/User");
const {
  getMentalHealthStatus,
  getDisplayStatus,
  normalizeMoodScore,
  calculateFinalMentalScore,
} = require("../utils/mentalHealthHelper");

const RISK_PRIORITY = {
  emergency: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function getCalendarDateString(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const tzOffsetMs = 7 * 60 * 60 * 1000;
  const localDate = new Date(d.getTime() + tzOffsetMs);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartAndEndOfDay(dateStr) {
  const parts = dateStr.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  const start = new Date(Date.UTC(year, month - 1, day, 0 - 7, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day, 23 - 7, 59, 59, 999));
  return { start, end };
}

/**
 * Level 2: Recalculate Daily Summary for a single user on a specific calendar day.
 * Triggered whenever a diary entry is created, edited, or deleted on that day.
 */
async function recalculateDailySummary(userId, dateInput) {
  if (!userId) return null;

  const dateStr =
    typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? dateInput
      : getCalendarDateString(dateInput);

  const { start, end } = getStartAndEndOfDay(dateStr);

  const dayDiaries = await Diary.find({
    userId,
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: 1 });

  if (dayDiaries.length === 0) {
    await DailySummary.deleteOne({ userId, date: dateStr });
    return null;
  }

  const entryCount = dayDiaries.length;

  // 1. Mood Scores
  const normalizedMoodScores = dayDiaries.map(
    (d) => normalizeMoodScore(d.moodScore, d.mood) ?? 60
  );
  const totalMood = normalizedMoodScores.reduce((sum, s) => sum + s, 0);
  const averageMoodScore = Math.round(totalMood / entryCount);

  // 2. Diary AI Scores
  const validDiaryScores = dayDiaries
    .map((d) => d.diaryScore)
    .filter((s) => s !== null && s !== undefined && !Number.isNaN(Number(s)));

  const averageDiaryScore =
    validDiaryScores.length > 0
      ? Math.round(
          validDiaryScores.reduce((sum, s) => sum + Number(s), 0) /
            validDiaryScores.length
        )
      : null;

  // 3. Final Mental Scores
  const finalMentalScores = dayDiaries.map((d) => {
    if (d.finalMentalScore !== null && d.finalMentalScore !== undefined) {
      return d.finalMentalScore;
    }
    const normMood = normalizeMoodScore(d.moodScore, d.mood) ?? 60;
    const normDiary =
      d.diaryScore !== null && d.diaryScore !== undefined ? d.diaryScore : null;
    return calculateFinalMentalScore(normMood, normDiary);
  });

  const totalFinalMental = finalMentalScores.reduce((sum, s) => sum + s, 0);
  const averageFinalMentalScore = Math.round(totalFinalMental / entryCount);

  // 4. Highest Risk Level
  let highestRiskLevel = "low";
  for (const d of dayDiaries) {
    const r = d.riskLevel || d.aiInsight?.riskLevel || "low";
    if ((RISK_PRIORITY[r] || 1) > (RISK_PRIORITY[highestRiskLevel] || 1)) {
      highestRiskLevel = r;
    }
  }

  // 5. Dominant Sentiment (tie breaker: negative > positive > neutral)
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  for (const d of dayDiaries) {
    const s = d.sentiment || d.aiInsight?.sentiment || "neutral";
    if (sentimentCounts[s] !== undefined) {
      sentimentCounts[s]++;
    } else {
      sentimentCounts.neutral++;
    }
  }

  let dominantSentiment = "neutral";
  let maxCount = sentimentCounts.neutral;

  if (sentimentCounts.positive > maxCount) {
    maxCount = sentimentCounts.positive;
    dominantSentiment = "positive";
  }

  if (sentimentCounts.negative >= maxCount && sentimentCounts.negative > 0) {
    dominantSentiment = "negative";
  }

  // 6. Mental Health Status & Display Status
  const mentalHealthStatus = getMentalHealthStatus(averageFinalMentalScore);
  const displayStatusObj = getDisplayStatus(highestRiskLevel, averageFinalMentalScore);

  const summary = await DailySummary.findOneAndUpdate(
    { userId, date: dateStr },
    {
      $set: {
        userId,
        date: dateStr,
        averageDiaryScore,
        averageMoodScore,
        averageFinalMentalScore,
        highestRiskLevel,
        dominantSentiment,
        entryCount,
        mentalHealthStatus,
        displayStatus: displayStatusObj.key,
        displayStatusLabel: displayStatusObj.label,
        generatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  return summary;
}

/**
 * Level 3: Recalculate User Profile by averaging Daily Summaries across days.
 * Prevents multiple diary entries on a single day from dominating the long-term trend.
 */
async function recalculateUserProfileFromDailySummaries(userId) {
  if (!userId) return null;

  const recentSummaries = await DailySummary.find({ userId })
    .sort({ date: -1 })
    .limit(30);

  if (recentSummaries.length === 0) {
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
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(userId, {
      moodReputation: "neutral",
      moodReputationScore: 50,
      moodReputationUpdatedAt: new Date(),
    });

    return profile;
  }

  const totalScore = recentSummaries.reduce(
    (sum, s) => sum + s.averageFinalMentalScore,
    0
  );
  const averageEmotionScore = Math.round(totalScore / recentSummaries.length);

  const positiveCount = recentSummaries.filter(
    (s) => s.dominantSentiment === "positive"
  ).length;
  const neutralCount = recentSummaries.filter(
    (s) => s.dominantSentiment === "neutral"
  ).length;
  const negativeCount = recentSummaries.filter(
    (s) => s.dominantSentiment === "negative"
  ).length;

  let currentSentiment = "neutral";
  if (negativeCount >= 3 || averageEmotionScore <= 40) {
    currentSentiment = "negative";
  } else if (positiveCount >= 3 || averageEmotionScore >= 65) {
    currentSentiment = "positive";
  }

  const latestSummary = recentSummaries[0];

  const profile = await UserEmotionProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        currentSentiment,
        averageEmotionScore,
        latestEmotion: latestSummary.dominantSentiment || null,
        latestRiskLevel: latestSummary.highestRiskLevel || "low",
        positiveCount,
        neutralCount,
        negativeCount,
        analysisCount: recentSummaries.length,
        lastSource: "daily_summary",
        lastAnalyzedAt: latestSummary.generatedAt || new Date(),
        isVisibleToOthers: false,
        privacyLevel: "internal_only",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  await User.findByIdAndUpdate(userId, {
    moodReputation: profile.currentSentiment,
    moodReputationScore: profile.averageEmotionScore,
    moodReputationUpdatedAt: new Date(),
  });

  return profile;
}

module.exports = {
  getCalendarDateString,
  getStartAndEndOfDay,
  recalculateDailySummary,
  recalculateUserProfileFromDailySummaries,
};
