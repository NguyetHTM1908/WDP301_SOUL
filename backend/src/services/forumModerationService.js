const Report = require("../models/Report");
const User = require("../models/User");
const Notification = require("../models/Notification");

const {
  analyzeSafetyRisk,
} = require("./contentSafetyService");

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

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

function createSafeResult() {
  return {
    isViolationSuspected: false,
    violationType: null,
    severity: "low",
    confidenceScore: 85,
    reason: null,
    description: null,

    riskLevel: "low",
    safetyWarning: false,
    safetyTriggered: false,
    safetyType: null,
  };
}

function clampScore(value, fallback = 80) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, score));
}

function normalizeModerationResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return createSafeResult();
  }

  const isViolationSuspected = Boolean(
    parsed.isViolationSuspected
  );

  let violationType = parsed.violationType;

  if (!VIOLATION_TYPES.includes(violationType)) {
    violationType = isViolationSuspected
      ? "other"
      : null;
  }

  let severity = String(
    parsed.severity || ""
  ).toLowerCase();

  if (!SEVERITY_LEVELS.includes(severity)) {
    severity = isViolationSuspected
      ? "medium"
      : "low";
  }

  return {
    isViolationSuspected,
    violationType: isViolationSuspected
      ? violationType || "other"
      : null,
    severity: isViolationSuspected
      ? severity
      : "low",
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
        ? "Nội dung có dấu hiệu không phù hợp với cộng đồng SOUL."
        : null),

    riskLevel:
      parsed.riskLevel ||
      (severity === "high"
        ? "high"
        : severity === "medium"
        ? "medium"
        : "low"),

    safetyWarning: Boolean(
      parsed.safetyWarning ||
        parsed.safetyTriggered ||
        isViolationSuspected
    ),

    safetyTriggered: Boolean(
      parsed.safetyTriggered ||
        isViolationSuspected
    ),

    safetyType:
      parsed.safetyType || null,
  };
}

/**
 * Lớp bảo vệ quan trọng dùng chung.
 *
 * Không còn chứa regex riêng trong forumModerationService.
 * Mọi regex tự sát, bạo lực, cấp cứu và bất hợp pháp
 * đều nằm trong contentSafetyService.
 */
