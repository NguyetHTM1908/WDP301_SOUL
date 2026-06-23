const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notification");

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:()[\]{}"'`~@#$%^&*_+=|\\/<>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const selfHarmKeywords = [
  "muốn chết",
  "muon chet",
  "tôi muốn chết",
  "toi muon chet",
  "mình muốn chết",
  "minh muon chet",
  "em muốn chết",
  "em muon chet",
  "tự tử",
  "tu tu",
  "muốn tự tử",
  "muon tu tu",
  "không muốn sống",
  "khong muon song",
  "không muốn tồn tại",
  "khong muon ton tai",
  "chết đi cho rồi",
  "chet di cho roi",
  "i want to die",
  "i wanna die",
  "kill myself",
  "suicide",
];

const illegalKeywords = [
  "mua ma túy",
  "mua ma tuy",
  "bán ma túy",
  "ban ma tuy",
  "hack tài khoản",
  "hack tai khoan",
  "lừa đảo",
  "lua dao",
  "cá độ",
  "ca do",
];

const harassmentKeywords = [
  "tao sẽ đánh",
  "tao se danh",
  "đe dọa",
  "de doa",
  "mày chết đi",
  "may chet di",
  "go kill yourself",
];

const toxicKeywords = [
  "đồ ngu",
  "do ngu",
  "ngu",
  "óc chó",
  "oc cho",
  "cút",
  "cut",
  "đm",
  "dm",
  "vcl",
  "vl",
  "fuck",
  "shit",
  "bitch",
  "stupid",
  "idiot",
];

function includesAny(normalizedText, keywords) {
  return keywords.some((keyword) =>
    normalizedText.includes(normalizeText(keyword))
  );
}

function checkForumContentByKeyword(text) {
  const normalizedText = normalizeText(text);

  if (includesAny(normalizedText, selfHarmKeywords)) {
    return {
      isViolationSuspected: true,
      violationType: "self_harm",
      severity: "high",
      confidenceScore: 98,
      reason: "AI phát hiện nội dung có dấu hiệu nguy cơ tự làm hại bản thân.",
      description:
        "Bài viết có nội dung nhạy cảm liên quan đến mong muốn chết, tự tử hoặc không muốn tiếp tục sống. Cần admin xem xét khẩn cấp.",
    };
  }

  if (includesAny(normalizedText, illegalKeywords)) {
    return {
      isViolationSuspected: true,
      violationType: "illegal_content",
      severity: "high",
      confidenceScore: 90,
      reason: "AI phát hiện nội dung có dấu hiệu vi phạm pháp luật.",
      description:
        "Bài viết có từ khóa liên quan đến hành vi bất hợp pháp hoặc nội dung cần admin kiểm tra.",
    };
  }

  if (includesAny(normalizedText, harassmentKeywords)) {
    return {
      isViolationSuspected: true,
      violationType: "harassment",
      severity: "medium",
      confidenceScore: 85,
      reason: "AI phát hiện nội dung có dấu hiệu đe dọa hoặc quấy rối.",
      description:
        "Bài viết có dấu hiệu công kích, đe dọa hoặc gây tổn hại đến người khác.",
    };
  }

  if (includesAny(normalizedText, toxicKeywords)) {
    return {
      isViolationSuspected: true,
      violationType: "toxic_language",
      severity: "medium",
      confidenceScore: 80,
      reason: "AI phát hiện ngôn từ chưa đúng mực.",
      description:
        "Bài viết có thể chứa ngôn từ toxic, xúc phạm hoặc không phù hợp với cộng đồng.",
    };
  }

  return {
    isViolationSuspected: false,
    violationType: null,
    severity: "low",
    confidenceScore: 70,
    reason: null,
    description: null,
  };
}

function buildModerationPrompt(content) {
  return `
You are a forum moderation service for a mental wellness community app called SOUL.

Your job is to review user-generated forum content and decide whether the content should be flagged for admin review.

Return JSON only with this exact format:
{
  "isViolationSuspected": boolean,
  "violationType": "toxic_language | hate_speech | harassment | violence | illegal_content | self_harm | sexual_content | spam | other | null",
  "severity": "low | medium | high",
  "confidenceScore": number from 0 to 100,
  "reason": "short reason in Vietnamese",
  "description": "short explanation in Vietnamese"
}

Rules:
- Do not delete, block, or punish the user.
- Only decide whether the post should be sent to admin for review.
- If content is normal, supportive, emotional sharing, or harmless, set isViolationSuspected to false.
- If content contains insults, toxic language, harassment, hate speech, threats, illegal activity, spam, sexual content, or self-harm risk, set isViolationSuspected to true.
- If the user expresses self-harm, wanting to die, suicidal thoughts, or not wanting to live, set violationType to self_harm and severity to high.
- If the content mentions drugs, scams, hacking accounts, betting, or illegal trading, set violationType to illegal_content.
- If the content attacks, threatens, humiliates, or abuses another person, set violationType to harassment or toxic_language.
- Be careful: users may share sadness, stress, anxiety, or personal pain. That is not a violation unless there is self-harm risk or harmful content.
- Return JSON only.
- Do not return markdown.

Forum content:
"${content}"
`;
}

