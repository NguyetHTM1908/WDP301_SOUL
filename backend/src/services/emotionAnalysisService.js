const AiAnalysis = require("../models/AiAnalysis");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const User = require("../models/User");

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[.,!?;:()[\]{}"`~@#$%^&*_+=|\\/<>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(normalizedText, phrase) {
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  const regex = new RegExp(`(^|\\s)${escapeRegExp(normalizedPhrase)}($|\\s)`);
  return regex.test(normalizedText);
}

const severeNegativePhrases = [
  "khong muon song",
  "khong thiet song",
  "khong con muon song",
  "toi ghet song",
  "ghet song",
  "chan song",
  "muon chet",
  "tu tu",
  "muon tu tu",
  "khong con ly do song",
  "muon bien mat",
  "bien mat khoi moi thu",
  "ket thuc moi thu",
  "muon ngu mai khong day",
  "tu lam hai ban than",
  "lam hai ban than",

  "i want to die",
  "i wanna die",
  "i want death",
  "i do not want to live",
  "i dont want to live",
  "i no longer want to live",
  "i wish i was dead",
  "i wish to die",
  "i want to disappear",
  "i want to vanish",
  "i want to end everything",
  "end my life",
  "ending my life",
  "kill myself",
  "i want to kill myself",
  "suicide",
  "suicidal",
  "self harm",
  "hurt myself",
  "i want to hurt myself",
];

const positiveKeywords = [
  "vui",
  "vui ve",
  "hanh phuc",
  "rat vui",
  "vui lam",
  "vui qua",
  "tot",
  "rat tot",
  "on",
  "on hon",
  "kha on",
  "tam on",
  "thoai mai",
  "de chiu",
  "nhe nhom",
  "nhe long",
  "binh yen",
  "binh tam",
  "yen tam",
  "thu gian",
  "an yen",
  "co dong luc",
  "day dong luc",
  "co hy vong",
  "hy vong",
  "lac quan",
  "tich cuc",
  "song tich cuc",
  "muon co gang",
  "se co gang",
  "co niem tin",
  "tin vao ban than",
  "tu tin",
  "manh me hon",
  "tot len",
  "kha hon",
  "do hon",
  "cam thay tot hon",
  "tam trang tot hon",
  "biet on",
  "cam on",
  "tran trong",
  "hai long",
  "tu hao",
  "may man",
  "duoc giup do",
  "duoc dong vien",
  "duoc lang nghe",
  "duoc chia se",
  "duoc yeu thuong",
  "duoc quan tam",
  "hoan thanh",
  "lam duoc",
  "vuot qua",
  "dat duoc",
  "thanh cong",
  "tien bo",
  "on dinh",
  "giai toa",
  "het ap luc",
  "bot ap luc",
  "bot buon",
  "het buon",
  "bot lo",
  "het lo",
  "bot stress",
  "het stress",
  "ngu ngon",
  "nghi ngoi duoc",
  "co nguoi ben canh",
  "co ban be",
  "co gia dinh",
  "duoc an ui",
  "duoc ung ho",
  "duoc support",
  "khong con co don",

  "happy",
  "so happy",
  "joyful",
  "glad",
  "good",
  "better",
  "much better",
  "fine",
  "okay",
  "ok",
  "comfortable",
  "relaxed",
  "calm",
  "peaceful",
  "hopeful",
  "optimistic",
  "positive",
  "motivated",
  "confident",
  "proud",
  "grateful",
  "thankful",
  "blessed",
  "lucky",
  "relieved",
  "safe",
  "supported",
  "loved",
  "cared for",
  "encouraged",
  "i feel better",
  "i feel good",
  "i am okay",
  "i am fine",
  "i can do it",
  "i got this",
  "i feel hopeful",
];

