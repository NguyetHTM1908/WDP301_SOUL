const AiAnalysis = require("../models/AIAnalysis");
const UserEmotionProfile = require("../models/UserEmotionProfile");
const User = require("../models/User");

const {
  normalizeText,
  analyzeSafetyRisk,
  toEmotionSafetyResult,
} = require("./contentSafetyService");

const ALLOWED_TARGET_TYPES = [
  "chat_message",
  "diary",
  "post",
  "comment",
  "test_result",
];

const ALLOWED_SENTIMENTS = ["positive", "neutral", "negative"];
const ALLOWED_RISK_LEVELS = ["low", "medium", "high", "emergency"];
const ALLOWED_TOXICITY_LEVELS = ["low", "medium", "high"];

function escapeRegExp(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(normalizedText, phrase) {
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedText || !normalizedPhrase) {
    return false;
  }

  const regex = new RegExp(
    `(^|\\s)${escapeRegExp(normalizedPhrase)}($|\\s)`
  );

  return regex.test(normalizedText);
}

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
  "relieved",
  "safe",
  "supported",
  "loved",
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

function calculateConfidence(positiveScore, negativeScore, neutralScore) {
  const total = positiveScore + negativeScore + neutralScore;

  if (total === 0) {
    return 60;
  }

  const highest = Math.max(
    positiveScore,
    negativeScore,
    neutralScore
  );

  const confidence = Math.round((highest / total) * 100);

  return Math.min(95, Math.max(65, confidence));
}

function createKeywordResult({
  sentiment,
  emotionScore,
  confidenceScore = 90,
  riskLevel = "low",
  summary,
  suggestion,
}) {
  return {
    sentiment,
    emotion: sentiment,
    emotionScore,
    confidenceScore,
    riskLevel,
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    summary,
    suggestion,
  };
}

function classifySpecialCases(text) {
  const normalizedText = normalizeText(text);

  const hasLostMoney =
    normalizedText.includes("mat tien") ||
    normalizedText.includes("roi tien") ||
    normalizedText.includes("mat 500k") ||
    normalizedText.includes("roi 500k");

  const hasGoodScore =
    normalizedText.includes("10d") ||
    normalizedText.includes("10 diem") ||
    normalizedText.includes("diem cao") ||
    normalizedText.includes("diem toan") ||
    normalizedText.includes("diem van");

  const hasStress =
    normalizedText.includes("ap luc") ||
    normalizedText.includes("stress") ||
    normalizedText.includes("met moi") ||
    normalizedText.includes("kiet suc");

  const hasSad =
    normalizedText.includes("buon") ||
    normalizedText.includes("that vong") ||
    normalizedText.includes("chan");

  if (hasLostMoney && hasGoodScore) {
    return createKeywordResult({
      sentiment: "neutral",
      emotionScore: 50,
      confidenceScore: 90,
      summary:
        "Hôm nay bạn vừa có niềm vui khi đạt kết quả tốt, nhưng cũng cảm thấy tiếc và thất vọng vì chuyện mất tiền.",
      suggestion:
        "Việc mất tiền có thể khiến bạn khó chịu và tự trách mình, nhưng điều đó không làm mất đi thành quả bạn đã đạt được. Bạn có thể kiểm tra lại những nơi đã đi qua và ghi nhớ một cách cất giữ tiền an toàn hơn cho lần sau.",
    });
  }

  if (hasLostMoney) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 35,
      confidenceScore: 90,
      summary:
        "Bạn đang cảm thấy tiếc, buồn hoặc thất vọng vì chuyện mất tiền.",
      suggestion:
        "Mất tiền là chuyện rất khó chịu nên cảm giác tự trách là điều dễ xuất hiện. Bạn có thể bình tĩnh nhớ lại lộ trình đã đi, hỏi những nơi vừa ghé qua và tránh nặng lời với bản thân vì một lần sơ suất.",
    });
  }

  if (hasGoodScore) {
    return createKeywordResult({
      sentiment: "positive",
      emotionScore: 80,
      confidenceScore: 90,
      summary:
        "Nhật ký ghi nhận niềm vui và sự tự hào từ kết quả học tập hoặc công việc tốt.",
      suggestion:
        "Kết quả này phản ánh những nỗ lực bạn đã bỏ ra. Hãy ghi lại điều đã giúp bạn làm tốt để có thể tiếp tục áp dụng cho những mục tiêu tiếp theo.",
    });
  }

  if (hasStress) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 35,
      confidenceScore: 88,
      summary:
        "Nhật ký cho thấy bạn đang chịu nhiều áp lực và có dấu hiệu mệt mỏi.",
      suggestion:
        "Khối lượng công việc hiện tại có thể đang vượt quá sức bạn trong một lúc. Bạn nên chọn một việc quan trọng nhất để xử lý trước, đồng thời trao đổi sớm với người liên quan nếu thời hạn hoặc yêu cầu đang không thực tế.",
    });
  }

  if (hasSad) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 40,
      confidenceScore: 85,
      summary:
        "Bạn đang trải qua cảm giác buồn bã, chán nản hoặc thất vọng.",
      suggestion:
        "Bạn có thể ghi rõ sự việc nào đã khiến cảm xúc này xuất hiện và điều gì trong sự việc đó làm bạn tổn thương nhất. Việc gọi đúng tên nguyên nhân thường giúp cảm xúc bớt mơ hồ và dễ xử lý hơn.",
    });
  }

  return null;
}

