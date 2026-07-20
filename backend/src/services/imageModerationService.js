const IMAGE_RISK_LEVELS = [
  "low",
  "medium",
  "high",
];

const ALLOWED_CONTEXT_TYPES = [
  "self_harm",
  "medical",
  "art",
  "violence",
  "safe",
  "unknown",
];

const ALLOWED_DECISIONS = [
  "safe",
  "review_required",
  "blocked",
];

function normalizeRiskLevel(value) {
  const level = String(value || "")
    .trim()
    .toLowerCase();

  return IMAGE_RISK_LEVELS.includes(level)
    ? level
    : "low";
}

function normalizeContextType(value) {
  const contextType = String(value || "")
    .trim()
    .toLowerCase();

  return ALLOWED_CONTEXT_TYPES.includes(
    contextType
  )
    ? contextType
    : "unknown";
}

function normalizeDecision(value) {
  const decision = String(value || "")
    .trim()
    .toLowerCase();

  return ALLOWED_DECISIONS.includes(decision)
    ? decision
    : "review_required";
}

function normalizeConfidenceScore(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}

function normalizeNullableText(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const text = String(value).trim();

  return text || null;
}

function toBoolean(value) {
  if (value === true || value === 1) {
    return true;
  }

  if (
    typeof value === "string" &&
    value.trim().toLowerCase() === "true"
  ) {
    return true;
  }

  return false;
}

function highestRisk(...levels) {
  if (levels.includes("high")) {
    return "high";
  }

  if (levels.includes("medium")) {
    return "medium";
  }

  return "low";
}

function getVisionConfig() {
  const apiUrl = String(
    process.env.VISION_AI_API_URL || ""
  ).trim();

  const apiKey = String(
    process.env.VISION_AI_API_KEY ||
      process.env.AI_MODERATION_API_KEY ||
      process.env.OPENAI_API_KEY ||
      ""
  ).trim();

  const model = String(
    process.env.VISION_AI_MODEL ||
      process.env.AI_MODERATION_MODEL ||
      "GPT-5.4-mini"
  ).trim();

  const timeout = Number(
    process.env.VISION_AI_TIMEOUT_MS ||
      60000
  );

  return {
    apiUrl,
    apiKey,
    model,

    timeout:
      Number.isFinite(timeout) &&
      timeout > 0
        ? timeout
        : 60000,
  };
}

function createEmptyVisionResult() {
  return {
    provider: "stu_vision_ai",

    checked: false,

    selfHarmSuspected: false,
    woundOrBlood: false,
    dangerousObject: false,

    contextType: "unknown",

    confidenceScore: 0,

    riskLevel: "low",

    isViolationSuspected: false,
    needsAdminReview: false,

    reason: null,
    description: null,

    error: null,
  };
}

/*
 * Giữ layer1 để tương thích schema MongoDB cũ,
 * nhưng không gọi Google Cloud.
 */
function createDisabledLayer1() {
  return {
    provider: "google_safe_search",

    checked: false,

    categories: {
      adult: "UNKNOWN",
      spoof: "UNKNOWN",
      medical: "UNKNOWN",
      violence: "UNKNOWN",
      racy: "UNKNOWN",
    },

    riskLevel: "low",

    isViolationSuspected: false,
    needsAdminReview: false,

    reason: null,

    error:
      "Google SafeSearch đã được tắt. Hệ thống chỉ dùng Vision AI.",
  };
}