const negativeKeywords = [
  "buon",
  "rat buon",
  "buon qua",
  "dau long",
  "dau kho",
  "khoc",
  "muon khoc",
  "roi nuoc mat",
  "chan",
  "chan nan",
  "chan doi",
  "te",
  "qua te",
  "tam trang te",
  "tam trang xau",
  "khong vui",
  "khong on",
  "bat on",
  "trong rong",
  "mat phuong huong",
  "ap luc",
  "rat ap luc",
  "stress",
  "cang thang",
  "qua tai",
  "met moi",
  "met",
  "rat met",
  "kiet suc",
  "duoi suc",
  "het nang luong",
  "burnout",
  "qua nhieu viec",
  "deadline",
  "khong kip",
  "bi ep",
  "ngop",
  "nghet tho",
  "khong tho noi",
  "lo lang",
  "rat lo",
  "lo so",
  "bat an",
  "so",
  "so hai",
  "hoang mang",
  "hoang loan",
  "panic",
  "run",
  "tim dap nhanh",
  "khong yen tam",
  "nghi nhieu",
  "suy nghi nhieu",
  "overthinking",
  "khong ngu duoc",
  "mat ngu",
  "kho ngu",
  "thuc khuya vi lo",
  "co don",
  "rat co don",
  "mot minh",
  "chi co mot minh",
  "khong ai hieu",
  "khong co ai hieu",
  "khong co ai",
  "khong ai ben canh",
  "bi bo roi",
  "bi bo mac",
  "lac long",
  "khong co ban",
  "khong muon gap ai",
  "khong muon noi chuyen",
  "mat dong luc",
  "khong co dong luc",
  "khong muon lam gi",
  "khong muon hoc",
  "khong muon di hoc",
  "khong muon di lam",
  "khong muon tiep tuc",
  "bo cuoc",
  "muon bo cuoc",
  "bat luc",
  "khong biet phai lam gi",
  "khong thay loi thoat",
  "that vong",
  "tuyet vong",
  "tu ti",
  "kem coi",
  "vo dung",
  "minh vo dung",
  "khong co gia tri",
  "that bai",
  "minh that bai",
  "toi loi",
  "co loi",
  "hoi han",
  "an han",
  "tu trach",
  "ghet ban than",
  "khong thich ban than",
  "ghet song",
  "toi ghet song",
  "tuc gian",
  "gian",
  "buc minh",
  "uc che",
  "kho chiu",
  "noi dien",
  "phan no",
  "khong chiu noi",

  "sad",
  "so sad",
  "very sad",
  "unhappy",
  "depressed",
  "down",
  "empty",
  "lonely",
  "alone",
  "isolated",
  "abandoned",
  "nobody understands me",
  "no one understands me",
  "no one cares",
  "i feel alone",
  "i am alone",
  "tired",
  "exhausted",
  "burned out",
  "burnt out",
  "overwhelmed",
  "stressed",
  "under pressure",
  "too much pressure",
  "anxious",
  "worried",
  "scared",
  "afraid",
  "panicking",
  "i cannot sleep",
  "i cant sleep",
  "insomnia",
  "hopeless",
  "helpless",
  "worthless",
  "useless",
  "i am useless",
  "i am worthless",
  "i hate myself",
  "i hate my life",
  "i hate living",
  "i hate being alive",
  "i give up",
  "i want to give up",
  "i cannot continue",
  "i cant continue",
  "i do not want to continue",
  "i dont want to continue",
  "angry",
  "mad",
  "furious",
  "frustrated",
  "annoyed",
  "guilty",
  "ashamed",
  "regret",
];

const neutralKeywords = [
  "binh thuong",
  "khong co gi dac biet",
  "nhu moi ngay",
  "di hoc",
  "di lam",
  "an com",
  "ngu",
  "lam bai tap",
  "hoc bai",
  "doc sach",
  "nghe nhac",
  "xem phim",
  "di dao",
  "o nha",
  "di choi",
  "noi chuyen",
  "lam viec",
  "tap the duc",
  "hom nay",
  "sang nay",
  "chieu nay",
  "toi nay",
  "minh da",
  "minh vua",
  "minh dang",
  "co mot chut",
  "kha binh thuong",
  "tam thoi on",
  "khong ro",
  "khong biet",
  "chua chac",

  "normal",
  "nothing special",
  "as usual",
  "today",
  "this morning",
  "this afternoon",
  "tonight",
  "i went to school",
  "i went to work",
  "i studied",
  "i did homework",
  "i ate",
  "i slept",
  "i read",
  "i watched a movie",
  "i listened to music",
  "i walked",
  "i stayed home",
  "i talked",
  "i worked",
  "not sure",
  "i do not know",
  "i dont know",
];

