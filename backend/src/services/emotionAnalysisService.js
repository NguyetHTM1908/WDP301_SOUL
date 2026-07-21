const AiAnalysis = require("../models/AiAnalysis");
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
  "kho chiu",
  "rat kho chiu",
  "kho chiu qua",
  "buc boi",
  "uc che",
  "bực bội",
  "ức chế",
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
  "khong chiu noi",
  "bi sep la",
  "sep la",
  "bi mang",
  "sep mang",
  "bi la",
  "bi chui",
  "bi phe binh",

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
  diaryScore,
  confidenceScore = 90,
  riskLevel = "low",
  summary,
  suggestion,
}) {
  const resolvedScore = diaryScore !== undefined ? diaryScore : emotionScore;
  return {
    sentiment,
    emotion: sentiment,
    emotionScore: resolvedScore,
    diaryScore: resolvedScore,
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
    normalizedText.includes("rot tien") ||
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
    (normalizedText.includes("buon") && !normalizedText.includes("khong buon") && !normalizedText.includes("bot buon") && !normalizedText.includes("het buon") && !normalizedText.includes("do buon")) ||
    normalizedText.includes("that vong") ||
    (normalizedText.includes("chan") && !normalizedText.includes("khong chan"));

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

function classifyCurrentEmotion(text) {
  const normalizedText = normalizeText(text);
  if (!normalizedText) return null;

  // 1. Safety risk check: "Không muốn sống", "muốn chết"
  const safetyRes = toEmotionSafetyResult(text);
  if (safetyRes) {
    return safetyRes;
  }

  // 2b. Discomfort / Irritation ("khó chịu", "rất khó chịu", "bức bối", "ức chế")
  if (normalizedText.includes("kho chiu") || normalizedText.includes("buc boi") || normalizedText.includes("uc che")) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 38,
      diaryScore: 38,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nhật ký bộc lộ cảm giác khó chịu, bực bội hoặc bức bối trong lòng.",
      suggestion: "Cảm giác khó chịu là một tín hiệu cho thấy bạn đang cần không gian thư giãn. Hãy thử dừng lại một chút, hít thở sâu và cho phép bản thân nghỉ ngơi nhé.",
    });
  }

  // 3. Hopelessness with explicit denial ("không muốn chết", "không có ý định tự tử" + "không còn ý nghĩa")
  const hasDenialOfHarm = /\b(khong muon chet|khong co y dinh tu tu|khong muon tu tu|khong dinh tu tu|khong dinh lam hai|toi khong muon chet)\b/.test(normalizedText);
  const hasMeaninglessness = /\b(khong con y nghia|khong con thay cuoc song co y nghia|vo nghia|khong biet song de lam gi|trong rong)\b/.test(normalizedText);

  if (hasDenialOfHarm && hasMeaninglessness) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 35,
      diaryScore: 35,
      confidenceScore: 92,
      riskLevel: "medium",
      summary: "Bạn đang trải qua cảm giác kiệt sức và cảm thấy cuộc sống thiếu đi ý nghĩa — đây là cảm xúc hoàn toàn có thật và đáng được lắng nghe.",
      suggestion: "Cảm ơn bạn đã tin tưởng bộc lộ cảm xúc. Cảm giác mất ý nghĩa không phải là vĩnh viễn. Hãy thử dành cho bản thân sự nghỉ ngơi, tìm lại một niềm vui nhỏ bé trong ngày và chia sẻ cùng người thân. Bạn không hề đơn độc.",
    });
  }

  // Work/School reprimand & scolding ("bị mắng", "bị cô giáo mắng", "bị sếp la", "bị phạt", "bị chửi", "bị phê bình")
  const isScolded =
    /\b(bi|sut).{0,30}(mang|la|chui|phe binh|khien trach|phat|trach)\b/.test(normalizedText) ||
    normalizedText.includes("bi mang") ||
    normalizedText.includes("bi la") ||
    normalizedText.includes("bi chui") ||
    normalizedText.includes("bi phat") ||
    normalizedText.includes("co giao mang") ||
    normalizedText.includes("thay mang") ||
    normalizedText.includes("bo mang") ||
    normalizedText.includes("me mang") ||
    normalizedText.includes("sep mang") ||
    normalizedText.includes("sep la");

  if (isScolded) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 35,
      diaryScore: 35,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nhật ký ghi nhận bạn vừa trải qua sự việc bức bối, buồn bã hoặc áp lực do bị mắng, bị la hoặc phê bình.",
      suggestion: "Bị mắng hoặc phê bình có thể khiến bạn cảm thấy uất ức và mệt mỏi. Hãy dành chút thời gian hít thở sâu, thả lỏng tâm trí và không để điều đó làm ảnh hưởng đến giá trị của bản thân nhé.",
    });
  }

  // 4. Fatigue with effort / motivation signal preservation
  if (/\b(met|met moi|ap luc).{0,50}(nhung|nhung van|van se).{0,50}(co gang|no luc|khong bo cuoc)\b/.test(normalizedText)) {
    const res = createKeywordResult({
      sentiment: "negative",
      emotionScore: 42,
      diaryScore: 42,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Hôm nay bạn trải qua nhiều mệt mỏi nhưng vẫn giữ được tinh thần nỗ lực và cố gắng.",
      suggestion: "Ghi nhận sự cố gắng của bạn. Hãy cân bằng giữa làm việc và nghỉ ngơi để bảo vệ sức khỏe nhé.",
    });
    res.motivationLevel = "high";
    return res;
  }

  // 5. Insomnia & isolation pressure
  if (/\b(ap luc|stress).{0,50}(mat ngu|kho ngu).{0,50}(khong muon noi chuyen|khong muon gap ai)\b/.test(normalizedText) ||
      (normalizedText.includes("ap luc") && normalizedText.includes("mat ngu"))) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 30,
      diaryScore: 30,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Bạn đang chịu nhiều áp lực dẫn đến mất ngủ và muốn thu mình lại.",
      suggestion: "Áp lực và mất ngủ có thể làm kiệt sức nhanh chóng. Hãy thả lỏng cơ thể, ngắt kết nối công việc và dành thời gian nghỉ ngơi.",
    });
  }

  // 6. Unresolved / not okay ("vẫn chưa ổn", "chưa ổn")
  if (normalizedText.includes("van chua on") || normalizedText.includes("chua on")) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 38,
      diaryScore: 38,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nhật ký phản ánh trạng thái cảm xúc chưa thực sự ổn định.",
      suggestion: "Hãy dành thêm thời gian theo dõi cảm xúc và tìm đến sự hỗ trợ khi cần thiết.",
    });
  }

  // 7. Pure Positive Self-Evaluation ("Tôi hài lòng với bản thân", "Tôi tự hào...")
  if ((normalizedText.includes("hai long voi ban than") || normalizedText.includes("tu hao ve ban than") || normalizedText.includes("tin vao ban than")) && !normalizedText.includes("khong") && !normalizedText.includes("chua")) {
    return createKeywordResult({
      sentiment: "positive",
      emotionScore: 78,
      diaryScore: 78,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nội dung nhật ký thể hiện sự tự tin, hài lòng và ghi nhận tích cực về bản thân.",
      suggestion: "Hãy giữ vững niềm tin này và tiếp tục phát huy những điểm mạnh của bản thân.",
    });
  }

  // 8. Contrast / Post-clause override ("Tôi không buồn nhưng không hài lòng...", "Tôi hài lòng nhưng vẫn hơi lo")
  if (normalizedText.includes("nhung khong hai long") || normalizedText.includes("nhung van hoi lo") || normalizedText.includes("nhung van lo")) {
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: 42,
      diaryScore: 42,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nội dung nhật ký cho thấy bạn vẫn còn trăn trở hoặc chưa thực sự an tâm ở khía cạnh phía sau.",
      suggestion: "Hãy cho bản thân thời gian giải quyết từng vướng bận một cách nhẹ nhàng.",
    });
  }

  // 9. Negated Positive States
  if (/\b(khong hai long|chua hai long|khong tu hao|khong tu tin|khong tin vao|khong con vui|khong vui)\b/.test(normalizedText)) {
    if (normalizedText.includes("khong vui bang hom qua") || normalizedText.includes("khong vui bang")) {
      return createKeywordResult({
        sentiment: "negative",
        emotionScore: 38,
        diaryScore: 38,
        confidenceScore: 90,
        riskLevel: "low",
        summary: "Cảm xúc hôm nay sụt giảm so với ngày trước.",
        suggestion: "Mỗi ngày cảm xúc có sự biến động là điều bình thường. Hãy nghỉ ngơi để nạp lại năng lượng.",
      });
    }
    const isChua = normalizedText.includes("chua hai long");
    const score = isChua ? 42 : 38;
    return createKeywordResult({
      sentiment: "negative",
      emotionScore: score,
      diaryScore: score,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nội dung nhật ký thể hiện sự thất vọng, tự trách hoặc chưa thực sự hài lòng với bản thân.",
      suggestion: "Hãy kiên nhẫn hơn với chính mình. Mỗi chặng đường đều cần thời gian và việc chưa đạt như kỳ vọng không có nghĩa là bạn thiếu cố gắng.",
    });
  }

  // 10. Negated Negative States ("không buồn", "không còn lo", "không lo nữa", "bớt buồn", "không buồn như hôm qua")
  if (/\b(khong buon|khong con lo|khong lo nua|het lo|do buon|khong buon nhu|het buon)\b/.test(normalizedText)) {
    return createKeywordResult({
      sentiment: "positive",
      emotionScore: 70,
      diaryScore: 70,
      confidenceScore: 90,
      riskLevel: "low",
      summary: "Nhật ký ghi nhận tâm trạng đang tốt lên, giải tỏa lo âu hoặc bớt buồn hơn.",
      suggestion: "Thật tuyệt khi bạn đang cảm thấy nhẹ nhõm hơn. Hãy tiếp tục duy trì những thói quen tích cực này nhé.",
    });
  }

  // 11. Temporal reasoning
  if (/\b(truoc day|hoi truoc|ngay truoc|da tung)\b/.test(normalizedText) && /\b(hom nay|bay gio|hien tai|bay gio da)\b/.test(normalizedText)) {
    if (/\b(da vuot qua|da on|tot hon|on hon|thang|thanh cong|het buon)\b/.test(normalizedText)) {
      return createKeywordResult({
        sentiment: "positive",
        emotionScore: 75,
        diaryScore: 75,
        confidenceScore: 90,
        riskLevel: "low",
        summary: "Bạn đã vượt qua được những khó khăn trong quá khứ và hiện tại tâm trạng đã tốt hơn.",
        suggestion: "Sự kiên trì của bạn đã mang lại quả ngọt. Hãy tự hào về hành trình mình đã đi qua.",
      });
    }
    if (/\b(bay gio khong con vui|hien tai rat ap luc|bay gio rat met)\b/.test(normalizedText)) {
      return createKeywordResult({
        sentiment: "negative",
        emotionScore: 35,
        diaryScore: 35,
        confidenceScore: 90,
        riskLevel: "low",
        summary: "Mặc dù từng có thời gian vui vẻ, hiện tại bạn đang chịu nhiều áp lực và mệt mỏi.",
        suggestion: "Hãy cho phép bản thân nghỉ ngơi. Cảm xúc trầm xuống là điều tự nhiên sau một khoảng thời gian dài gồng gánh.",
      });
    }
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

  const currentEmotionResult = classifyCurrentEmotion(text);

  if (currentEmotionResult) {
    return currentEmotionResult;
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
  const escapedText = String(text || "").replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\${/g, "\\${");
  return (
    "Bạn là Soul AI, hệ thống phân tích cảm xúc chuyên sâu cho nhật ký của ứng dụng SOUL.\n" +
    "Nhiệm vụ của bạn là phân tích nội dung nhật ký dưới đây một cách tinh tế dựa trên ngữ nghĩa tự nhiên tiếng Việt.\n\n" +
    "Nội dung nhật ký cần phân tích:\n" +
    '"' + String(text || "").replace(/"/g, '\\"') + '"\n\n' +
    "━━━ QUY TẮC PHÂN TÍCH NGỮ NGHĨA ━━━\n\n" +
    "1. XỬ LÝ PHỦ ĐỊNH CẢM XÚC TÍCH CỰC (Negated Positive States):\n" +
    "- KHÔNG gán nhãn positive khi cảm xúc tích cực bị phủ định.\n" +
    "- \"Tôi hài lòng với bản thân\" → positive, emotionScore: 70-85\n" +
    "- \"Tôi không hài lòng với bản thân\" → negative, emotionScore: 35-45\n" +
    "- \"Tôi không tự tin\" → negative, emotionScore: 30-40\n" +
    "- \"Tôi không còn vui\" → negative, emotionScore: 35-42\n\n" +
    "2. PHÂN MỨC ĐỘ TIÊU CỰC:\n" +
    "- \"Tôi hơi buồn\" → emotionScore: 40-45\n" +
    "- \"Tôi tuyệt vọng\" → emotionScore: 10-20\n" +
    "- \"Hôm nay mệt nhưng vẫn cố gắng\" → emotionScore: 40-48\n" +
    "- \"Tôi không vui bằng hôm qua\" → emotionScore: 35-40 (KHÔNG gán neutral)\n" +
    "- \"Tôi không còn lo nữa\" → emotionScore: 70-78, sentiment: positive\n\n" +
    "3. QUY TẮC ĐẶC BIỆT — MẤT Ý NGHĨA + PHỦ NHẬN Ý ĐỊNH TỰ HẠI:\n" +
    "Khi người dùng ĐỒNG THỜI:\n" +
    "  (a) phủ nhận rõ ý định tự hại: \"không muốn chết\", \"không có ý định tự tử\"\n" +
    "  (b) biểu đạt mất ý nghĩa: \"không còn thấy cuộc sống có ý nghĩa\", \"trống rỗng\"\n" +
    "→ Đây là KIỆT SỨC CẢM XÚC (emotional burnout), KHÔNG phải nguy cơ tự tử.\n" +
    "→ emotionScore: 30-42, riskLevel: medium, sentiment: negative\n" +
    "→ summary: ghi nhận sự mệt mỏi đồng cảm, KHÔNG dùng ngôn ngữ nguy hiểm\n" +
    "→ suggestion: nhẹ nhàng, tạo động lực, gợi ý tìm lại điều nhỏ có ý nghĩa\n" +
    "→ TUYỆT ĐỐI KHÔNG dùng: \"đặt xa vật sắc nhọn\", \"gọi cấp cứu ngay\"\n\n" +
    "4. QUY TẮC ADVICE TƯƠNG XỨNG VỚI MỨC ĐỘ RỦI RO:\n" +
    "- riskLevel: low → lời khuyên nhẹ nhàng, tạo động lực, không đề cập hotline\n" +
    "- riskLevel: medium → đồng cảm, khuyến khích chia sẻ với người thân\n" +
    "- riskLevel: high → kết nối người thân, gọi 1900 636 527, không hoảng loạn\n" +
    "- riskLevel: emergency → DUY NHẤT được dùng: \"đặt xa vật nguy hiểm\", gọi 1900 636 527 / 115 ngay\n\n" +
    "5. MỨC ĐIỂM emotionScore:\n" +
    "- 0-20: Rất tiêu cực / suy sụp nghiêm trọng\n" +
    "- 21-40: Tiêu cực\n" +
    "- 41-60: Trung tính / hỗn hợp\n" +
    "- 61-80: Tích cực\n" +
    "- 81-100: Rất tích cực\n\n" +
    "6. XỬ LÝ SỰ VIỆC BỊ MẮNG / BỊ LA / BỊ PHÊ BÌNH / BỊ PHẠT / BỊ CHỬI:\n" +
    "- Các câu thể hiện bị mắng, bị la, bị phạt như \"bị cô giáo mắng\", \"bị sếp la\", \"bị mẹ mắng\", \"bị mắng oan\", \"bị phạt\", \"bị chửi\" → MANDATORY sentiment: negative, emotionScore: 30-40, riskLevel: low.\n" +
    "- summary: Nhắc trực tiếp đến việc bị mắng/la/phê bình và sự khó chịu, buồn bã hoặc ức chế của người dùng.\n" +
    "- suggestion: Lời khuyên an ủi nhẹ nhàng, giúp xoa dịu cảm xúc ức chế, khuyến khích thả lỏng và không tự dằn dặt bản thân.\n\n" +
    "7. XỬ LÝ CẢM XÚC TIÊU CỰC HỖN HỢP (Tức giận + Tội lỗi, Bất công + Tự trách, Trống rỗng + Thất vọng):\n" +
    "- Khi có sự kết hợp của 2 cảm xúc tiêu cực như ấm ức + có lỗi → MANDATORY sentiment: negative, emotionScore: 30-40, riskLevel: low.\n" +
    "- summary: Thể hiện sự thấu hiểu đồng thời cả 2 cảm xúc trái chiều (ví dụ: vừa bực bội vừa cảm thấy có lỗi).\n" +
    "- suggestion: Khuyên người dùng bình tĩnh phân tách nguyên nhân khách quan và chủ quan, tránh tự trách bản thân quá mức.\n\n" +
    "8. QUY TẮC PHÂN TÍCH DIỄN BIẾN CẢM XÚC THEO DÒNG CHẢY (MOOD TRAJECTORY ANALYSIS):\n" +
    "- Khi nhật ký gồm nhiều câu hoặc nhiều dòng (thể hiện diễn biến tâm trạng theo thời gian hoặc các sự việc khác nhau trong ngày):\n" +
    "  (a) Phân tích dòng chảy từ câu đầu đến câu cuối: nhận diện nốt trầm (bực bội, kiệt sức, ý nghĩ bế tắc/muốn biến mất) lẫn các vế tự trấn an / nỗ lực / quay lại nhịp sống (cố gắng vượt qua, mình vẫn ổn, dậy sớm, làm việc...).\n" +
    "  (b) Đánh giá điểm số & rủi ro tổng hòa: Nếu có ý nghĩ bế tắc bộc phát NHƯNG các câu sau thể hiện nỗ lực tự trấn an hoặc quay lại đời sống bình thường → ĐÂY LÀ DIỄN BIẾN HẠ NHIỆT / TỰ XOA DỊU.\n" +
    "      - KHÔNG khóa bài viết ở điểm cực thấp (15/100) và KHÔNG tự động gán emergency risk.\n" +
    "      - Hãy đánh giá điểm số tổng hòa (emotionScore: 35-50, riskLevel: low hoặc medium tùy mức độ nặng nhẹ).\n" +
    "  (c) summary & suggestion:\n" +
    "      - summary: Tóm tắt lại hành trình cảm xúc (Ví dụ: 'Nhật ký ghi nhận khoảng trầm mệt mỏi lúc ban đầu, nhưng sau đó bạn đã tự trấn an và cố gắng trở lại nhịp sống bình thường.').\n" +
    "      - suggestion: Công nhận nỗ lực tự cân bằng của bản thân, gợi ý nghỉ ngơi và chia sẻ với người tin tưởng khi cảm thấy quá tải.\n\n" +
    "9. XỬ LÝ CÁC CÂU BỌC LỘ KHÓ CHỊU, BỰC BỘI, ỨC CHẾ, BỨC BỐI:\n" +
    "- Các câu bộc lộ cảm xúc ngắn như \"tôi đang rất khó chịu\", \"mình thấy bực bội\", \"ức chế\", \"bức bối\" → MANDATORY sentiment: negative, emotionScore: 35-42, riskLevel: low.\n" +
    "- TUYỆT ĐỐI KHÔNG gán sentiment: neutral hoặc emotionScore: 50/100 (Cân bằng/Ổn định) vì đây là cảm xúc tiêu cực rõ ràng.\n" +
    "- summary: Thể hiện sự thấu hiểu đồng cảm trực tiếp với cảm giác khó chịu/bực bội của người dùng.\n" +
    "- suggestion: Gợi ý thả lỏng, hít thở sâu và cho phép bản thân nghỉ ngơi để xoa dịu sự bức bối.\n\n" +
    "━━━ ĐỊNH DẠNG RESPONSE BẮT BUỘC (RAW JSON THUẦN) ━━━\n" +
    "{\n" +
    '  "sentiment": "positive | neutral | negative",\n' +
    '  "emotion": "positive | neutral | negative",\n' +
    '  "emotionScore": 0,\n' +
    '  "confidenceScore": 0,\n' +
    '  "riskLevel": "low | medium | high | emergency",\n' +
    '  "toxicityLevel": "low | medium | high",\n' +
    '  "safetyTriggered": false,\n' +
    '  "safetyType": null,\n' +
    '  "summary": "Nhận xét 1-2 câu có nhắc đến cảm xúc cụ thể trong nhật ký.",\n' +
    '  "suggestion": "Lời khuyên 2-3 câu tương xứng với mức độ rủi ro và ngữ cảnh."\n' +
    "}\n\n" +
    "Yêu cầu:\n" +
    "- Phản hồi hoàn toàn bằng tiếng Việt.\n" +
    "- Không chẩn đoán bệnh, không kê thuốc.\n" +
    "- Phải nhắc đến cảm xúc cụ thể người dùng mô tả.\n" +
    "- Không tự ý đưa ra cảnh báo tự làm hại nếu nội dung không thể hiện dấu hiệu đó.\n" +
    "- Chỉ trả về JSON, không bọc trong markdown.\n"
  );
}

function extractAIContent(data) {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  if (Array.isArray(data.output)) {
    for (const outputItem of data.output) {
      if (!Array.isArray(outputItem?.content)) {
        continue;
      }
      for (const contentItem of outputItem.content) {
        if (typeof contentItem?.text === "string") {
          return contentItem.text;
        }
        if (typeof contentItem?.output_text === "string") {
          return contentItem.output_text;
        }
      }
    }
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
  const rawUrl = process.env.AI_EMOTION_API_URL || process.env.AI_MODERATION_API_URL;
  if (!rawUrl) {
    throw new Error("AI_EMOTION_API_URL is not configured");
  }

  const apiKey =
    process.env.AI_EMOTION_API_KEY ||
    process.env.AI_MODERATION_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "";

  const prompt = buildAIPrompt(text);
  const isStuPlatform = rawUrl.includes("stu-platform.live");
  const isOpenAI = rawUrl.includes("api.openai.com");

  let targetUrl = rawUrl;
  let requestBody;

  if (isStuPlatform) {
    targetUrl = rawUrl.replace(/\/$/, "");
    if (!targetUrl.endsWith("/responses")) {
      targetUrl += "/responses";
    }
    const model = process.env.AI_EMOTION_MODEL || process.env.VISION_AI_MODEL || "GPT-5.4-mini";
    requestBody = {
      model,
      input: prompt,
    };
  } else if (isOpenAI) {
    requestBody = {
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
    };
  } else {
    requestBody = {
      prompt,
      temperature: 0.2,
    };
  }

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
    const response = await fetch(targetUrl, {
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
   * contentSafetyService chỉ can thiệp cứng nếu là kế hoạch cấp cứu khẩn cấp (isEmergencyPlan).
   * Với các nhật ký khác, AI sẽ phân tích diễn biến cảm xúc (Mood Trajectory) linh hoạt.
   */
  const safetyResult = analyzeSafetyRisk(text);

  if (safetyResult.safetyTriggered && (safetyResult.isEmergencyPlan || safetyResult.riskLevel === "emergency")) {
    const safetyEmotionResult = toEmotionSafetyResult(text);

    if (safetyEmotionResult) {
      return safetyEmotionResult;
    }
  }

  try {
    const aiResult = await classifyEmotionByAI(text);

    /**
     * Chạy lại safety sau AI để bảo đảm nếu là kế hoạch khẩn cấp thật thì mới can thiệp.
     */
    const verifiedSafetyResult = analyzeSafetyRisk(text);

    if (verifiedSafetyResult.safetyTriggered && (verifiedSafetyResult.isEmergencyPlan || verifiedSafetyResult.riskLevel === "emergency")) {
      return (
        toEmotionSafetyResult(text) ||
        classifyEmotionByKeyword(text)
      );
    }

    return {
      ...aiResult,
      safetyTriggered: Boolean(aiResult.safetyTriggered || safetyResult.safetyTriggered),
      safetyType: aiResult.safetyType || safetyResult.safetyType || null,
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

  classifyCurrentEmotion,
  classifySpecialCases,
  classifyEmotionHybrid,
  classifyEmotionByAI,
  classifyEmotionByKeyword,

  getUserEmotionProfile,
  getUserEmotionHistory,
};