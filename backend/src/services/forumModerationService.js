const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notification");

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

const VIOLATION_TYPES = [
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

const SEVERITY_LEVELS = ["low", "medium", "high"];

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[.,!?;:()[\]{}"'`~@#$%^&*_+=|\\/<>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createSafeResult() {
  return {
    isViolationSuspected: false,
    violationType: null,
    severity: "low",
    confidenceScore: 85,
    reason: null,
    description: null,
  };
}

function createDangerousResult(type, reason, description, confidenceScore = 98) {
  return {
    isViolationSuspected: true,
    violationType: type,
    severity: "high",
    confidenceScore,
    reason,
    description,
  };
}

function clampScore(value, fallback = 80) {
  const score = Number(value);

  if (!Number.isFinite(score)) return fallback;
  if (score < 0) return 0;
  if (score > 100) return 100;

  return score;
}

function normalizeModerationResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return createSafeResult();
  }

  const isViolationSuspected = Boolean(parsed.isViolationSuspected);

  let violationType = parsed.violationType;
  if (!VIOLATION_TYPES.includes(violationType)) {
    violationType = isViolationSuspected ? "other" : null;
  }

  let severity = parsed.severity;
  if (!SEVERITY_LEVELS.includes(severity)) {
    severity = isViolationSuspected ? "medium" : "low";
  }

  return {
    isViolationSuspected,
    violationType: isViolationSuspected ? violationType || "other" : null,
    severity: isViolationSuspected ? severity : "low",
    confidenceScore: clampScore(
      parsed.confidenceScore,
      isViolationSuspected ? 80 : 85
    ),
    reason:
      parsed.reason ||
      (isViolationSuspected
        ? "AI phát hiện nội dung có dấu hiệu cần admin xem xét."
        : null),
    description:
      parsed.description ||
      (isViolationSuspected
        ? "Bài viết có dấu hiệu không phù hợp với cộng đồng SOUL."
        : null),
  };
}

function checkCriticalSafetyNet(content) {
  const text = normalizeText(content);

  if (!text) {
    return createSafeResult();
  }

  /**
   * SELF-HARM / SUICIDE RISK
   * Bắt các câu tự hại rõ ràng để xử lý nhanh, không cần chờ AI.
   */
  const selfHarmIntentRegex =
    /\b(muon|mong|uoc|chi muon|rat muon|het muon|khong muon|khong can|chan|met moi).{0,80}(chet|tu tu|bien mat|khong song|khong ton tai|roi khoi cuoc doi)\b/;

  const selfHarmPhraseRegex =
    /\b(chet di cho roi|chet di cho xong|di chet di|muon chet|muon di chet|khong muon song|khong thiet song|song lam gi nua|het muon song|muon bien mat|khong muon ton tai)\b/;

  const selfHarmActionRegex =
    /\b(cat|rach|tu cat|lam dau|tu lam dau|lam hai|tu hai).{0,50}(co tay|tay|ban than|minh|toi|tao|em)\b|\b(that co|treo co)\b|\b(self harm|kill myself|suicide|i want to die|i wanna die|cut myself)\b/;

  /**
   * VIOLENCE / HARM TO OTHERS
   * Bắt ý định hại người khác.
   */
  const violenceIntentRegex =
    /\b(muon|mong|se|sap|dinh|di|ru|keo nguoi|goi nguoi|canh).{0,80}(danh|dap|dam|chem|giet|xu|bem|tan|hanh hung|de doa|tra thu)\b/;

  const violencePhraseRegex =
    /\b(danh nhau|di danh nhau|muon danh nhau|cho no mot tran|cho no 1 tran|dap no|danh no|xu no|bem no|tan no|giet no|de doa no|tra thu no)\b/;

  const violenceEnglishRegex =
    /\b(i will beat|beat .* up|i will kill|kill him|kill her|attack him|attack her|fight him|fight her)\b/;

  /**
   * ILLEGAL / DANGEROUS CONTENT
   */
  const illegalRegex =
    /\b(mua|ban|ship|giao).{0,30}(ma tuy|can sa|hang cam)\b|\bhack\s+(tai khoan|account)\b|\blua dao\b|\bca do\b|\bbetting\b|\bscam\b/;

  if (
    selfHarmIntentRegex.test(text) ||
    selfHarmPhraseRegex.test(text) ||
    selfHarmActionRegex.test(text)
  ) {
    return createDangerousResult(
      "self_harm",
      "Nội dung có dấu hiệu nguy cơ tự làm hại bản thân.",
      "Bài viết thể hiện ý định hoặc dấu hiệu tự làm hại bản thân, muốn chết, tự tử hoặc không muốn tiếp tục sống. Cần admin xem xét khẩn cấp.",
      99
    );
  }

  if (
    violenceIntentRegex.test(text) ||
    violencePhraseRegex.test(text) ||
    violenceEnglishRegex.test(text)
  ) {
    return createDangerousResult(
      "violence",
      "Nội dung có dấu hiệu bạo lực hoặc đe dọa gây hại người khác.",
      "Bài viết thể hiện ý định đánh nhau, tấn công, trả thù, đe dọa hoặc gây tổn hại cho người khác. Cần admin xem xét.",
      96
    );
  }

  if (illegalRegex.test(text)) {
    return createDangerousResult(
      "illegal_content",
      "Nội dung có dấu hiệu liên quan đến hành vi vi phạm pháp luật.",
      "Bài viết có dấu hiệu liên quan đến ma túy, lừa đảo, hack tài khoản, cá độ hoặc giao dịch bất hợp pháp.",
      92
    );
  }

  return createSafeResult();
}

