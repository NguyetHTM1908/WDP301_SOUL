/**
 * Mental Health Score & Status Helpers
 */

const MOOD_WEIGHT = 0.5;
const DIARY_WEIGHT = 0.5;

/**
 * Converts mood input to 0-100 scale.
 * Strictly idempotent for 0-100 values:
 * normalizeMoodScore(50) -> 50
 * normalizeMoodScore(80) -> 80
 * normalizeMoodScore(100) -> 100
 */
function normalizeMoodScore(moodValue, moodText) {
  const numVal = Number(moodValue);

  if (moodValue !== null && moodValue !== undefined && moodValue !== "" && !isNaN(numVal)) {
    // 1. If value is already on 0-100 scale (> 10)
    if (numVal > 10 && numVal <= 100) {
      return Math.round(numVal);
    }

    // 2. 1-10 UI Picker scale (1->10, 2->20, 3->30, 4->40, 5->50, 6->60, 7->70, 8->80, 9->90, 10->100)
    if (numVal >= 1 && numVal <= 10) {
      return Math.round(numVal * 10);
    }

    if (numVal >= 0 && numVal <= 100) {
      return Math.round(numVal);
    }
  }

  // 4. Try string text interpretation
  const text = String(moodText || moodValue || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]/g, " ");

  if (!text) {
    return null;
  }

  if (text.includes("very bad") || text.includes("terrible") || text.includes("rat te") || text.includes("very sad")) {
    return 20;
  }
  if (text.includes("bad") || text.includes("sad") || text.includes("stress") || text.includes("anxious") || text.includes("te")) {
    return 40;
  }
  if (text.includes("neutral") || text.includes("normal") || text.includes("okay") || text.includes("fine") || text.includes("binh thuong") || text.includes("can bang")) {
    return 60;
  }
  if (text.includes("good") || text.includes("happy") || text.includes("tot") || text.includes("vui") || text.includes("tich cuc")) {
    return 80;
  }
  if (text.includes("excellent") || text.includes("very good") || text.includes("great") || text.includes("rat tot") || text.includes("so happy") || text.includes("tuyet voi")) {
    return 100;
  }

  if (text === "angry") return 30;

  return null;
}

/**
 * Calculates final mental health score combining moodScore and diaryScore (50/50).
 * Math.round(moodScore * 0.5 + diaryScore * 0.5)
 */