function getVisionSystemPrompt() {
  return `
Bạn là hệ thống kiểm duyệt hình ảnh cho diễn đàn hỗ trợ cảm xúc SOUL.

Hãy quan sát hình ảnh và quyết định một trong ba kết quả:

- safe:
  Hình ảnh bình thường, không có dấu hiệu nguy hiểm rõ ràng.

- review_required:
  Hình ảnh có dấu hiệu nhạy cảm, không chắc chắn, thuộc bối cảnh y tế, nghệ thuật, có máu, vết thương hoặc vật nguy hiểm và cần quản trị viên xem xét.

- blocked:
  Hình ảnh có dấu hiệu rõ ràng về tự gây thương tích, cổ súy tự hại, bạo lực nghiêm trọng hoặc nội dung nguy hiểm nghiêm trọng.

Không chẩn đoán sức khỏe hoặc tâm lý của người trong ảnh.

Không tự động coi mọi hình ảnh có máu hoặc vết thương là tự hại.
Phân biệt ảnh y tế, nghệ thuật, phim ảnh và bạo lực thực tế.

Chỉ trả về duy nhất một JSON object hợp lệ.
Không dùng markdown.
Không viết nội dung ngoài JSON.

Cấu trúc JSON bắt buộc:

{
  "decision": "safe",
  "selfHarmSuspected": false,
  "woundOrBlood": false,
  "dangerousObject": false,
  "contextType": "safe",
  "confidenceScore": 90,
  "riskLevel": "low",
  "isViolationSuspected": false,
  "needsAdminReview": false,
  "reason": null,
  "description": "Hình ảnh thông thường, không có dấu hiệu nguy hiểm."
}

Giá trị decision chỉ được là:

"safe"
"review_required"
"blocked"

Giá trị contextType chỉ được là:

"self_harm"
"medical"
"art"
"violence"
"safe"
"unknown"

Giá trị riskLevel chỉ được là:

"low"
"medium"
"high"

Quy tắc quyết định:

1. Ảnh thể thao, phong cảnh, đồ ăn, người bình thường:
   decision = "safe"
   riskLevel = "low"
   needsAdminReview = false

2. Ảnh mờ hoặc không đủ dữ liệu:
   decision = "review_required"
   contextType = "unknown"
   riskLevel = "medium"
   needsAdminReview = true

3. Ảnh y tế hoặc nghệ thuật có vết thương nhưng không có dấu hiệu tự hại rõ ràng:
   decision = "review_required"
   contextType = "medical" hoặc "art"
   riskLevel = "medium"
   selfHarmSuspected = false

4. Tự hại hoặc bạo lực nghiêm trọng rõ ràng:
   decision = "blocked"
   riskLevel = "high"
   isViolationSuspected = true
   needsAdminReview = true

5. confidenceScore phải từ 0 đến 100.

6. reason ngắn gọn.

7. description chỉ mô tả tổng quát, không mô tả chi tiết gây sốc.
`.trim();
}

function buildResponsesPayload(
  model,
  imageUrl
) {
  return {
    model,

    instructions:
      getVisionSystemPrompt(),

    input: [
      {
        role: "user",

        content: [
          {
            type: "input_text",

            text:
              "Hãy kiểm duyệt hình ảnh này và trả về đúng JSON theo schema.",
          },

          {
            type: "input_image",

            image_url: imageUrl,
          },
        ],
      },
    ],

    max_output_tokens: 700,
  };
}

function extractResponseText(data) {
  if (!data) {
    return "";
  }

  if (
    typeof data.output_text ===
    "string"
  ) {
    return data.output_text;
  }

  if (
    typeof data.reply ===
    "string"
  ) {
    return data.reply;
  }

  if (Array.isArray(data.output)) {
    const texts = [];

    for (const outputItem of data.output) {
      if (
        typeof outputItem?.text ===
        "string"
      ) {
        texts.push(outputItem.text);
      }

      if (
        Array.isArray(
          outputItem?.content
        )
      ) {
        for (
          const contentItem of
          outputItem.content
        ) {
          if (
            typeof contentItem?.text ===
            "string"
          ) {
            texts.push(
              contentItem.text
            );
          }

          if (
            typeof contentItem?.output_text ===
            "string"
          ) {
            texts.push(
              contentItem.output_text
            );
          }
        }
      }
    }

    return texts
      .filter(Boolean)
      .join("\n");
  }

  const choiceContent =
    data?.choices?.[0]
      ?.message?.content;

  if (
    typeof choiceContent ===
    "string"
  ) {
    return choiceContent;
  }

  return "";
}

function extractJsonObject(rawText) {
  let text = String(rawText || "")
    .trim();

  if (!text) {
    throw new Error(
      "Vision AI không trả về nội dung."
    );
  }

  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch (_) {
    const firstBrace =
      text.indexOf("{");

    const lastBrace =
      text.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      throw new Error(
        "Vision AI không trả về JSON hợp lệ."
      );
    }

    return JSON.parse(
      text.slice(
        firstBrace,
        lastBrace + 1
      )
    );
  }
}