const moderationResponseSchema = {
  type: "json_schema",
  json_schema: {
    name: "soul_forum_moderation_result",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        isViolationSuspected: {
          type: "boolean",
          description:
            "True nếu bài viết cần admin review vì có dấu hiệu vi phạm hoặc rủi ro an toàn.",
        },
        violationType: {
          type: ["string", "null"],
          enum: VIOLATION_TYPES,
          description: "Loại vi phạm. Null nếu không có dấu hiệu vi phạm.",
        },
        severity: {
          type: "string",
          enum: SEVERITY_LEVELS,
          description: "Mức độ nghiêm trọng của nội dung.",
        },
        confidenceScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Độ tự tin của AI từ 0 đến 100.",
        },
        reason: {
          type: ["string", "null"],
          description: "Lý do ngắn bằng tiếng Việt.",
        },
        description: {
          type: ["string", "null"],
          description: "Giải thích ngắn bằng tiếng Việt cho admin.",
        },
      },
      required: [
        "isViolationSuspected",
        "violationType",
        "severity",
        "confidenceScore",
        "reason",
        "description",
      ],
    },
  },
};

function buildModerationMessages(content) {
  return [
    {
      role: "system",
      content: `
You are a strict AI content moderation service for SOUL, a Vietnamese mental wellness community app.

Your job:
- Review Vietnamese/English user-generated forum posts.
- Decide whether the post should be flagged for admin review.
- Do not punish the user.
- Do not give therapy advice.
- Only classify the safety/moderation risk.

Important context:
SOUL is a mental wellness community, so users may share sadness, stress, loneliness, anxiety, academic pressure, family problems, or emotional pain.
Those are allowed when they are only emotional sharing.
But content must be flagged if it includes self-harm risk, violence, threats, harassment, hate speech, illegal content, sexual content, spam, or severe toxicity.

Understand Vietnamese slang, teencode, abbreviations, missing accents, typos, and informal text.
Examples:
- "t" can mean "tôi", "tao", "mình".
- "m" can mean "mày".
- "đánh nhau", "danh nhau", "đập nó", "dap no", "xử nó", "xu no", "bem nó", "tẩn nó" are violence.
- "muốn chết", "muon chet", "đi chết", "di chet", "không muốn sống", "khong muon song" are self-harm risk.
- "cắt cổ tay", "cat co tay", "thắt cổ", "that co", "treo cổ", "treo co" are self-harm risk.

Classification policy:
1. Normal emotional sharing:
   - If the post only says the user is sad, stressed, tired, lonely, anxious, disappointed, or wants to cry, do not flag.
   - Example allowed: "hôm nay t stress quá muốn khóc".

2. Self-harm:
   - Flag if the post expresses suicidal thoughts, wanting to die, wanting to disappear permanently, not wanting to live, or intent to self-harm.
   - Understand Vietnamese slang, teencode, missing accents, typos, and indirect wording.
   - Examples of self-harm risk: "muốn chết", "mong chết đi cho rồi", "không muốn sống", "hết muốn sống", "muốn biến mất", "cắt cổ tay", "thắt cổ", "treo cổ", "tự làm đau bản thân".
   - violationType: "self_harm".
   - severity: "high".

3. Violence:
   - Flag if the user expresses intent, desire, plan, threat, or encouragement to fight, beat, attack, injure, retaliate against, or physically harm another person.
   - Understand Vietnamese slang and informal wording.
   - Examples of violence risk: "đánh nhau", "muốn đánh nó", "đập nó", "xử nó", "bem nó", "tẩn nó", "cho nó một trận", "kéo người đánh", "trả thù nó".
   - violationType: "violence".
   - severity: "high" if it targets a specific person or sounds actionable.

4. Harassment/toxic language:
   - If the post insults, humiliates, threatens, abuses, bullies, or attacks another person, flag.
   - Use "harassment" when targeting a person.
   - Use "toxic_language" for general profanity/insults.

5. Hate speech:
   - If it attacks protected groups based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, etc., flag as "hate_speech".

6. Illegal content:
   - If it discusses buying/selling drugs, scams, hacking accounts, betting, illegal trading, or instructions to commit crimes, flag as "illegal_content".

7. Sexual content:
   - If it contains explicit sexual content or sexual exploitation, flag as "sexual_content".

8. Spam:
   - If it is advertising, repeated garbage text, suspicious links, or promotional spam, flag as "spam".

Return only the structured JSON required by the schema.
`,
    },
    {
      role: "user",
      content: `Forum post content:\n${String(content || "").trim()}`,
    },
  ];
}