const positiveRecoveryPhrases = [
  "khong buon nua",
  "het buon",
  "bot buon",
  "khong con buon",
  "khong stress nua",
  "het stress",
  "bot stress",
  "khong con stress",
  "het ap luc",
  "bot ap luc",
  "do ap luc hon",
  "khong lo nua",
  "het lo",
  "bot lo",
  "khong con lo",
  "khong co don nua",
  "het co don",
  "bot co don",
  "on hon roi",
  "tot hon roi",
  "do hon roi",
  "tam trang tot hon",
  "cam thay tot hon",

  "not sad anymore",
  "i am not sad anymore",
  "im not sad anymore",
  "no longer sad",
  "less sad",
  "not stressed anymore",
  "no longer stressed",
  "less stressed",
  "not anxious anymore",
  "no longer anxious",
  "less anxious",
  "not lonely anymore",
  "no longer lonely",
  "less lonely",
  "i feel better",
  "i am better",
  "im better",
  "i feel okay now",
  "i feel good now",
];

const negativeIntensifiers = [
  "rat",
  "qua",
  "cuc ky",
  "vo cung",
  "that su",
  "that",
  "lien tuc",
  "mai",
  "khong ngung",
  "ngay nao cung",
  "moi ngay",
  "gan day",
  "dao nay",
  "very",
  "so",
  "extremely",
  "really",
  "always",
  "every day",
  "recently",
];

const positiveIntensifiers = [
  "rat",
  "qua",
  "cuc ky",
  "vo cung",
  "that su",
  "that",
  "nhieu",
  "hon truoc",
  "very",
  "so",
  "extremely",
  "really",
  "much",
  "a lot",
];

function countKeywordMatches(normalizedText, keywords) {
  let count = 0;

  for (const keyword of keywords) {
    if (containsPhrase(normalizedText, keyword)) {
      count += 1;
    }
  }

  return count;
}

function countWeightedMatches(normalizedText, keywords, weight = 1) {
  let score = 0;

  for (const keyword of keywords) {
    if (containsPhrase(normalizedText, keyword)) {
      score += weight;
    }
  }

  return score;
}

function hasAnyKeyword(normalizedText, keywords) {
  return keywords.some((keyword) => containsPhrase(normalizedText, keyword));
}

function calculateConfidence(positiveScore, negativeScore, neutralScore) {
  const total = positiveScore + negativeScore + neutralScore;

  if (total === 0) {
    return 60;
  }

  const highest = Math.max(positiveScore, negativeScore, neutralScore);
  const confidence = Math.round((highest / total) * 100);

  return Math.min(95, Math.max(65, confidence));
}

function classifyEmotionByKeyword(text) {
  const normalizedText = normalizeText(text);

  const hasSevereNegative = hasAnyKeyword(
    normalizedText,
    severeNegativePhrases
  );

  if (hasSevereNegative) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 10,
      confidenceScore: 95,
      riskLevel: "high",
      toxicityLevel: "low",
      safetyTriggered: true,
      safetyType: "self_harm_risk",
      summary: "The content shows strong negative emotional signals.",
      suggestion:
        "Encourage the user to seek support from trusted people or professional support if needed.",
    };
  }

  const recoveryCount = countKeywordMatches(
    normalizedText,
    positiveRecoveryPhrases
  );

  let positiveScore = countWeightedMatches(normalizedText, positiveKeywords, 2);
  let negativeScore = countWeightedMatches(normalizedText, negativeKeywords, 2);
  let neutralScore = countWeightedMatches(normalizedText, neutralKeywords, 1);

  const positiveIntensity = countKeywordMatches(
    normalizedText,
    positiveIntensifiers
  );

  const negativeIntensity = countKeywordMatches(
    normalizedText,
    negativeIntensifiers
  );

  if (positiveScore > 0) {
    positiveScore += positiveIntensity;
  }

  if (negativeScore > 0) {
    negativeScore += negativeIntensity;
  }

  if (recoveryCount > 0) {
    positiveScore += recoveryCount * 3;
    negativeScore = Math.max(0, negativeScore - recoveryCount * 2);
  }

  const confidenceScore = calculateConfidence(
    positiveScore,
    negativeScore,
    neutralScore
  );

  if (negativeScore > positiveScore && negativeScore >= 2) {
    const emotionScore = negativeScore >= 8 ? 20 : negativeScore >= 5 ? 30 : 40;
    const riskLevel = negativeScore >= 8 ? "medium" : "low";

    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore,
      confidenceScore,
      riskLevel,
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "The content shows negative emotional signals.",
      suggestion:
        "Encourage the user to rest, reflect, and share feelings with someone they trust.",
    };
  }

  if (positiveScore > negativeScore && positiveScore >= 2) {
    const emotionScore = positiveScore >= 8 ? 90 : positiveScore >= 5 ? 80 : 70;

    return {
      sentiment: "positive",
      emotion: "positive",
      emotionScore,
      confidenceScore,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "The content shows positive emotional signals.",
      suggestion:
        "Encourage the user to maintain healthy routines and positive habits.",
    };
  }

  return {
    sentiment: "neutral",
    emotion: "neutral",
    emotionScore: 50,
    confidenceScore,
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    summary: "The content shows neutral emotional signals.",
    suggestion:
      "Encourage the user to continue tracking their emotions regularly.",
  };
}

