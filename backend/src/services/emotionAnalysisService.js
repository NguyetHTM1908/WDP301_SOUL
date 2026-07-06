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
      summary: "Nhật ký của bạn chứa các tín hiệu cảm xúc cực kỳ tiêu cực hoặc bất an.",
      suggestion:
        "Bạn đang phải chịu đựng áp lực rất lớn. Hãy chia sẻ với người bạn tin tưởng nhất hoặc liên hệ với các tổ chức hỗ trợ tâm lý. Soul luôn ở đây và muốn đồng hành cùng bạn.",
    };
  }

  // --- HỆ THỐNG PHÂN TÍCH TỪ KHÓA CHI TIẾT DỰ PHÒNG (CUSTOM KEYWORD FALLBACK) ---
  const lowerText = text.toLowerCase();
  const hasLostMoney = lowerText.includes("mất tiền") || (lowerText.includes("mất") && lowerText.includes("tiền")) || lowerText.includes("rơi tiền") || lowerText.includes("mất 500k") || lowerText.includes("rơi 500k");
  const hasGoodScore = lowerText.includes("10đ") || lowerText.includes("10 điểm") || lowerText.includes("điểm cao") || lowerText.includes("điểm toán") || lowerText.includes("điểm văn");
  const hasStress = lowerText.includes("áp lực") || lowerText.includes("stress") || lowerText.includes("mệt mỏi") || lowerText.includes("kiệt sức");
  const hasSad = lowerText.includes("buồn") || lowerText.includes("thất vọng") || lowerText.includes("chán");

  if (hasLostMoney && hasGoodScore) {
    return {
      sentiment: "neutral",
      emotion: "neutral",
      emotionScore: 45,
      confidenceScore: 90,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "Hôm nay bạn vừa có niềm vui khi đạt kết quả tốt, nhưng cũng cảm thấy thất vọng vì chuyện mất tiền.",
      suggestion: "Việc mất tiền có thể khiến bạn khó chịu và tự trách mình, nhưng điều đó không làm mất đi thành quả tốt bạn đã đạt được hôm nay. Bạn có thể thử kiểm tra lại những nơi đã đi qua, đồng thời xem đây là kinh nghiệm để cẩn thận hơn lần sau.",
    };
  }

  if (hasLostMoney) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 35,
      confidenceScore: 90,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "Bạn đang cảm thấy buồn hoặc thất vọng vì chuyện liên quan đến tiền bạc.",
      suggestion: "Mất tiền là chuyện rất khó chịu, nên cảm giác tiếc và tự trách là điều dễ hiểu. Hãy thử bình tĩnh nhớ lại những nơi bạn đã đi qua, và đừng quá nặng lời với bản thân vì ai cũng có lúc sơ suất.",
    };
  }

  if (hasStress) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 35,
      confidenceScore: 90,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "Nhật ký cho thấy bạn đang chịu áp lực hoặc cảm thấy mệt mỏi.",
      suggestion: "Có vẻ hôm nay bạn đã phải gồng gánh khá nhiều áp lực. Hãy chia nhỏ các việc cần làm thành từng phần nhỏ hơn, cho phép mình nghỉ ngơi một chút để hồi lại năng lượng nhé.",
    };
  }

  if (hasSad) {
    return {
      sentiment: "negative",
      emotion: "negative",
      emotionScore: 40,
      confidenceScore: 90,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "Bạn đang cảm nhận sự buồn bã hoặc thất vọng trong ngày hôm nay.",
      suggestion: "Cảm giác buồn không có nghĩa là bạn yếu đuối. Hãy cho phép bản thân chậm lại một chút, viết ra điều làm mình buồn và thử làm một việc nhỏ để thấy dễ chịu hơn nhé.",
    };
  }

  if (hasGoodScore) {
    return {
      sentiment: "positive",
      emotion: "positive",
      emotionScore: 75,
      confidenceScore: 90,
      riskLevel: "low",
      toxicityLevel: "low",
      safetyTriggered: false,
      safetyType: null,
      summary: "Nhật ký ghi nhận niềm vui hoặc kết quả học tập/công việc tốt.",
      suggestion: "Bạn đã nỗ lực rất nhiều hôm nay và xứng đáng được nhận niềm vui này. Hãy tận hưởng thành quả ngọt ngào và dùng nó làm động lực cho những ngày tiếp theo nhé.",
    };
  }
  // ------------------------------------------------------------------------------

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
      summary: "Nhật ký ghi nhận cảm giác buồn bã hoặc lo lắng.",
      suggestion:
        "Cảm ơn bạn đã trút bỏ gánh nặng này vào trang nhật ký. Hãy uống một chút nước ấm, thở đều và cho phép mình được nghỉ ngơi thật thoải mái nhé.",
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
      summary: "Nhật ký thể hiện nhiều năng lượng tích cực và hạnh phúc.",
      suggestion:
        "Thật tuyệt khi biết hôm nay bạn có những trải nghiệm dễ chịu! Hãy lưu giữ khoảnh khắc ấm áp này và tiếp tục yêu thương chính mình nhiều hơn nữa nhé.",
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
    summary: "Nhật ký thể hiện trạng thái cảm xúc cân bằng và nhẹ nhàng.",
    suggestion:
      "Một ngày bình thường, êm ả trôi qua cũng là một món quà đáng quý. Tiếp tục ghi lại hành trình của bạn để hiểu bản thân hơn nhé.",
  };
}

