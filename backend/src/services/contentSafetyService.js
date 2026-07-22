const RISK_LEVELS = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  EMERGENCY: "emergency",
});

const SAFETY_TYPES = Object.freeze({
  SELF_HARM_RISK: "self_harm_risk",
  MEDICAL_EMERGENCY: "medical_emergency",
  VIOLENCE: "violence",
  ILLEGAL_CONTENT: "illegal_content",
});

const VIOLATION_TYPES = Object.freeze({
  SELF_HARM: "self_harm",
  VIOLENCE: "violence",
  ILLEGAL_CONTENT: "illegal_content",
});

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/['’]/g, "")
    .replace(/(.)\1{2,}/g, "$1$1")
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
      " "
    )
    .replace(/[.,!?;:()[\]{}"`~@#$%^&*_+=|\\/<>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesAnyPattern(normalizedText, patterns) {
  if (!normalizedText) {
    return false;
  }

  return patterns.some((pattern) => pattern.test(normalizedText));
}

const MEDICAL_EMERGENCY_PATTERNS = [
  /\b(kho tho|rat kho tho|khong tho duoc|khong the tho|tho khong ra hoi)\b/,
  /\b(dau nguc|rat dau nguc|tuc nguc|that nguc)\b/,
  /\b(sap ngat|sap xiu|ngat xiu|bat tinh|mat y thuc)\b/,
  /\b(chong mat du doi|choang vang du doi)\b/,
  /\b(co giat)\b/,
  /\b(chay mau nhieu|mat mau nhieu|chay mau khong cam duoc)\b/,
];

const SELF_HARM_PATTERNS = [
  /\b(muon|mong|uoc|chi muon|rat muon|het muon|khong muon|khong can|chan|met moi).{0,100}(chet|tu tu|bien mat mai mai|khong song|khong ton tai|roi khoi cuoc doi)\b/,
  /\b(muon chet|muon di chet|khong muon song|khong thiet song|khong con muon song|het muon song|song lam gi nua|khong con ly do song)\b/,
  /\b(khong con|chang con|het|chẳng còn|khong).{0,60}(thiet tha|luyen tiec|hy vong|ly do|dong luc).{0,80}(song|su song|cuoc song|cuoc doi|tiep tuc)\b/,
  /\b(khong thiet tha|chang thiet tha|het thiet tha).{0,50}(su song|cuoc song|cuoc doi|song nua)\b/,
  /\b(su song|cuoc song|cuoc doi).{0,60}(khong con y nghia|chang con y nghia|vo nghia|het y nghia)\b/,
  /\b(khong con gi|chang con gi|het gi).{0,60}(de song|de tiep tuc|de co gang|de luyen tiec)\b/,
  /\b(chet di cho roi|chet di cho xong|mong chet di cho roi|muon ngu mai khong day|ngu mot giac khong day|ket thuc cuoc doi|ket thuc moi thu)\b/,
  /\b(muon|mong|uoc|gia nhu|chi can).{0,80}(bien mat|khong thuc day|khong ton tai|chua tung ton tai|roi khoi the gioi nay)\b/,
  /\b(muon bien mat|bien mat mai mai|bien mat khoi moi thu|khong muon ton tai|khong can ton tai)\b/,
  /\b(moi nguoi|gia dinh|bo me|ban be|ho|nguoi khac).{0,100}(se tot hon|se nhe nhom hon|se do kho hon|se bot met hon).{0,100}(neu khong co minh|neu minh bien mat|neu minh khong con)\b/,
  /\b(khong co minh|minh khong con|minh bien mat).{0,80}(moi nguoi|gia dinh|bo me|ban be).{0,80}(tot hon|nhe nhom hon|bot met hon)\b/,
  /\b(cam on|xin loi|tam biet).{0,120}(lan cuoi|bai cuoi|loi cuoi|khong con gap lai|khong con nua|roi khoi cuoc doi)\b/,
  /\b(day la|co le la|chac la).{0,40}(bai cuoi|loi cuoi|lan cuoi).{0,100}(cua minh|minh viet|minh noi|tren doi)\b/,
  /\b(cat|rach|tu cat|lam dau|tu lam dau|lam hai|tu hai).{0,60}(co tay|tay|ban than|minh|toi|tao|em)\b/,
  /\b(that co|treo co|uong thuoc de chet|uong het thuoc|nhay lau|nhay cau|lao vao xe)\b/,
  /\b(i want to die|i wanna die|i do not want to live|i dont want to live|suicide|suicidal|kill myself|end my life|self harm|hurt myself|cut myself)\b/,
  /\b(i wish i would not wake up|i wish i wouldnt wake up|everyone would be better without me|there is no reason to live|life is not worth living)\b/,
];

const VIOLENCE_PATTERNS = [
  /\b(muon|mong|se|sap|dinh|di|ru|keo nguoi|goi nguoi|canh).{0,80}(danh|dap|dam|chem|giet|xu|bem|tan|hanh hung|de doa|tra thu)\b/,

  /\b(danh nhau|di danh nhau|muon danh nhau|cho no mot tran|cho no 1 tran|dap no|danh no|xu no|bem no|tan no|giet no|de doa no|tra thu no)\b/,

  /\b(i will beat|beat .* up|i will kill|kill him|kill her|attack him|attack her|fight him|fight her)\b/,
];

const ILLEGAL_CONTENT_PATTERNS = [
  /\b(mua|ban|ship|giao|tim moi).{0,30}(ma tuy|can sa|hang cam)\b/,
  /\bhack\s+(tai khoan|account)\b/,
  /\b(lua dao|ca do|betting|scam)\b/,
];

function createSafeResult() {
  return {
    riskLevel: RISK_LEVELS.LOW,
    safetyWarning: false,
    safetyTriggered: false,
    safetyType: null,

    isViolationSuspected: false,
    violationType: null,
    severity: "low",
    confidenceScore: 90,

    reason: null,
    description: null,
  };
}

function createRiskResult({
  riskLevel,
  safetyType,
  violationType = null,
  severity = "high",
  confidenceScore = 90,
  reason,
  description = null,
  isExplicitDenial = false,
  isEmergencyPlan = false,
  isThirdPerson = false,
  isHistorical = false,
}) {
  return {
    riskLevel,
    safetyWarning: true,
    safetyTriggered: true,
    safetyType,

    isViolationSuspected: Boolean(violationType),
    violationType,
    severity,
    confidenceScore,

    isExplicitDenial,
    isEmergencyPlan,
    isThirdPerson,
    isHistorical,

    reason,
    description: description || reason,
  };
}

function analyzeSafetyRisk(content = "") {
  const normalizedText = normalizeText(content);

  if (!normalizedText) {
    return createSafeResult();
  }

  // 1. Third-person or Quoted mention: "Bạn tôi nói...", "Đọc bài viết có câu..."
  const isThirdPerson =
    /\b(ban toi|ban cua toi|nguoi ban|anh toi|chi toi|em toi|bo toi|me toi|ban ay|ho noi|doc bai viet|nghe ke|nguoi khac|co nguoi|doc tren|thay bai viet)\b/.test(normalizedText) &&
    /\b(muon chet|tu tu|khong muon song|muon bien mat|muon giet minh)\b/.test(normalizedText);

  if (isThirdPerson) {
    return {
      riskLevel: RISK_LEVELS.MEDIUM,
      safetyWarning: false,
      safetyTriggered: false,
      safetyType: null,
      isThirdPerson: true,
      reason: "Nội dung nhắc đến người khác hoặc trích dẫn bài viết, không phải ý định tự hại của bản thân.",
      description: "Người dùng thuật lại chia sẻ của bạn bè hoặc nội dung trích dẫn.",
    };
  }

  // 2. Historical / Past Tense mention: "Trước đây tôi từng...", "Hồi trước..."
  const isHistorical =
    /\b(truoc day|hoi truoc|da tung|tung co y dinh|qua khu|ngay truoc|dieu do da qua)\b/.test(normalizedText) &&
    /\b(muon chet|tu tu|muon bien mat|khong muon song)\b/.test(normalizedText) &&
    /\b(nhung gio|hien tai|bay gio|da on|on hon|da vuot qua|khong con y dinh|khong con muon)\b/.test(normalizedText);

  if (isHistorical) {
    return {
      riskLevel: RISK_LEVELS.LOW,
      safetyWarning: false,
      safetyTriggered: false,
      safetyType: null,
      isHistorical: true,
      reason: "Nội dung đề cập đến ý nghĩ trong quá khứ nhưng hiện tại đã ổn định hơn.",
      description: "Mệnh đề hiện tại phản ánh trạng thái đã hồi phục.",
    };
  }

  // 3. Hopelessness with explicit denial of self-harm / suicide intent
  const isExplicitDenial =
    /\b(khong muon chet|khong co y dinh tu tu|khong muon tu tu|khong dinh tu tu|khong dinh lam hai ban than|khong muon tu lam hai|toi khong muon chet)\b/.test(normalizedText);

  if (isExplicitDenial) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.HIGH,
      safetyType: SAFETY_TYPES.SELF_HARM_RISK,
      violationType: VIOLATION_TYPES.SELF_HARM,
      severity: "medium",
      confidenceScore: 95,
      isExplicitDenial: true,
      reason: "Nội dung thể hiện sự bế tắc/vô nghĩa nhưng khẳng định không có ý định tự hại.",
      description: "Người dùng mệt mỏi nhưng ghi nhận rõ không muốn chết hay tự hại.",
    });
  }

  // 4. Explicit Intent / Emergency Plan: "Tôi muốn chết", "Tôi sẽ tự tử", "chuẩn bị thuốc"
  const isEmergencyPlan =
    /\b(toi muon chet|toi se tu tu|chuan bi thuoc|ket thuc moi thu|toi se lam hai ban than|toi se chet|giet minh toi nay|uong thuoc toi nay|lam hai ban than toi nay)\b/.test(normalizedText);

  if (isEmergencyPlan) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.EMERGENCY,
      safetyType: SAFETY_TYPES.SELF_HARM_RISK,
      violationType: VIOLATION_TYPES.SELF_HARM,
      severity: "high",
      confidenceScore: 99,
      isEmergencyPlan: true,
      reason: "Nội dung thể hiện ý định hoặc kế hoạch khẩn cấp tự hại/tự tử.",
      description: "Cảnh báo khẩn cấp: Ý định tự tử rõ ràng hoặc chuẩn bị phương tiện khẩn cấp.",
    });
  }

  if (matchesAnyPattern(normalizedText, MEDICAL_EMERGENCY_PATTERNS)) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.EMERGENCY,
      safetyType: SAFETY_TYPES.MEDICAL_EMERGENCY,
      violationType: null,
      severity: "high",
      confidenceScore: 98,
      reason:
        "Nội dung có dấu hiệu liên quan đến tình trạng cấp cứu y tế cần được ưu tiên xử lý.",
      description:
        "Người dùng mô tả triệu chứng cơ thể có thể cần được hỗ trợ y tế khẩn cấp.",
    });
  }

  if (matchesAnyPattern(normalizedText, SELF_HARM_PATTERNS)) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.HIGH,
      safetyType: SAFETY_TYPES.SELF_HARM_RISK,
      violationType: VIOLATION_TYPES.SELF_HARM,
      severity: "high",
      confidenceScore: 99,
      reason:
        "Nội dung có dấu hiệu tự làm hại bản thân hoặc không muốn tiếp tục sống.",
      description:
        "Nội dung thể hiện ý định hoặc dấu hiệu tự làm hại bản thân, tự tử, muốn chết hoặc không muốn tiếp tục sống. Cần admin xem xét khẩn cấp.",
    });
  }

  if (matchesAnyPattern(normalizedText, VIOLENCE_PATTERNS)) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.HIGH,
      safetyType: SAFETY_TYPES.VIOLENCE,
      violationType: VIOLATION_TYPES.VIOLENCE,
      severity: "high",
      confidenceScore: 96,
      reason:
        "Nội dung có dấu hiệu bạo lực hoặc đe dọa gây hại cho người khác.",
      description:
        "Nội dung thể hiện ý định đánh nhau, tấn công, trả thù, đe dọa hoặc gây tổn hại cho người khác. Cần admin xem xét.",
    });
  }

  if (matchesAnyPattern(normalizedText, ILLEGAL_CONTENT_PATTERNS)) {
    return createRiskResult({
      riskLevel: RISK_LEVELS.HIGH,
      safetyType: SAFETY_TYPES.ILLEGAL_CONTENT,
      violationType: VIOLATION_TYPES.ILLEGAL_CONTENT,
      severity: "high",
      confidenceScore: 92,
      reason:
        "Nội dung có dấu hiệu liên quan đến hành vi vi phạm pháp luật.",
      description:
        "Nội dung có dấu hiệu liên quan đến ma túy, lừa đảo, hack tài khoản, cá độ hoặc giao dịch bất hợp pháp.",
    });
  }

  return createSafeResult();
}