function checkCriticalSafetyNet(content) {
  const safetyResult = analyzeSafetyRisk(content);

  if (!safetyResult.isViolationSuspected) {
    return createSafeResult();
  }

  return normalizeModerationResult({
    isViolationSuspected:
      safetyResult.isViolationSuspected,
    violationType:
      safetyResult.violationType,
    severity:
      safetyResult.severity,
    confidenceScore:
      safetyResult.confidenceScore,
    reason:
      safetyResult.reason,
    description:
      safetyResult.description,

    riskLevel:
      safetyResult.riskLevel,
    safetyWarning:
      safetyResult.safetyWarning,
    safetyTriggered:
      safetyResult.safetyTriggered,
    safetyType:
      safetyResult.safetyType,
  });
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
            "True nếu nội dung cần admin xem xét vì có dấu hiệu vi phạm hoặc rủi ro an toàn.",
        },
        violationType: {
          type: ["string", "null"],
          enum: VIOLATION_TYPES,
          description:
            "Loại vi phạm. Null nếu không có dấu hiệu vi phạm.",
        },
        severity: {
          type: "string",
          enum: SEVERITY_LEVELS,
          description:
            "Mức độ nghiêm trọng của nội dung.",
        },
        confidenceScore: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description:
            "Độ tự tin của AI từ 0 đến 100.",
        },
        reason: {
          type: ["string", "null"],
          description:
            "Lý do ngắn bằng tiếng Việt.",
        },
        description: {
          type: ["string", "null"],
          description:
            "Giải thích ngắn bằng tiếng Việt cho admin.",
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
Bạn là hệ thống kiểm duyệt nội dung cho SOUL, một cộng đồng chia sẻ cảm xúc và sức khỏe tinh thần.

Nhiệm vụ:
- Phân tích nội dung do người dùng đăng.
- Xác định nội dung có cần admin xem xét hay không.
- Không tư vấn tâm lý.
- Không trả lời trực tiếp cho người dùng.
- Chỉ phân loại rủi ro kiểm duyệt.

Bối cảnh:
Người dùng SOUL được phép chia sẻ cảm giác buồn, căng thẳng, cô đơn, áp lực, lo lắng, thất vọng, mệt mỏi hoặc muốn khóc.

Không đánh dấu vi phạm chỉ vì nội dung mang cảm xúc tiêu cực.

Phải đánh dấu khi nội dung có:
- Nguy cơ tự làm hại bản thân hoặc tự tử.
- Đe dọa hoặc ý định gây bạo lực.
- Quấy rối, bắt nạt hoặc xúc phạm trực tiếp một người.
- Ngôn từ thù ghét nhắm vào nhóm được bảo vệ.
- Hành vi bất hợp pháp.
- Nội dung tình dục rõ ràng.
- Nội dung rác hoặc quảng cáo đáng ngờ.
- Ngôn từ độc hại nghiêm trọng.

Hiểu:
- Tiếng Việt có dấu và không dấu.
- Teencode.
- Viết tắt.
- Lỗi chính tả.
- Cách nói đời thường.
- Tiếng Anh xen kẽ.

Quy tắc:

1. Chia sẻ cảm xúc bình thường:
Ví dụ:
- "Hôm nay mình stress quá."
- "Mình buồn và muốn khóc."
- "Dạo này mình rất cô đơn."

Các nội dung trên được phép nếu không có ý định gây hại.

2. Tự làm hại:
Đánh dấu khi có ý định chết, tự tử, không muốn sống, muốn biến mất vĩnh viễn hoặc muốn tự làm đau.

violationType = "self_harm"
severity = "high"

3. Bạo lực:
Đánh dấu khi có ý định, kế hoạch hoặc lời đe dọa đánh, đập, đâm, chém, giết, trả thù hoặc gây thương tích.

violationType = "violence"

4. Quấy rối:
Nếu nội dung xúc phạm, làm nhục, bắt nạt hoặc tấn công một người cụ thể:

violationType = "harassment"

5. Ngôn từ độc hại:
Nếu nội dung chửi bới hoặc xúc phạm chung nhưng không nhắm vào nhóm được bảo vệ:

violationType = "toxic_language"

6. Ngôn từ thù ghét:
Nếu nội dung tấn công một nhóm dựa trên chủng tộc, dân tộc, quốc tịch, tôn giáo, giới tính, xu hướng tính dục hoặc tình trạng khuyết tật:

violationType = "hate_speech"

7. Nội dung bất hợp pháp:
Bao gồm mua bán ma túy, lừa đảo, hack tài khoản, cá độ, giao dịch trái phép hoặc hướng dẫn phạm tội:

violationType = "illegal_content"

8. Nội dung tình dục:
Nội dung tình dục rõ ràng hoặc bóc lột tình dục:

violationType = "sexual_content"

9. Nội dung rác:
Quảng cáo lặp lại, đường dẫn đáng ngờ, nội dung vô nghĩa lặp lại hoặc quảng bá không phù hợp:

violationType = "spam"

Chỉ trả về JSON đúng theo schema được cung cấp.
`,
    },
    {
      role: "user",
      content: `Nội dung cần kiểm duyệt:\n${String(
        content || ""
      ).trim()}`,
    },
  ];
}

async function callOpenAIForModeration(content) {
  const apiKey =
    process.env.OPENAI_API_KEY ||
    process.env.AI_MODERATION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add OPENAI_API_KEY to the environment variables."
    );
  }

  const model =
    process.env.OPENAI_MODERATION_MODEL ||
    process.env.AI_MODERATION_MODEL ||
    "gpt-4o-mini";

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, Number(process.env.MODERATION_TIMEOUT_MS || 60000));

  try {
    const response = await fetch(
      OPENAI_CHAT_COMPLETIONS_URL,
      {
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
        signal: controller.signal,
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `OpenAI moderation failed with status ${response.status}: ${responseText}`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        "OpenAI moderation returned invalid JSON response."
      );
    }

    const rawContent =
      data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error(
        "OpenAI moderation returned empty content."
      );
    }

    const cleanedContent = String(rawContent)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanedContent);

    return normalizeModerationResult(parsed);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("OpenAI moderation request timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function getSeverityWeight(severity) {
  switch (severity) {
    case "high":
      return 3;

    case "medium":
      return 2;

    default:
      return 1;
  }
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
    dangerousTypes.includes(
      moderationResult.violationType
    ) ||
    moderationResult.severity === "high"
  );
}

function mergeAIWithSafetyNet(
  aiResult,
  safetyNetResult
) {
  const normalizedAI =
    normalizeModerationResult(aiResult);

  const normalizedSafetyNet =
    normalizeModerationResult(safetyNetResult);

  if (!normalizedSafetyNet.isViolationSuspected) {
    return normalizedAI;
  }

  if (!normalizedAI.isViolationSuspected) {
    return normalizedSafetyNet;
  }

  const aiWeight = getSeverityWeight(
    normalizedAI.severity
  );

  const safetyWeight = getSeverityWeight(
    normalizedSafetyNet.severity
  );

  if (safetyWeight > aiWeight) {
    return normalizedSafetyNet;
  }

  if (safetyWeight === aiWeight) {
    /**
     * Ưu tiên contentSafetyService nếu đó là loại nguy hiểm,
     * vì đây là lớp bảo vệ cố định của hệ thống.
     */
    if (
      isDangerousViolation(normalizedSafetyNet) &&
      !isDangerousViolation(normalizedAI)
    ) {
      return normalizedSafetyNet;
    }
  }

  return {
    ...normalizedAI,

    confidenceScore: Math.max(
      normalizedAI.confidenceScore,
      normalizedSafetyNet.confidenceScore
    ),

    riskLevel:
      normalizedSafetyNet.riskLevel ||
      normalizedAI.riskLevel,

    safetyWarning:
      normalizedAI.safetyWarning ||
      normalizedSafetyNet.safetyWarning,

    safetyTriggered:
      normalizedAI.safetyTriggered ||
      normalizedSafetyNet.safetyTriggered,

    safetyType:
      normalizedSafetyNet.safetyType ||
      normalizedAI.safetyType,
  };
}

async function checkForumContentByAI(content) {
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    return createSafeResult();
  }

  return callOpenAIForModeration(cleanContent);
}

async function checkForumContentHybrid(content) {
  const cleanContent = String(content || "").trim();

  if (!cleanContent) {
    return createSafeResult();
  }

  /**
   * Chạy contentSafetyService trước.
   */
  const safetyNetResult =
    checkCriticalSafetyNet(cleanContent);

  /**
   * Các nội dung nguy hiểm rõ ràng được chặn ngay,
   * không cần chờ AI moderation.
   */
  if (isDangerousViolation(safetyNetResult)) {
    console.log(
      "[Forum Moderation] Shared safety service caught dangerous content:",
      {
        result: safetyNetResult,
      }
    );

    return safetyNetResult;
  }

  try {
    const aiResult =
      await checkForumContentByAI(cleanContent);

    const finalResult = mergeAIWithSafetyNet(
      aiResult,
      safetyNetResult
    );

    console.log(
      "[Forum Moderation] AI result:",
      aiResult
    );

    console.log(
      "[Forum Moderation] Shared safety result:",
      safetyNetResult
    );

    console.log(
      "[Forum Moderation] Final result:",
      finalResult
    );

    return finalResult;
  } catch (error) {
    console.error(
      "[Forum Moderation] AI failed:",
      error.message
    );

    if (safetyNetResult.isViolationSuspected) {
      return safetyNetResult;
    }

    if (
      process.env.MODERATION_FAIL_CLOSED === "true"
    ) {
      return normalizeModerationResult({
        isViolationSuspected: true,
        violationType: "other",
        severity: "medium",
        confidenceScore: 70,
        reason:
          "Không thể kiểm duyệt bằng AI tại thời điểm đăng nội dung.",
        description:
          "AI moderation đang lỗi hoặc chưa được cấu hình. Nội dung được chuyển sang trạng thái chờ để admin kiểm tra thủ công.",
        riskLevel: "medium",
        safetyWarning: true,
        safetyTriggered: false,
        safetyType: null,
      });
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
    console.warn(
      "[Forum Moderation] No active admin found."
    );

    return;
  }

  const notifications = admins.map((admin) => ({
    userId: admin._id,
    type: "moderation_review",
    title: "Có bài viết cần admin xem xét",
    content:
      "Hệ thống phát hiện một bài viết có dấu hiệu nhạy cảm hoặc vi phạm. Vui lòng mở trang quản trị để xem đầy đủ nội dung bài viết.",
    related: {
      type: "report",
      id: report._id,
    },
    isRead: false,
    readAt: null,
  }));

  await Notification.insertMany(notifications);
}

async function createSystemReportForPost(
  post,
  moderationResult
) {
  if (!moderationResult?.isViolationSuspected) {
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
          "Hệ thống phát hiện bài viết có dấu hiệu vi phạm.",

        description:
          moderationResult.description ||
          "Bài viết cần admin kiểm tra lại trước khi đưa ra quyết định xử lý.",

        status: "pending",

        aiReview: {
          isViolationSuspected:
            moderationResult.isViolationSuspected,

          violationType:
            moderationResult.violationType,

          severity:
            moderationResult.severity,

          confidenceScore:
            moderationResult.confidenceScore,

          checkedAt: new Date(),
        },
      },
      $setOnInsert: {
        createdAt: new Date(),
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
  if (severity === "high") {
    return "high";
  }

  if (severity === "medium") {
    return "medium";
  }

  return "low";
}

function getPostStatusAfterModeration(
  moderationResult
) {
  if (!moderationResult.isViolationSuspected) {
    return "approved";
  }

  const pendingMode =
    process.env.MODERATION_PENDING_ON ||
    "dangerous_only";

  if (pendingMode === "dangerous_only") {
    return isDangerousViolation(moderationResult)
      ? "pending"
      : "approved";
  }

  if (pendingMode === "high") {
    return moderationResult.severity === "high"
      ? "pending"
      : "approved";
  }

  if (pendingMode === "all") {
    return "pending";
  }

  return isDangerousViolation(moderationResult)
    ? "pending"
    : "approved";
}

async function moderatePostAfterCreate(post) {
  if (!post?._id) {
    throw new Error(
      "A saved post document is required"
    );
  }

  const postContent = String(
    post.content || ""
  ).trim();

  console.log(
    "========== MODERATION START =========="
  );

  console.log("Post ID:", post._id);

  const moderationResult =
    await checkForumContentHybrid(postContent);

  console.log(
    "Moderation result:",
    moderationResult
  );

  console.log(
    "========== MODERATION END =========="
  );

  if (!moderationResult.isViolationSuspected) {
    post.isFlagged = false;
    post.toxicityLevel = "low";
    post.status = "approved";
    post.approvedAt = new Date();
    post.approvedBy = null;
    post.rejectedReason = null;

    await post.save();

    return moderationResult;
  }

  const dangerous =
    isDangerousViolation(moderationResult);

  const postStatus =
    getPostStatusAfterModeration(
      moderationResult
    );

  post.toxicityLevel = getToxicityLevel(
    moderationResult.severity
  );

  post.status = postStatus;

  /**
   * isFlagged phải phản ánh việc admin cần chú ý,
   * không chỉ riêng dangerous.
   */
  post.isFlagged =
    postStatus === "pending" ||
    dangerous;

  if (postStatus === "approved") {
    post.approvedAt = new Date();
  } else {
    post.approvedAt = null;
  }

  post.approvedBy = null;
  post.rejectedReason = null;

  await post.save();

  /**
   * Tạo report khi bài bị chuyển sang pending.
   * Nhờ vậy admin có thể mở report và xem đầy đủ bài viết.
   */
  if (postStatus === "pending") {
    const report =
      await createSystemReportForPost(
        post,
        moderationResult
      );

    if (report) {
      try {
        await notifyAdmins(report);
      } catch (notificationError) {
        /**
         * Lỗi notification không được làm hỏng quá trình đăng bài.
         */
        console.error(
          "[Forum Moderation] Failed to notify admins:",
          notificationError.message
        );
      }
    }
  }

  return moderationResult;
}

module.exports = {
  moderatePostAfterCreate,

  checkForumContentHybrid,
  checkForumContentByAI,
  checkCriticalSafetyNet,

  createSystemReportForPost,
  notifyAdmins,

  isDangerousViolation,
  getPostStatusAfterModeration,
};