function calculateFinalMentalScore(moodScore, diaryScore) {
  const safeMood = normalizeMoodScore(moodScore) ?? 60;

  if (diaryScore === null || diaryScore === undefined || isNaN(Number(diaryScore))) {
    return Math.min(100, Math.max(0, Math.round(safeMood)));
  }

  const normDiary = Math.min(100, Math.max(0, Math.round(Number(diaryScore))));
  const finalScore = Math.round(safeMood * MOOD_WEIGHT + normDiary * DIARY_WEIGHT);

  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Maps finalMentalScore to mentalHealthStatus using exact boundary thresholds:
 * 0–20   -> critical
 * 21–40  -> poor
 * 41–60  -> fair
 * 61–80  -> good
 * 81–100 -> excellent
 */
function getMentalHealthStatus(score) {
  const numScore = Number(score);
  if (isNaN(numScore)) return "fair";

  if (numScore <= 20) return "critical";
  if (numScore <= 40) return "poor";
  if (numScore <= 60) return "fair";
  if (numScore <= 80) return "good";
  return "excellent";
}

/**
 * Determines UI Display Status based on Risk Level priority:
 * 1. riskLevel == emergency -> 🚨 Khẩn cấp
 * 2. riskLevel == high -> 🔴 Nguy cơ cao
 * 3. riskLevel == medium -> 🟠 Cần quan tâm
 * 4. riskLevel == low -> determined by finalMentalScore:
 *    - 81-100 -> 🟢 Rất tốt
 *    - 61-80  -> 🟢 Tốt
 *    - 41-60  -> 🟡 Ổn định
 *    - 21-40  -> 🟠 Cần quan tâm
 *    - 0-20   -> 🔴 Nguy cơ cao
 */
function getDisplayStatus(riskLevel, finalMentalScore) {
  const normRisk = String(riskLevel || "low").toLowerCase().trim();
  const score = Number(finalMentalScore) || 0;

  if (normRisk === "emergency") {
    return {
      key: "emergency",
      label: "🚨 Khẩn cấp",
      color: "#DC2626",
      badgeBg: "#FEE2E2",
      badgeText: "#991B1B",
    };
  }

  if (normRisk === "high") {
    return {
      key: "high_risk",
      label: "🔴 Nguy cơ cao",
      color: "#DC2626",
      badgeBg: "#FEE2E2",
      badgeText: "#991B1B",
    };
  }

  if (normRisk === "medium") {
    return {
      key: "medium_risk",
      label: "🟠 Cần quan tâm",
      color: "#EA580C",
      badgeBg: "#FFEDD5",
      badgeText: "#9A3412",
    };
  }

  if (score >= 81) {
    return {
      key: "excellent",
      label: "🟢 Rất tốt",
      color: "#16A34A",
      badgeBg: "#DCFCE7",
      badgeText: "#166534",
    };
  }

  if (score >= 61) {
    return {
      key: "good",
      label: "🟢 Tốt",
      color: "#16A34A",
      badgeBg: "#DCFCE7",
      badgeText: "#166534",
    };
  }

  if (score >= 41) {
    return {
      key: "fair",
      label: "🟡 Ổn định",
      color: "#D97706",
      badgeBg: "#FEF3C7",
      badgeText: "#92400E",
    };
  }

  if (score >= 21) {
    return {
      key: "poor",
      label: "🟠 Cần quan tâm",
      color: "#EA580C",
      badgeBg: "#FFEDD5",
      badgeText: "#9A3412",
    };
  }

  return {
    key: "critical",
    label: "🔴 Nguy cơ cao",
    color: "#DC2626",
    badgeBg: "#FEE2E2",
    badgeText: "#991B1B",
  };
}

/**
 * Formats API response keeping moodScore, diaryScore, and finalMentalScore strictly separate.
 * Injects displayStatus and displayStatusLabel for frontend rendering.
 */
function formatMentalHealthResponse(diary, analysisResult = null) {
  const rawMoodScore = diary.moodScore;
  const moodScore = normalizeMoodScore(rawMoodScore, diary.mood) ?? 60;

  let diaryScore = null;
  if (diary.diaryScore !== null && diary.diaryScore !== undefined) {
    diaryScore = Number(diary.diaryScore);
  } else if (analysisResult && analysisResult.diaryScore !== undefined && analysisResult.diaryScore !== null) {
    diaryScore = Number(analysisResult.diaryScore);
  } else if (diary.aiInsight && diary.aiInsight.emotionScore !== null && diary.aiInsight.emotionScore !== undefined) {
    diaryScore = Number(diary.aiInsight.emotionScore);
  }

  const finalMentalScore = diary.finalMentalScore !== null && diary.finalMentalScore !== undefined
    ? Number(diary.finalMentalScore)
    : calculateFinalMentalScore(moodScore, diaryScore);

  const mentalHealthStatus = diary.mentalHealthStatus || getMentalHealthStatus(finalMentalScore);

  const sentiment = diary.sentiment || analysisResult?.sentiment || diary.aiInsight?.sentiment || "neutral";
  const emotionalIntensity = diary.emotionalIntensity || analysisResult?.emotionalIntensity || "medium";
  const stressLevel = diary.stressLevel || analysisResult?.stressLevel || "low";
  const anxietyLevel = diary.anxietyLevel || analysisResult?.anxietyLevel || "low";
  const hopelessnessLevel = diary.hopelessnessLevel || analysisResult?.hopelessnessLevel || "low";
  const motivationLevel = diary.motivationLevel || analysisResult?.motivationLevel || "medium";
  const riskLevel = diary.riskLevel || analysisResult?.riskLevel || diary.aiInsight?.riskLevel || "low";

  const displayStatusObj = getDisplayStatus(riskLevel, finalMentalScore);

  return {
    moodScore,
    diaryScore,
    finalMentalScore,
    mentalHealthStatus,
    riskLevel,
    displayStatus: displayStatusObj.key,
    displayStatusLabel: displayStatusObj.label,
    displayStatusInfo: displayStatusObj,
    weights: {
      mood: MOOD_WEIGHT,
      diary: DIARY_WEIGHT,
    },
    analysis: {
      sentiment,
      emotionalIntensity,
      stressLevel,
      anxietyLevel,
      hopelessnessLevel,
      motivationLevel,
      riskLevel,
    },
    generatedAt: diary.generatedAt || diary.updatedAt || diary.createdAt || new Date(),
  };
}

module.exports = {
  MOOD_WEIGHT,
  DIARY_WEIGHT,
  normalizeMoodScore,
  calculateFinalMentalScore,
  getMentalHealthStatus,
  getDisplayStatus,
  formatMentalHealthResponse,
};