function detectRisk(content = "") {
  const result = analyzeSafetyRisk(content);

  return {
    riskLevel: result.riskLevel,
    safetyWarning: result.safetyWarning,
    safetyTriggered: result.safetyTriggered,
    safetyType: result.safetyType,
  };
}

function toEmotionSafetyResult(content = "") {
  const result = analyzeSafetyRisk(content);

  if (!result.safetyTriggered) {
    return null;
  }

  if (result.safetyType === SAFETY_TYPES.SELF_HARM_RISK) {
    // Tier 1: Hopelessness / Loss of Meaning (with explicit denial)
    if (result.isExplicitDenial) {
      return {
        sentiment: "negative",
        emotion: "negative",
        emotionScore: 35,
        diaryScore: 35,
        confidenceScore: result.confidenceScore,
        riskLevel: "medium",
        toxicityLevel: "low",
        safetyTriggered: true,
        safetyType: result.safetyType,
        summary:
          "SOUL lắng nghe sự mệt mỏi và cảm giác mất đi ý nghĩa cuộc sống mà bạn đang trải qua.",
        suggestion:
          "SOUL ghi nhận việc bạn khẳng định không có ý định làm hại bản thân. Cảm giác mất ý nghĩa là thật, nhưng nó không phải là mãi mãi. Hãy thử tìm một điều nhỏ trong ngày — một cuốn sách, âm nhạc hoặc trò chuyện với người bạn tin tưởng. Bạn không cần phải gánh vác cảm giác này một mình.",
      };
    }

    // Tier 3: Immediate Suicide Intent / Emergency Plan (e.g. "Tôi muốn chết.", "Tôi sẽ tự tử.")
    if (result.isEmergencyPlan || result.riskLevel === RISK_LEVELS.EMERGENCY) {
      return {
        sentiment: "negative",
        emotion: "negative",
        emotionScore: 10,
        diaryScore: 10,
        confidenceScore: result.confidenceScore,
        riskLevel: "emergency",
        toxicityLevel: "low",
        safetyTriggered: true,
        safetyType: result.safetyType,
        summary:
          "Nhật ký chứa tín hiệu nguy cơ khẩn cấp đối với sự an toàn của bạn.",
        suggestion:
          "Nếu bạn đang có ý định hoặc chuẩn bị làm hại bản thân, xin hãy dừng lại ngay. Đặt xa các vật có thể gây tổn thương, liên hệ ngay người thân ở gần nhất hoặc gọi ngay tổng đài hỗ trợ tâm lý khẩn cấp 1900 636 527 hoặc 115 để nhận trợ giúp kịp thời.",
      };
    }

    // Tier 2: Active Suicidal Ideation without explicit emergency plan (e.g. "Tôi không muốn sống nữa.")
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 15,
      diaryScore: 15,
      confidenceScore: result.confidenceScore,
      riskLevel: "high",
      toxicityLevel: "low",
      safetyTriggered: true,
      safetyType: result.safetyType,
      summary:
        "Nội dung nhật ký cho thấy bạn đang trải qua cảm xúc rất nặng nề và có ý nghĩ mệt mỏi với cuộc sống.",
      suggestion:
        "Trạng thái kiệt sức này hoàn toàn có thể tìm được sự hỗ trợ. Bạn không cần phải gánh vác điều này một mình. Hãy kết nối với một người bạn tin tưởng hoặc trò chuyện với tổng đài tư vấn tâm lý 1900 636 527 để nhận được sự lắng nghe an toàn.",
    };
  }

  if (result.safetyType === SAFETY_TYPES.MEDICAL_EMERGENCY) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 15,
      confidenceScore: result.confidenceScore,
      riskLevel: result.riskLevel,
      toxicityLevel: "low",
      safetyTriggered: true,
      safetyType: result.safetyType,
      summary:
        "Nội dung nhật ký có nhắc đến một số biểu hiện cơ thể cần được ưu tiên kiểm tra an toàn.",
      suggestion:
        "Nếu bạn đang khó thở nhiều, đau ngực, sắp ngất, co giật hoặc cảm thấy tình trạng nguy hiểm, hãy gọi cấp cứu hoặc nhờ người đang ở gần hỗ trợ ngay.",
    };
  }

  if (result.safetyType === SAFETY_TYPES.VIOLENCE) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 20,
      confidenceScore: result.confidenceScore,
      riskLevel: result.riskLevel,
      toxicityLevel: "high",
      safetyTriggered: true,
      safetyType: result.safetyType,
      summary:
        "Nội dung nhật ký cho thấy sự tức giận mạnh và có dấu hiệu muốn gây tổn hại cho người khác.",
      suggestion:
        "Hãy tạm rời khỏi người hoặc tình huống đang khiến bạn mất kiểm soát, không mang theo vật có thể gây thương tích và liên hệ một người đáng tin để hỗ trợ bạn bình tĩnh lại.",
    };
  }

  return {
    sentiment: "negative",
    emotion: "negative",
    emotionScore: 25,
    confidenceScore: result.confidenceScore,
    riskLevel: result.riskLevel,
    toxicityLevel: "high",
    safetyTriggered: true,
    safetyType: result.safetyType,
    summary: result.reason,
    suggestion:
      "Hãy dừng hành động liên quan và tìm một hướng giải quyết hợp pháp, an toàn hơn.",
  };
}

module.exports = {
  RISK_LEVELS,
  SAFETY_TYPES,
  VIOLATION_TYPES,

  normalizeText,
  createSafeResult,
  createRiskResult,

  analyzeSafetyRisk,
  detectRisk,
  toEmotionSafetyResult,
};