function extractAIContent(data) {
  if (!data) return null;

  if (typeof data === "string") return data;
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

function normalizeModerationResult(parsed) {
  const allowedViolationTypes = [
    "toxic_language",
    "hate_speech",
    "harassment",
    "violence",
    "illegal_content",
    "self_harm",
    "sexual_content",
    "spam",
    "other",
    null,
  ];

  const allowedSeverity = ["low", "medium", "high"];

  const isViolationSuspected = Boolean(parsed.isViolationSuspected);

  const violationType = allowedViolationTypes.includes(parsed.violationType)
    ? parsed.violationType
    : isViolationSuspected
    ? "other"
    : null;

  const severity = allowedSeverity.includes(parsed.severity)
    ? parsed.severity
    : isViolationSuspected
    ? "medium"
    : "low";

  const confidenceScore = Number(parsed.confidenceScore);

  return {
    isViolationSuspected,
    violationType,
    severity,
    confidenceScore:
      Number.isFinite(confidenceScore) &&
      confidenceScore >= 0 &&
      confidenceScore <= 100
        ? confidenceScore
        : isViolationSuspected
        ? 80
        : 70,
    reason:
      parsed.reason ||
      (isViolationSuspected
        ? "AI phát hiện nội dung có dấu hiệu vi phạm."
        : null),
    description:
      parsed.description ||
      (isViolationSuspected ? "Nội dung cần admin kiểm tra lại." : null),
  };
}

async function checkForumContentByAI(content) {
  if (!process.env.AI_MODERATION_API_URL || !process.env.AI_MODERATION_API_KEY) {
    throw new Error("AI moderation API is not configured");
  }

  const prompt = buildModerationPrompt(content);

  const response = await fetch(process.env.AI_MODERATION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_MODERATION_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `AI moderation API failed with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();

  let contentResult = extractAIContent(data);

  if (!contentResult) {
    throw new Error("AI moderation API returned empty result");
  }

  contentResult = String(contentResult)
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(contentResult);

  return normalizeModerationResult(parsed);
}

async function checkForumContentHybrid(content) {
  const keywordResult = checkForumContentByKeyword(content);

  // Nội dung sinh mệnh / tự tử phải bắt ngay, không phụ thuộc AI API.
  if (keywordResult.isViolationSuspected && keywordResult.severity === "high") {
    return keywordResult;
  }

  try {
    return await checkForumContentByAI(content);
  } catch (error) {
    console.error(
      "AI forum moderation failed, fallback to keyword:",
      error.message
    );

    return keywordResult;
  }
}

async function notifyAdmins(report) {
  const admins = await User.find({
    role: "admin",
    status: "active",
  }).select("_id");

  if (!admins.length) {
    return;
  }

  const notifications = admins.map((admin) => ({
    userId: admin._id,
    type: "moderation_review",
    title: "Có bài viết cần admin xem xét",
    content:
      "Hệ thống AI phát hiện một bài viết có dấu hiệu nhạy cảm hoặc vi phạm. Vui lòng kiểm tra report trong trang quản trị.",
    related: {
      type: "report",
      id: report._id,
    },
    isRead: false,
    readAt: null,
  }));

  await Notification.insertMany(notifications);
}

async function createSystemReportForPost(post, moderationResult) {
  if (!moderationResult.isViolationSuspected) {
    return null;
  }

  const report = await Report.findOneAndUpdate(
    {
      targetType: "post",
      targetId: post._id,
      reportSource: "system_ai",
    },
    {
      $set: {
        targetType: "post",
        targetId: post._id,
        reporterId: null,
        reportSource: "system_ai",
        reportedUserId: post.authorId,
        reason:
          moderationResult.reason ||
          "AI phát hiện bài viết có dấu hiệu vi phạm.",
        description:
          moderationResult.description ||
          "Bài viết cần admin kiểm tra lại trước khi đưa ra quyết định xử lý.",
        status: "pending",
        aiReview: {
          isViolationSuspected: moderationResult.isViolationSuspected,
          violationType: moderationResult.violationType,
          severity: moderationResult.severity,
          confidenceScore: moderationResult.confidenceScore,
          checkedAt: new Date(),
        },
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return report;
}

async function moderatePostAfterCreate(post) {
  const moderationResult = await checkForumContentHybrid(post.content);

  if (!moderationResult.isViolationSuspected) {
    post.isFlagged = false;
    post.toxicityLevel = "low";
    await post.save();

    return moderationResult;
  }

  post.isFlagged = true;
  post.toxicityLevel =
    moderationResult.severity === "high"
      ? "high"
      : moderationResult.severity === "medium"
      ? "medium"
      : "low";

  // Không tự ẩn bài. Admin quyết định sau.
  post.status = "approved";

  await post.save();

  const report = await createSystemReportForPost(post, moderationResult);

  if (report) {
    await notifyAdmins(report);
  }

  return moderationResult;
}

module.exports = {
  moderatePostAfterCreate,
  checkForumContentHybrid,
  checkForumContentByAI,
  checkForumContentByKeyword,
};