function buildAIPrompt(text) {
  return `
Bạn là Soul AI - người bạn đồng hành cảm xúc trong ứng dụng chăm sóc sức khỏe tinh thần SOUL.
Nhiệm vụ của bạn là đọc nhật ký của người dùng dưới đây và phản hồi bằng tiếng Việt dưới dạng JSON.

Nội dung nhật ký của người dùng:
"${text}"

Yêu cầu chi tiết:
1. Xác định cảm xúc tổng thể ("sentiment"): chỉ trả về một trong ba giá trị: "Positive", "Neutral", "Negative".
2. Tính điểm số cảm xúc ("score"): số từ 0 đến 100 (với 0-40 là Negative, 41-60 là Neutral, 61-100 là Positive).
3. Viết nhận xét ngắn gọn ("insight"):
   - Tóm tắt cảm xúc của người dùng hôm nay.
   - BẮT BUỘC phải nhắc đến sự kiện, vấn đề cụ thể được viết trong nhật ký (ví dụ: việc đạt điểm 10 môn Văn, việc làm mất 500k, việc cãi nhau với người yêu, v.v.).
   - Tuyệt đối không viết chung chung vô hồn kiểu "Nhật ký ghi nhận cảm giác buồn bã...".
   - Độ dài: 1-2 câu.
4. Viết lời khuyên/lời nhắn nhủ ("advice"):
   - Bày tỏ sự thấu hiểu, đồng cảm trước tiên.
   - Đưa ra lời khuyên thực tế, liên quan trực tiếp đến vấn đề người dùng đang đối mặt trong nhật ký.
   - Không chỉ đưa ra những lời khuyên chung chung rập khuôn như đi nghỉ ngơi, uống nước ấm, hít thở sâu.
   - Giọng văn nhẹ nhàng, ấm áp như một người bạn thân bên cạnh.
   - Không tự chẩn đoán bệnh tâm lý hay kê đơn thuốc.
   - Độ dài: 2-3 câu.

Định dạng JSON phản hồi chính xác như sau (không bọc trong markdown):
{
  "sentiment": "Positive | Neutral | Negative",
  "score": 0-100,
  "insight": "nhận xét cụ thể sự kiện bằng tiếng Việt",
  "advice": "lời khuyên/lời nhắn nhủ thực tế bằng tiếng Việt",
  "riskLevel": "low | medium | high",
  "safetyTriggered": false
}
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
  const sentimentVal = String(parsed.sentiment || "neutral").toLowerCase();
  const sentiment = ["positive", "neutral", "negative"].includes(sentimentVal)
    ? sentimentVal
    : "neutral";

  // Áp dụng linh hoạt giữa format cũ (emotionScore) và format Soul AI (score)
  const emotionScore = Number(parsed.emotionScore !== undefined ? parsed.emotionScore : parsed.score);
  const confidenceScore = Number(parsed.confidenceScore !== undefined ? parsed.confidenceScore : 80);

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
    // Áp dụng linh hoạt giữa format cũ (summary, suggestion) và format Soul AI (insight, advice)
    summary: parsed.insight || parsed.summary || "Đã hoàn thành phân tích cảm xúc.",
    suggestion:
      parsed.advice ||
      parsed.suggestion ||
      "Cảm ơn bạn đã luôn tin tưởng và chia sẻ tâm sự cùng Soul.",
  };
}

async function classifyEmotionByAI(text) {
  if (!process.env.AI_EMOTION_API_URL || !process.env.AI_EMOTION_API_KEY) {
    throw new Error("AI emotion API is not configured");
  }

  const prompt = buildAIPrompt(text);
  const isOpenAI = process.env.AI_EMOTION_API_URL.includes("api.openai.com");

  const requestBody = isOpenAI
    ? {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      }
    : {
        prompt,
        temperature: 0.2
      };

  const response = await fetch(process.env.AI_EMOTION_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_EMOTION_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
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

  if (negativeCount >= 3 || averageEmotionScore <= 40) {
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