function classifyEmotionByKeyword(text) {
  const normalizedText = normalizeText(text);

  const safetyEmotionResult = toEmotionSafetyResult(text);

  if (safetyEmotionResult) {
    return safetyEmotionResult;
  }

  const specialResult = classifySpecialCases(text);

  if (specialResult) {
    return specialResult;
  }

  const recoveryCount = countKeywordMatches(
    normalizedText,
    positiveRecoveryPhrases
  );

  let positiveScore = countWeightedMatches(
    normalizedText,
    positiveKeywords,
    2
  );

  let negativeScore = countWeightedMatches(
    normalizedText,
    negativeKeywords,
    2
  );

  let neutralScore = countWeightedMatches(
    normalizedText,
    neutralKeywords,
    1
  );

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
    negativeScore = Math.max(
      0,
      negativeScore - recoveryCount * 2
    );
  }

  const confidenceScore = calculateConfidence(
    positiveScore,
    negativeScore,
    neutralScore
  );

  if (negativeScore > positiveScore && negativeScore >= 2) {
    const emotionScore =
      negativeScore >= 8
        ? 20
        : negativeScore >= 5
        ? 30
        : 40;

    return createKeywordResult({
      sentiment: "negative",
      emotionScore,
      confidenceScore,
      riskLevel: negativeScore >= 8 ? "medium" : "low",
      summary:
        "Nội dung nhật ký cho thấy bạn đang trải qua cảm xúc buồn, lo lắng hoặc áp lực.",
      suggestion:
        "Bạn có thể chọn một sự việc cụ thể đang làm mình nặng lòng nhất và viết rõ điều bạn mong muốn thay đổi ở sự việc đó. Khi vấn đề được thu nhỏ thành một phần cụ thể, bạn sẽ dễ nhìn ra bước tiếp theo hơn.",
    });
  }

  if (positiveScore > negativeScore && positiveScore >= 2) {
    const emotionScore =
      positiveScore >= 8
        ? 90
        : positiveScore >= 5
        ? 80
        : 70;

    return createKeywordResult({
      sentiment: "positive",
      emotionScore,
      confidenceScore,
      summary:
        "Nội dung nhật ký thể hiện sự vui vẻ, nhẹ nhõm hoặc có thêm động lực.",
      suggestion:
        "Bạn có thể ghi lại điều cụ thể đã tạo nên cảm xúc tích cực hôm nay. Đây sẽ là một gợi ý hữu ích để bạn chủ động tạo thêm những khoảnh khắc tương tự trong những ngày sau.",
    });
  }

  return createKeywordResult({
    sentiment: "neutral",
    emotionScore: 50,
    confidenceScore,
    summary:
      "Nội dung nhật ký hiện thể hiện trạng thái cảm xúc tương đối cân bằng hoặc chưa có cảm xúc nào chiếm ưu thế.",
    suggestion:
      "Bạn có thể ghi thêm sự việc nổi bật nhất trong ngày và cảm giác xuất hiện ngay sau sự việc đó. Chi tiết này sẽ giúp việc nhận diện cảm xúc chính xác hơn.",
  });
}