function buildAIPrompt(text) {
  return `
You are an emotion analysis service for a mental wellness app.

Analyze the user's text and classify the sentiment as only one of:
positive, neutral, negative.

Return JSON only with this format:
{
  "sentiment": "positive | neutral | negative",
  "emotion": "positive | neutral | negative",
  "emotionScore": number from 0 to 100,
  "confidenceScore": number from 0 to 100,
  "riskLevel": "low | medium | high",
  "toxicityLevel": "low | medium | high",
  "safetyTriggered": boolean,
  "safetyType": null | "self_harm_risk",
  "summary": "short summary",
  "suggestion": "short supportive suggestion"
}

Rules:
- Output sentiment must be only: positive, neutral, negative.
- Output emotion must be the same as sentiment.
- positive means happiness, hope, relief, gratitude, confidence, motivation, or emotional improvement.
- neutral means normal daily activities, factual description, or unclear emotion.
- negative means sadness, stress, anxiety, loneliness, anger, hopelessness, exhaustion, or low motivation.
- If the user expresses self-harm, suicidal thoughts, wanting to die, hating life, or not wanting to live, classify as negative.
- If self-harm risk is detected, set riskLevel to high, safetyTriggered to true, and safetyType to self_harm_risk.
- Do not diagnose the user.
- Do not return markdown.
- Return JSON only.

User text:
"${text}"
`;
}

function extractAIContent(data) {
  if (!data) return null;

  if (typeof data === "string") {
    return data;
  }

  if (data.result) return data.result;
  if (data.text) return data.text;
  if (data.response) return data.response;
  if (data.message) return data.message;
  if (data.content) return data.content;

  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  return null;
}

function normalizeAIResult(parsed) {
  const sentiment = ["positive", "neutral", "negative"].includes(
    parsed.sentiment
  )
    ? parsed.sentiment
    : "neutral";

  const emotionScore = Number(parsed.emotionScore);
  const confidenceScore = Number(parsed.confidenceScore);

  return {
    sentiment,
    emotion: sentiment,
    emotionScore:
      Number.isFinite(emotionScore) && emotionScore >= 0 && emotionScore <= 100
        ? emotionScore
        : sentiment === "positive"
        ? 75
        : sentiment === "negative"
        ? 35
        : 50,
    confidenceScore:
      Number.isFinite(confidenceScore) &&
      confidenceScore >= 0 &&
      confidenceScore <= 100
        ? confidenceScore
        : 80,
    riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "low",
    toxicityLevel: ["low", "medium", "high"].includes(parsed.toxicityLevel)
      ? parsed.toxicityLevel
      : "low",
    safetyTriggered: Boolean(parsed.safetyTriggered),
    safetyType: parsed.safetyTriggered
      ? parsed.safetyType || "self_harm_risk"
      : null,
    summary: parsed.summary || "Emotion analysis completed.",
    suggestion:
      parsed.suggestion ||
      "Encourage the user to continue tracking their emotions regularly.",
  };
}

async function classifyEmotionByAI(text) {
  if (!process.env.AI_EMOTION_API_URL || !process.env.AI_EMOTION_API_KEY) {
    throw new Error("AI emotion API is not configured");
  }

  const prompt = buildAIPrompt(text);

  const response = await fetch(process.env.AI_EMOTION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_EMOTION_API_KEY}`,
    },
    body: JSON.stringify({
      prompt,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI emotion API failed with status ${response.status}`);
  }

  const data = await response.json();

  let content = extractAIContent(data);

  if (!content) {
    throw new Error("AI emotion API returned empty result");
  }

  content = String(content)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(content);

  return normalizeAIResult(parsed);
}