async function callOpenAIForModeration(content) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_MODERATION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add OPENAI_API_KEY to your .env or Render environment variables."
    );
  }

  const model =
    process.env.OPENAI_MODERATION_MODEL ||
    process.env.AI_MODERATION_MODEL ||
    "gpt-4o-mini";

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: buildModerationMessages(content),
      temperature: 0,
      response_format: moderationResponseSchema,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI moderation request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = await response.json();
  const rawContent = data?.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("OpenAI moderation returned empty content.");
  }

  let parsed;

  try {
    parsed = JSON.parse(rawContent);
  } catch (error) {
    const cleaned = String(rawContent)
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    parsed = JSON.parse(cleaned);
  }

  return normalizeModerationResult(parsed);
}

function getSeverityWeight(severity) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function isDangerousViolation(moderationResult) {
  if (!moderationResult?.isViolationSuspected) {
    return false;
  }

  const dangerousTypes = [
    "self_harm",
    "violence",
    "illegal_content",
    "hate_speech",
    "sexual_content",
  ];

  return (
    dangerousTypes.includes(moderationResult.violationType) ||
    moderationResult.severity === "high"
  );
}

function mergeAIWithSafetyNet(aiResult, safetyNetResult) {
  const normalizedAI = normalizeModerationResult(aiResult);
  const normalizedSafetyNet = normalizeModerationResult(safetyNetResult);

  if (!normalizedSafetyNet.isViolationSuspected) {
    return normalizedAI;
  }

  if (!normalizedAI.isViolationSuspected) {
    return normalizedSafetyNet;
  }

  const aiWeight = getSeverityWeight(normalizedAI.severity);
  const safetyWeight = getSeverityWeight(normalizedSafetyNet.severity);

  if (safetyWeight > aiWeight) {
    return normalizedSafetyNet;
  }

  return {
    ...normalizedAI,
    confidenceScore: Math.max(
      normalizedAI.confidenceScore,
      normalizedSafetyNet.confidenceScore
    ),
  };
}