function buildAIPrompt(text) {
  return `
Bạn là Soul AI, hệ thống phân tích cảm xúc cho ứng dụng SOUL.

Hãy phân tích nội dung nhật ký sau:
"${String(text || "").replace(/"/g, '\\"')}"

Yêu cầu:
- Phản hồi hoàn toàn bằng tiếng Việt.
- Không chẩn đoán bệnh.
- Không kê thuốc.
- Không kết luận y khoa.
- Phải nhắc đến sự kiện hoặc vấn đề cụ thể trong nhật ký.
- Không dùng nhận xét chung chung nếu có thể trích xuất được sự kiện cụ thể.
- Lời nhắn phải liên quan trực tiếp đến vấn đề người dùng đang gặp.
- Không tự ý đưa ra cảnh báo tự làm hại nếu nội dung không thể hiện dấu hiệu đó.

Trả về JSON chính xác theo cấu trúc:
{
  "sentiment": "positive | neutral | negative",
  "emotion": "positive | neutral | negative",
  "emotionScore": 0,
  "confidenceScore": 0,
  "riskLevel": "low | medium | high",
  "toxicityLevel": "low | medium | high",
  "safetyTriggered": false,
  "safetyType": null,
  "summary": "Nhận xét 1-2 câu có nhắc đến sự kiện cụ thể.",
  "suggestion": "Lời nhắn 2-3 câu liên quan trực tiếp đến vấn đề."
}

Quy tắc emotionScore:
- 0 đến 40: negative.
- 41 đến 60: neutral.
- 61 đến 100: positive.

Chỉ trả về JSON, không bọc trong markdown.
`;
}

function extractAIContent(data) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.result === "string") {
    return data.result;
  }

  if (typeof data.text === "string") {
    return data.text;
  }

  if (typeof data.response === "string") {
    return data.response;
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  if (typeof data.content === "string") {
    return data.content;
  }

  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  return null;
}

function clampScore(value, fallback = 50) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, numericValue));
}

function normalizeAIResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid AI emotion result");
  }

  const sentimentValue = String(
    parsed.sentiment || parsed.emotion || "neutral"
  ).toLowerCase();

  const sentiment = ALLOWED_SENTIMENTS.includes(sentimentValue)
    ? sentimentValue
    : "neutral";

  const fallbackEmotionScore =
    sentiment === "positive"
      ? 75
      : sentiment === "negative"
      ? 35
      : 50;

  const emotionScore = clampScore(
    parsed.emotionScore !== undefined
      ? parsed.emotionScore
      : parsed.score,
    fallbackEmotionScore
  );

  const confidenceScore = clampScore(
    parsed.confidenceScore,
    80
  );

  const riskLevelValue = String(
    parsed.riskLevel || "low"
  ).toLowerCase();

  const riskLevel = ALLOWED_RISK_LEVELS.includes(riskLevelValue)
    ? riskLevelValue
    : "low";

  const toxicityValue = String(
    parsed.toxicityLevel || "low"
  ).toLowerCase();

  const toxicityLevel = ALLOWED_TOXICITY_LEVELS.includes(
    toxicityValue
  )
    ? toxicityValue
    : "low";

  const safetyTriggered = Boolean(parsed.safetyTriggered);

  return {
    sentiment,
    emotion: sentiment,
    emotionScore,
    confidenceScore,
    riskLevel,
    toxicityLevel,
    safetyTriggered,
    safetyType: safetyTriggered
      ? parsed.safetyType || "self_harm_risk"
      : null,
    summary:
      parsed.summary ||
      parsed.insight ||
      "Đã hoàn thành phân tích cảm xúc.",
    suggestion:
      parsed.suggestion ||
      parsed.advice ||
      "Cảm ơn bạn đã chia sẻ những điều đã xảy ra trong ngày.",
  };
}

