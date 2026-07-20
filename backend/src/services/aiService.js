const {
  RISK_LEVELS,
  SAFETY_TYPES,
  detectRisk,
} = require("./contentSafetyService");

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

function getEmergencyReply() {
  return "Mình nghe bạn nói đang có dấu hiệu cơ thể đáng lo, nên lúc này cần ưu tiên an toàn trước. Nếu bạn đang khó thở nhiều, đau ngực, chóng mặt dữ dội, sắp ngất hoặc cảm thấy tình trạng nguy hiểm, hãy gọi cấp cứu hoặc nhờ người đang ở gần hỗ trợ ngay. Bạn có thể nói ngay cho người gần nhất biết cơ thể bạn đang gặp vấn đề gì không?";
}

function getSelfHarmReply() {
  return "Điều bạn vừa nói cho thấy bạn có thể đang ở trong một thời điểm rất nguy hiểm. Nếu bạn đang chuẩn bị làm hại bản thân hoặc có sẵn thứ gì có thể khiến bạn bị thương, hãy đặt nó ra xa, đi đến chỗ có người và gọi ngay cho một người bạn tin tưởng hoặc dịch vụ khẩn cấp tại nơi bạn sống. Ngay lúc này bạn có đang ở nơi an toàn không?";
}

function getViolenceReply() {
  return "Cơn giận lúc này có vẻ đang rất mạnh và có nguy cơ khiến một người bị thương. Hãy tạm rời khỏi người bạn đang muốn đối đầu, đặt xa dao, kéo hoặc bất kỳ vật gì có thể gây thương tích, rồi gọi cho một người đáng tin để họ ở cùng bạn. Hiện tại bạn và người đó có đang ở cùng một nơi không?";
}

function getIllegalContentReply() {
  return "Mình không thể hỗ trợ hành vi có thể gây hại hoặc vi phạm pháp luật. Bạn nên dừng việc đó lại và tìm một cách giải quyết hợp pháp, an toàn hơn. Điều gì đang khiến bạn nghĩ đến hướng xử lý này?";
}

function getFallbackReply() {
  return "Mình đang hơi khó phản hồi rõ lúc này. Bạn có thể nói ngắn lại điều đang làm bạn nặng lòng nhất không?";
}

function getSafetyReply(safetyType) {
  switch (safetyType) {
    case SAFETY_TYPES.MEDICAL_EMERGENCY:
      return getEmergencyReply();

    case SAFETY_TYPES.SELF_HARM_RISK:
      return getSelfHarmReply();

    case SAFETY_TYPES.VIOLENCE:
      return getViolenceReply();

    case SAFETY_TYPES.ILLEGAL_CONTENT:
      return getIllegalContentReply();

    default:
      return null;
  }
}

function createResponseTime(startTime) {
  return Number(((Date.now() - startTime) / 1000).toFixed(2));
}

async function callSoulAI(message) {
  const startTime = Date.now();
  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    throw new Error("message is required");
  }

  const safetyResult = detectRisk(cleanMessage);
  const safetyReply = getSafetyReply(safetyResult.safetyType);

  /**
   * Các nội dung nguy hiểm được xử lý ngay tại backend,
   * không gửi tiếp sang model chat thông thường.
   */
  if (
    safetyResult.riskLevel === RISK_LEVELS.EMERGENCY ||
    safetyResult.riskLevel === RISK_LEVELS.HIGH
  ) {
    return {
      reply: safetyReply || getFallbackReply(),
      ...safetyResult,
      time: createResponseTime(startTime),
    };
  }

  if (!process.env.AI_SERVER_URL) {
    throw new Error("Missing AI_SERVER_URL in environment variables");
  }

  const baseUrl = process.env.AI_SERVER_URL.replace(/\/$/, "");
  const aiUrl = `${baseUrl}/chat`;

  const controller = new AbortController();

  const timeoutMilliseconds = Number(
    process.env.SOUL_AI_TIMEOUT_MS || 120000
  );

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMilliseconds);

  try {
    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: cleanMessage,
        systemPrompt: SYSTEM_PROMPT,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("SOUL AI SERVER ERROR:", {
        status: response.status,
        data,
      });

      throw new Error(
        data?.detail ||
          data?.error ||
          data?.message ||
          `Soul AI server failed with status ${response.status}`
      );
    }

    const reply = String(
      data?.reply ||
        data?.response ||
        data?.result ||
        data?.text ||
        ""
    ).trim();

    return {
      reply: reply || getFallbackReply(),
      ...safetyResult,
      time: createResponseTime(startTime),
    };
  } catch (error) {
    console.error("CALL SOUL AI ERROR:", error);

    if (error?.name === "AbortError") {
      throw new Error("Soul AI response timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  SYSTEM_PROMPT,
  askSoulAI: callSoulAI,
  callSoulAI,

  getEmergencyReply,
  getSelfHarmReply,
  getViolenceReply,

  detectRisk,
};