function normalizeVisionResult(parsed) {
  const result =
    createEmptyVisionResult();

  result.checked = true;

  result.selfHarmSuspected =
    toBoolean(
      parsed.selfHarmSuspected
    );

  result.woundOrBlood =
    toBoolean(
      parsed.woundOrBlood
    );

  result.dangerousObject =
    toBoolean(
      parsed.dangerousObject
    );

  result.contextType =
    normalizeContextType(
      parsed.contextType
    );

  result.confidenceScore =
    normalizeConfidenceScore(
      parsed.confidenceScore
    );

  result.riskLevel =
    normalizeRiskLevel(
      parsed.riskLevel
    );

  result.isViolationSuspected =
    toBoolean(
      parsed.isViolationSuspected
    );

  result.needsAdminReview =
    toBoolean(
      parsed.needsAdminReview
    );

  result.reason =
    normalizeNullableText(
      parsed.reason
    );

  result.description =
    normalizeNullableText(
      parsed.description
    );

  let decision =
    normalizeDecision(
      parsed.decision
    );

  /*
   * Luật backend bảo vệ:
   * không tin hoàn toàn vào quyết định do AI trả về.
   */
  if (
    result.selfHarmSuspected &&
    result.confidenceScore >= 75
  ) {
    decision = "blocked";

    result.contextType =
      "self_harm";

    result.riskLevel =
      "high";

    result.isViolationSuspected =
      true;

    result.needsAdminReview =
      true;
  }

  if (
    result.contextType ===
      "violence" &&
    result.confidenceScore >= 80
  ) {
    decision = "blocked";

    result.riskLevel =
      "high";

    result.isViolationSuspected =
      true;

    result.needsAdminReview =
      true;
  }

  if (
    decision ===
      "review_required"
  ) {
    result.needsAdminReview =
      true;

    if (
      result.riskLevel ===
      "low"
    ) {
      result.riskLevel =
        "medium";
    }
  }

  if (
    decision === "blocked"
  ) {
    result.riskLevel =
      "high";

    result.isViolationSuspected =
      true;

    result.needsAdminReview =
      true;
  }

  if (decision === "safe") {
    /*
     * Chỉ cho safe nếu AI không phát hiện tín hiệu trái ngược.
     */
    if (
      result.selfHarmSuspected ||
      result.isViolationSuspected
    ) {
      decision =
        "review_required";

      result.needsAdminReview =
        true;

      result.riskLevel =
        highestRisk(
          result.riskLevel,
          "medium"
        );
    }
  }

  return {
    ...result,
    decision,
  };
}