async function classifyEmotionByAI(text) {
  if (!process.env.AI_EMOTION_API_URL) {
    throw new Error("AI_EMOTION_API_URL is not configured");
  }

  const apiUrl = process.env.AI_EMOTION_API_URL;
  const apiKey =
    process.env.AI_EMOTION_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";

  const prompt = buildAIPrompt(text);
  const isOpenAI = apiUrl.includes("api.openai.com");

  const requestBody = isOpenAI
    ? {
        model:
          process.env.AI_EMOTION_MODEL ||
          process.env.OPENAI_EMOTION_MODEL ||
          "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
      }
    : {
        prompt,
        temperature: 0.2,
      };

  const headers = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, Number(process.env.AI_EMOTION_TIMEOUT_MS || 60000));

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `AI emotion API failed with status ${response.status}: ${responseText}`
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      data = responseText;
    }

    let content = extractAIContent(data);

    if (!content) {
      throw new Error("AI emotion API returned empty result");
    }

    content = String(content)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(content);

    return normalizeAIResult(parsed);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("AI emotion analysis timeout");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function classifyEmotionHybrid(text) {
  /**
   * contentSafetyService luôn chạy trước AI.
   * AI không được phép ghi đè kết quả an toàn nghiêm trọng.
   */
  const safetyResult = analyzeSafetyRisk(text);

  if (safetyResult.safetyTriggered) {
    const safetyEmotionResult = toEmotionSafetyResult(text);

    if (safetyEmotionResult) {
      return safetyEmotionResult;
    }
  }

  try {
    const aiResult = await classifyEmotionByAI(text);

    /**
     * Chạy lại safety sau AI để bảo đảm AI không bỏ sót
     * hoặc tự trả safetyTriggered sai.
     */
    const verifiedSafetyResult = analyzeSafetyRisk(text);

    if (verifiedSafetyResult.safetyTriggered) {
      return (
        toEmotionSafetyResult(text) ||
        classifyEmotionByKeyword(text)
      );
    }

    return {
      ...aiResult,
      safetyTriggered: false,
      safetyType: null,
    };
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
    (sum, item) => sum + Number(item.emotionScore || 0),
    0
  );

  const averageEmotionScore =
    analysisCount > 0
      ? Math.round(totalScore / analysisCount)
      : 50;

  let currentSentiment = "neutral";

  if (negativeCount >= 3 || averageEmotionScore <= 40) {
    currentSentiment = "negative";
  } else if (
    positiveCount >= 3 ||
    averageEmotionScore >= 65
  ) {
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
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  await User.findByIdAndUpdate(userId, {
    $set: {
      moodReputation: profile.currentSentiment,
      moodReputationScore: profile.averageEmotionScore,
      moodReputationUpdatedAt: new Date(),
    },
  });

  return profile;
}

async function analyze({
  userId,
  targetType,
  targetId,
  text,
  modelName = "hybrid-emotion-v2",
}) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!targetType) {
    throw new Error("targetType is required");
  }

  if (!ALLOWED_TARGET_TYPES.includes(targetType)) {
    throw new Error("Invalid targetType");
  }

  if (!targetId) {
    throw new Error("targetId is required");
  }

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    throw new Error("text is required");
  }

  const result = await classifyEmotionHybrid(cleanText);

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
    sourceTextSnapshot: cleanText,
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

async function analyzeFromChat(
  userId,
  chatMessageId,
  messageContent
) {
  return analyze({
    userId,
    targetType: "chat_message",
    targetId: chatMessageId,
    text: messageContent,
  });
}

async function analyzeFromDiary(
  userId,
  diaryId,
  diaryContent
) {
  return analyze({
    userId,
    targetType: "diary",
    targetId: diaryId,
    text: diaryContent,
  });
}

async function analyzeFromPost(
  userId,
  postId,
  postContent
) {
  return analyze({
    userId,
    targetType: "post",
    targetId: postId,
    text: postContent,
  });
}

async function analyzeFromComment(
  userId,
  commentId,
  commentContent
) {
  return analyze({
    userId,
    targetType: "comment",
    targetId: commentId,
    text: commentContent,
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

  const safeLimit = Math.min(
    100,
    Math.max(1, Number(limit) || 30)
  );

  return AiAnalysis.find({
    userId,
    analysisType: "emotion_analysis",
  })
    .sort({ analyzedAt: -1 })
    .limit(safeLimit);
}

module.exports = {
  analyze,

  analyzeFromChat,
  analyzeFromDiary,
  analyzeFromPost,
  analyzeFromComment,

  classifyEmotionHybrid,
  classifyEmotionByAI,
  classifyEmotionByKeyword,

  getUserEmotionProfile,
  getUserEmotionHistory,
};