async function classifyEmotionHybrid(text) {
  const normalizedText = normalizeText(text);

  if (hasAnyKeyword(normalizedText, severeNegativePhrases)) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 10,
      confidenceScore: 95,
      riskLevel: "high",
      toxicityLevel: "low",
      safetyTriggered: true,
      safetyType: "self_harm_risk",
      summary: "The content shows strong negative emotional signals.",
      suggestion:
        "Encourage the user to seek support from trusted people or professional support if needed.",
    };
  }

  try {
    return await classifyEmotionByAI(text);
  } catch (error) {
    console.error(
      "AI emotion analysis failed, fallback to keyword:",
      error.message
    );

    return classifyEmotionByKeyword(text);
  }
}

async function updateUserEmotionProfile({
  userId,
  latestAnalysis,
  targetType,
  targetId,
}) {
  const recentAnalyses = await AiAnalysis.find({
    userId,
    analysisType: "emotion_analysis",
  })
    .sort({ analyzedAt: -1 })
    .limit(7);

  const analysisCount = recentAnalyses.length;

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

  const averageEmotionScore =
    analysisCount > 0 ? Math.round(totalScore / analysisCount) : 50;

  let currentSentiment = "neutral";

  if (negativeCount >= 3 || averageEmotionScore < 40) {
    currentSentiment = "negative";
  } else if (positiveCount >= 3 || averageEmotionScore >= 65) {
    currentSentiment = "positive";
  }

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
        analysisCount,
        lastAnalysisId: latestAnalysis._id,
        lastSource: targetType,
        lastSourceId: targetId,
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

async function analyze({
  userId,
  targetType,
  targetId,
  text,
  modelName = "hybrid-emotion-v1",
}) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!targetType) {
    throw new Error("targetType is required");
  }

  if (
    !["chat_message", "diary", "post", "comment", "test_result"].includes(
      targetType
    )
  ) {
    throw new Error("Invalid targetType");
  }

  if (!targetId) {
    throw new Error("targetId is required");
  }

  if (!text || !text.trim()) {
    throw new Error("text is required");
  }

  const result = await classifyEmotionHybrid(text);

  const analysis = await AiAnalysis.create({
    userId,
    target: {
      type: targetType,
      id: targetId,
    },
    analysisType: "emotion_analysis",
    sentiment: result.sentiment,
    emotion: result.emotion,
    emotionScore: result.emotionScore,
    confidenceScore: result.confidenceScore,
    riskLevel: result.riskLevel,
    toxicityLevel: result.toxicityLevel,
    safetyTriggered: result.safetyTriggered,
    safetyType: result.safetyType,
    sourceTextSnapshot: text,
    summary: result.summary,
    suggestion: result.suggestion,
    modelName,
    analyzedAt: new Date(),
    createdAt: new Date(),
  });

  const profile = await updateUserEmotionProfile({
    userId,
    latestAnalysis: analysis,
    targetType,
    targetId,
  });

  return {
    analysisId: analysis._id,
    userId,
    target: analysis.target,
    analysisType: analysis.analysisType,
    sentiment: analysis.sentiment,
    emotion: analysis.emotion,
    emotionScore: analysis.emotionScore,
    confidenceScore: analysis.confidenceScore,
    riskLevel: analysis.riskLevel,
    toxicityLevel: analysis.toxicityLevel,
    safetyTriggered: analysis.safetyTriggered,
    safetyType: analysis.safetyType,
    summary: analysis.summary,
    suggestion: analysis.suggestion,
    currentSentiment: profile.currentSentiment,
    averageEmotionScore: profile.averageEmotionScore,
    analyzedAt: analysis.analyzedAt,
  };
}

async function analyzeFromChat(userId, chatMessageId, messageContent) {
  return analyze({
    userId,
    targetType: "chat_message",
    targetId: chatMessageId,
    text: messageContent,
  });
}

async function analyzeFromDiary(userId, diaryId, diaryContent) {
  return analyze({
    userId,
    targetType: "diary",
    targetId: diaryId,
    text: diaryContent,
  });
}

async function getUserEmotionProfile(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  return UserEmotionProfile.findOne({ userId });
}

async function getUserEmotionHistory(userId, limit = 30) {
  if (!userId) {
    throw new Error("userId is required");
  }

  return AiAnalysis.find({
    userId,
    analysisType: "emotion_analysis",
  })
    .sort({ analyzedAt: -1 })
    .limit(Number(limit));
}

module.exports = {
  analyze,
  analyzeFromChat,
  analyzeFromDiary,
  getUserEmotionProfile,
  getUserEmotionHistory,
};