async function checkVisionContext(
  imageUrl
) {
  const result =
    createEmptyVisionResult();

  const {
    apiUrl,
    apiKey,
    model,
    timeout,
  } = getVisionConfig();

  if (
    !apiUrl ||
    !apiKey ||
    !model
  ) {
    return {
      ...result,

      error:
        "Thiếu VISION_AI_API_URL, VISION_AI_API_KEY hoặc VISION_AI_MODEL.",
    };
  }

  const controller =
    new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    console.log(
      "[VISION AI CONFIG]",
      {
        apiUrl,
        model,
        keyPrefix:
          apiKey.slice(0, 7),
        keySuffix:
          apiKey.slice(-4),
        imageUrl,
      }
    );

    const response = await fetch(
      apiUrl,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          buildResponsesPayload(
            model,
            imageUrl
          )
        ),

        signal:
          controller.signal,
      }
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        `Vision AI failed with status ${response.status}: ${responseText.slice(
          0,
          1000
        )}`
      );
    }

    let responseData;

    try {
      responseData =
        JSON.parse(responseText);
    } catch (_) {
      throw new Error(
        `Vision AI trả response không phải JSON: ${responseText.slice(
          0,
          500
        )}`
      );
    }

    const rawOutput =
      extractResponseText(
        responseData
      );

    if (!rawOutput) {
      console.error(
        "[VISION AI FULL RESPONSE]",
        JSON.stringify(
          responseData,
          null,
          2
        )
      );

      throw new Error(
        "Vision AI không trả về output_text."
      );
    }

    const parsed =
      extractJsonObject(
        rawOutput
      );

    const normalized =
      normalizeVisionResult(
        parsed
      );

    console.log(
      "[VISION AI RESULT]",
      normalized
    );

    return normalized;
  } catch (error) {
    const message =
      error?.name ===
      "AbortError"
        ? "Vision AI request timeout."
        : error?.message ||
          "Không thể gọi Vision AI.";

    console.error(
      "[VISION AI IMAGE ERROR]",
      {
        imageUrl,
        apiUrl,
        message,
      }
    );

    /*
     * Lỗi API không đồng nghĩa ảnh nguy hiểm.
     */
    return {
      ...result,

      checked: false,

      error: message,

      reason: null,

      riskLevel: "low",

      isViolationSuspected:
        false,

      needsAdminReview:
        false,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function moderateImage(
  imageUrl
) {
  const normalizedUrl =
    String(imageUrl || "")
      .trim();

  if (!normalizedUrl) {
    return {
      imageUrl:
        normalizedUrl,

      checked:
        false,

      decision:
        "review_required",

      riskLevel:
        "medium",

      isViolationSuspected:
        false,

      needsAdminReview:
        true,

      reason:
        "URL hình ảnh trống.",

      layer1:
        createDisabledLayer1(),

      layer2: {
        ...createEmptyVisionResult(),

        error:
          "imageUrl rỗng.",
      },

      checkedAt:
        new Date(),
    };
  }

  const visionResult =
    await checkVisionContext(
      normalizedUrl
    );

  /*
   * Provider lỗi:
   * status failed, không kết luận ảnh nguy hiểm.
   */
  if (!visionResult.checked) {
    return {
      imageUrl:
        normalizedUrl,

      checked:
        false,

      decision:
        "safe",

      riskLevel:
        "low",

      isViolationSuspected:
        false,

      needsAdminReview:
        false,

      reason:
        null,

      error:
        visionResult.error,

      layer1:
        createDisabledLayer1(),

      layer2:
        visionResult,

      checkedAt:
        new Date(),
    };
  }

  return {
    imageUrl:
      normalizedUrl,

    checked:
      true,

    decision:
      visionResult.decision,

    riskLevel:
      visionResult.riskLevel,

    isViolationSuspected:
      visionResult
        .isViolationSuspected,

    needsAdminReview:
      visionResult
        .needsAdminReview,

    reason:
      visionResult.reason,

    error:
      null,

    layer1:
      createDisabledLayer1(),

    layer2:
      visionResult,

    checkedAt:
      new Date(),
  };
}

async function moderatePostImages(
  mediaUrls = []
) {
  const imageUrls =
    Array.isArray(mediaUrls)
      ? mediaUrls
          .filter(
            (media) =>
              media?.type ===
                "image" &&
              media?.url
          )
          .map((media) =>
            String(
              media.url
            ).trim()
          )
          .filter(Boolean)
      : [];

  if (
    imageUrls.length === 0
  ) {
    return {
      checked:
        true,

      status:
        "not_applicable",

      overallRiskLevel:
        "low",

      isViolationSuspected:
        false,

      needsAdminReview:
        false,

      reason:
        null,

      results:
        [],

      checkedAt:
        new Date(),
    };
  }

  const results =
    await Promise.all(
      imageUrls.map(
        moderateImage
      )
    );

  const hasBlocked =
    results.some(
      (item) =>
        item.decision ===
        "blocked"
    );

  const hasReviewRequired =
    results.some(
      (item) =>
        item.decision ===
          "review_required"
    );

  const anyChecked =
    results.some(
      (item) =>
        item.checked
    );

  const allChecked =
    results.every(
      (item) =>
        item.checked
    );

  const overallRiskLevel =
    highestRisk(
      ...results.map(
        (item) =>
          item.riskLevel
      )
    );

  const isViolationSuspected =
    results.some(
      (item) =>
        item
          .isViolationSuspected
    );

  const needsAdminReview =
    results.some(
      (item) =>
        item
          .needsAdminReview
    );

  let status = "safe";

  if (hasBlocked) {
    status = "blocked";
  } else if (
    hasReviewRequired
  ) {
    status =
      "review_required";
  } else if (!anyChecked) {
    status = "failed";
  } else {
    status = "safe";
  }

  const reason =
    results
      .map(
        (item) =>
          item.reason
      )
      .filter(Boolean)
      .join(" ") ||
    null;

  console.log(
    "[IMAGE MODERATION FINAL]",
    {
      checked:
        allChecked,

      status,

      overallRiskLevel,

      isViolationSuspected,

      needsAdminReview,

      reason,
    }
  );

  return {
    checked:
      allChecked,

    status,

    overallRiskLevel,

    isViolationSuspected,

    needsAdminReview,

    reason,

    results,

    checkedAt:
      new Date(),
  };
}

module.exports = {
  moderateImage,
  moderatePostImages,
  checkVisionContext,
};