async function checkForumContentByAI(content) {
  return callOpenAIForModeration(content);
}

async function checkForumContentHybrid(content) {
  const trimmedContent = String(content || "").trim();

  if (!trimmedContent) {
    return createSafeResult();
  }

  const safetyNetResult = checkCriticalSafetyNet(trimmedContent);

  // Case nguy hiểm rõ ràng: chặn ngay, không cần đợi AI.
  if (isDangerousViolation(safetyNetResult)) {
    console.log("[Forum Moderation] Safety net caught dangerous content:", {
      content: trimmedContent,
      result: safetyNetResult,
    });

    return safetyNetResult;
  }

  try {
    const aiResult = await checkForumContentByAI(trimmedContent);
    const finalResult = mergeAIWithSafetyNet(aiResult, safetyNetResult);

    console.log("[Forum Moderation] AI result:", aiResult);
    console.log("[Forum Moderation] Safety net result:", safetyNetResult);
    console.log("[Forum Moderation] Final result:", finalResult);

    return finalResult;
  } catch (error) {
    console.error("[Forum Moderation] AI failed:", error.message);

    if (safetyNetResult.isViolationSuspected) {
      return safetyNetResult;
    }

    if (process.env.MODERATION_FAIL_CLOSED === "true") {
      return {
        isViolationSuspected: true,
        violationType: "other",
        severity: "medium",
        confidenceScore: 70,
        reason: "Không thể kiểm duyệt bằng AI tại thời điểm đăng bài.",
        description:
          "AI moderation đang lỗi hoặc chưa cấu hình. Bài viết được chuyển sang pending để admin kiểm tra thủ công.",
      };
    }

    return createSafeResult();
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

function getToxicityLevel(severity) {
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function getPostStatusAfterModeration(moderationResult) {
  if (!moderationResult.isViolationSuspected) {
    return "approved";
  }

  const pendingMode = process.env.MODERATION_PENDING_ON || "dangerous_only";

  if (pendingMode === "dangerous_only") {
    return isDangerousViolation(moderationResult) ? "pending" : "approved";
  }

  if (pendingMode === "high") {
    return moderationResult.severity === "high" ? "pending" : "approved";
  }

  if (pendingMode === "all") {
    return "pending";
  }

  return isDangerousViolation(moderationResult) ? "pending" : "approved";
}

async function moderatePostAfterCreate(post) {
  console.log("========== MODERATION START ==========");
  console.log("Post ID:", post._id);
  console.log("Post content:", post.content);

  const moderationResult = await checkForumContentHybrid(post.content);

  console.log("Moderation result:", moderationResult);
  console.log("========== MODERATION END ==========");

  if (!moderationResult.isViolationSuspected) {
    post.isFlagged = false;
    post.toxicityLevel = "low";
    post.status = "approved";
    post.approvedAt = new Date();
    post.rejectedReason = null;

    await post.save();

    return moderationResult;
  }

  const dangerous = isDangerousViolation(moderationResult);

  post.toxicityLevel = getToxicityLevel(moderationResult.severity);
  post.status = getPostStatusAfterModeration(moderationResult);

  if (dangerous) {
    post.isFlagged = true;
    post.approvedAt = null;
  } else {
    post.isFlagged = false;
    post.approvedAt = new Date();
  }

  await post.save();

  if (dangerous) {
    const report = await createSystemReportForPost(post, moderationResult);

    if (report) {
      await notifyAdmins(report);
    }
  }

  return moderationResult;
}

module.exports = {
  moderatePostAfterCreate,
  checkForumContentHybrid,
  checkForumContentByAI,
  checkCriticalSafetyNet,
  isDangerousViolation,
};