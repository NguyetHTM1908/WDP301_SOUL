const SYSTEM_PROMPT = `
Bạn là Soul AI — người bạn đồng hành cảm xúc của nền tảng SOUL.

Vai trò của bạn là AI Emotional Companion, không phải bác sĩ, chuyên gia tâm lý hay therapist.
Bạn không chẩn đoán, không kê thuốc, không kết luận người dùng mắc bệnh.
Bạn chỉ lắng nghe, phản chiếu cảm xúc, giúp người dùng chậm lại và nhìn rõ điều đang xảy ra trong lòng mình.

Phong cách trả lời:
- Luôn dùng tiếng Việt tự nhiên, đời thường.
- Xưng là "mình", gọi người dùng là "bạn".
- Giọng ấm áp, trưởng thành, chân thành.
- Trả lời như một người bạn đang lắng nghe, không như chatbot tư vấn.
- Ưu tiên phản chiếu cảm xúc hơn là đưa lời khuyên.
- Không vội giải pháp ở câu đầu.
- Không đánh số, không bullet point.
- Không dùng "tôi".
- Không mô tả cảm xúc của chính Soul AI.
- Kết thúc bằng tối đa 1 câu hỏi gợi mở cụ thể.

Không được nói:
"Rất tiếc vì điều này."
"Mọi chuyện sẽ ổn."
"Hãy cố lên."
"Bạn không một mình."
"Tôi hiểu hoàn toàn cảm giác của bạn."
"Hy vọng thông tin này hữu ích."
"Mình cũng từng..."
"Mình cảm thấy..."
"Mình nghĩ..."
"Mình thấy mình..."
"Mình cũng lo..."
"Bạn có muốn cùng..."
"Chúng ta cùng..."

Không dùng tiếng Anh hoặc từ lóng:
heal, toxic, trigger, overthinking, negative energy, vibe.
`;

const SELF_HARM_KEYWORDS = [
  "muốn chết",
  "tự tử",
  "không muốn sống",
  "chết đi",
  "cắt tay",
  "uống thuốc",
  "tự làm đau",
  "kết thúc cuộc đời",
  "biến mất mãi mãi",
  "muốn biến mất",
  "không còn lý do sống",
  "i want to die",
  "suicide",
];

const MEDICAL_EMERGENCY_KEYWORDS = [
  "khó thở",
  "khong tho",
  "không thở được",
  "khong tho duoc",
  "đau ngực",
  "dau nguc",
  "ngất",
  "sắp ngất",
  "sap ngat",
  "chóng mặt dữ dội",
];

function detectRisk(message = "") {
  const msg = message.toLowerCase();

  if (MEDICAL_EMERGENCY_KEYWORDS.some((keyword) => msg.includes(keyword))) {
    return {
      riskLevel: "emergency",
      safetyWarning: true,
    };
  }

  if (SELF_HARM_KEYWORDS.some((keyword) => msg.includes(keyword))) {
    return {
      riskLevel: "high",
      safetyWarning: true,
    };
  }

  return {
    riskLevel: "low",
    safetyWarning: false,
  };
}

async function callSoulAI(message) {
  const start = Date.now();

  const { riskLevel, safetyWarning } = detectRisk(message);

  if (riskLevel === "emergency") {
    return {
      reply:
        "Mình nghe bạn nói đang có dấu hiệu cơ thể đáng lo, nên mình muốn ưu tiên an toàn trước. Nếu bạn đang khó thở nhiều, đau ngực, chóng mặt, sắp ngất hoặc cảm thấy nguy hiểm, hãy gọi cấp cứu hoặc nhờ người gần bạn hỗ trợ ngay. Nếu tình trạng nhẹ hơn và bạn vẫn an toàn, mình có thể ở đây cùng bạn vài phút để giúp bạn chậm lại nhịp thở.",
      riskLevel,
      safetyWarning,
      time: Number(((Date.now() - start) / 1000).toFixed(2)),
    };
  }

  if (riskLevel === "high") {
    return {
      reply:
        "Mình nghe thấy bạn đang ở trong một trạng thái rất nặng nề, và điều này cần được xem là nghiêm túc. Ngay lúc này, bạn có đang ở nơi an toàn không? Nếu bạn có ý định làm hại bản thân hoặc cảm thấy mình không kiểm soát được hành động, hãy gọi người thân đáng tin cậy ở gần bạn hoặc liên hệ dịch vụ hỗ trợ khẩn cấp tại nơi bạn sống ngay bây giờ.",
      riskLevel,
      safetyWarning,
      time: Number(((Date.now() - start) / 1000).toFixed(2)),
    };
  }

  if (!process.env.AI_SERVER_URL) {
    throw new Error("Missing AI_SERVER_URL in environment variables");
  }

  const aiUrl = `${process.env.AI_SERVER_URL.replace(/\/$/, "")}/chat`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("SOUL AI SPACE ERROR:", data);
      throw new Error(data?.detail || data?.error || "Soul AI Space error");
    }

    const reply = data?.reply || "";

    return {
      reply:
        reply ||
        "Mình đang hơi khó phản hồi rõ lúc này. Bạn có thể nói ngắn lại điều đang làm bạn nặng lòng nhất không?",
      riskLevel,
      safetyWarning,
      time: Number(((Date.now() - start) / 1000).toFixed(2)),
    };
  } catch (error) {
    console.error("CALL SOUL AI ERROR:", error);

    if (error.name === "AbortError") {
      throw new Error("Soul AI response timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  askSoulAI: callSoulAI,
  callSoulAI,
  detectRisk,
};