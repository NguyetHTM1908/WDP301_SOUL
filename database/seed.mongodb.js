use("soul_db");

const now = new Date();
const nextMonth = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  now.getDate()
);

// =========================================
// DEMO USERS
// =========================================

// admin@soul.com      -> Admin@123
// user1@soul.com      -> User@123
// user2@soul.com      -> User@123
// user3@soul.com      -> User@123
// organizer@soul.com  -> User@123

const adminId = new ObjectId();
const user1Id = new ObjectId();
const user2Id = new ObjectId();
const user3Id = new ObjectId();
const organizerId = new ObjectId();

db.users.insertMany([
  {
    _id: adminId,
    fullName: "Admin SOUL",
    email: "admin@soul.com",
    phone: "0900000001",
    passwordHash:
      "$2b$10$aZNR27yMewRS93tPRdlm5OC7oVeHJqM.WoySg0L2Z0K.nBFWEToYO",
    avatarUrl: null,
    bio: "Administrator account for SOUL platform.",
    savedPosts: [],
    role: "admin",
    status: "active",
    forumBannedUntil: null,

    // Cached copy only.
    moodReputation: "neutral",
    moodReputationScore: 50,
    moodReputationUpdatedAt: now,

    anonymousModeEnabled: false,
    anonymousAlias: null,
    anonymousModeUpdatedAt: null,
    lastEmotionalTestAt: null,
    nextEmotionalTestDueAt: now,
    gender: "male",
    dateOfBirth: null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: user1Id,
    fullName: "Nguyen Van A",
    email: "user1@soul.com",
    phone: "0900000002",
    passwordHash:
      "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "University student who is currently under emotional pressure.",
    savedPosts: [],
    role: "user",
    status: "active",
    forumBannedUntil: null,

    // Cached copy from user_emotion_profiles.
    moodReputation: "negative",
    moodReputationScore: 29,
    moodReputationUpdatedAt: now,

    anonymousModeEnabled: true,
    anonymousAlias: "Tho Lem Linh",
    anonymousModeUpdatedAt: now,
    lastEmotionalTestAt: null,
    nextEmotionalTestDueAt: now,
    gender: "male",
    dateOfBirth: null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: user2Id,
    fullName: "Tran Thi B",
    email: "user2@soul.com",
    phone: "0900000003",
    passwordHash:
      "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "Student who enjoys self-care and mindfulness activities.",
    savedPosts: [],
    role: "user",
    status: "active",
    forumBannedUntil: null,

    // Cached copy from user_emotion_profiles.
    moodReputation: "positive",
    moodReputationScore: 82,
    moodReputationUpdatedAt: now,

    anonymousModeEnabled: false,
    anonymousAlias: null,
    anonymousModeUpdatedAt: null,
    lastEmotionalTestAt: null,
    nextEmotionalTestDueAt: now,
    gender: "female",
    dateOfBirth: null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: user3Id,
    fullName: "Le Minh C",
    email: "user3@soul.com",
    phone: "0900000005",
    passwordHash:
      "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "Student with neutral emotional state.",
    savedPosts: [],
    role: "user",
    status: "active",
    forumBannedUntil: null,

    // Cached copy from user_emotion_profiles.
    moodReputation: "neutral",
    moodReputationScore: 50,
    moodReputationUpdatedAt: now,

    anonymousModeEnabled: false,
    anonymousAlias: null,
    anonymousModeUpdatedAt: null,
    lastEmotionalTestAt: null,
    nextEmotionalTestDueAt: now,
    gender: "other",
    dateOfBirth: null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: organizerId,
    fullName: "SOUL Event Organizer",
    email: "organizer@soul.com",
    phone: "0900000004",
    passwordHash:
      "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "Event organizer account for managing SOUL workshops and talkshows.",
    savedPosts: [],
    role: "event_organizer",
    status: "active",
    forumBannedUntil: null,

    // Cached copy only.
    moodReputation: "neutral",
    moodReputationScore: 50,
    moodReputationUpdatedAt: now,

    anonymousModeEnabled: false,
    anonymousAlias: null,
    anonymousModeUpdatedAt: null,
    lastEmotionalTestAt: null,
    nextEmotionalTestDueAt: null,
    gender: "other",
    dateOfBirth: null,
    isEmailVerified: true,
    emailVerifiedAt: now,
    lastLoginAt: null,
    failedLoginAttempts: 0,
    passwordChangedAt: now,
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// DIARIES
// =========================================

const diary1Id = new ObjectId();
const diary2Id = new ObjectId();
const diary3Id = new ObjectId();
const diary4Id = new ObjectId();

db.diaries.insertMany([
  {
    _id: diary1Id,
    userId: user1Id,
    mood: "stressed",
    moodScore: 3,
    note: "Hom nay minh cam thay kha ap luc vi deadline.",
    isPrivate: true,
    aiInsight: {
      sentiment: "negative",
      emotion: "negative",
      summary: "User shows negative emotional signals due to deadline pressure.",
      suggestion:
        "Try breaking tasks into smaller steps and taking short breaks."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    _id: diary2Id,
    userId: user2Id,
    mood: "happy",
    moodScore: 8,
    note: "Minh vua hoan thanh xong bai tap va thay rat nhe nhom.",
    isPrivate: true,
    aiInsight: {
      sentiment: "positive",
      emotion: "positive",
      summary: "User shows positive emotional signals after completing work.",
      suggestion: "Maintain this positive routine and take time to rest."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    _id: diary3Id,
    userId: user1Id,
    mood: "anxious",
    moodScore: 4,
    note: "Minh lo lang ve ket qua mon hoc sap toi.",
    isPrivate: true,
    aiInsight: {
      sentiment: "negative",
      emotion: "negative",
      summary: "User shows negative emotional signals related to study results.",
      suggestion:
        "Focus on what can be controlled and talk to someone trusted."
    },
    createdAt: now,
    updatedAt: now
  },
  {
    _id: diary4Id,
    userId: user3Id,
    mood: "normal",
    moodScore: 5,
    note: "Hom nay minh di hoc, an com va lam bai tap.",
    isPrivate: true,
    aiInsight: {
      sentiment: "neutral",
      emotion: "neutral",
      summary: "User describes normal daily activities without clear emotion.",
      suggestion: "Continue tracking emotions regularly."
    },
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// WEEKLY EMOTIONAL INSIGHTS
// =========================================

db.weekly_emotional_insights.insertMany([
  {
    userId: user1Id,
    weekStartDate: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    ),
    weekEndDate: now,
    averageMoodScore: 3.5,
    dominantSentiment: "negative",
    moodTrend: "declining",
    summary:
      "User showed negative emotional signals across multiple diary entries this week.",
    advice:
      "Try small daily breaks, write down controllable tasks, and reach out to trusted people when feeling overwhelmed.",
    sourceDiaryIds: [diary1Id, diary3Id],
    generatedBy: "ai",
    createdAt: now,
    updatedAt: now
  },
  {
    userId: user2Id,
    weekStartDate: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    ),
    weekEndDate: now,
    averageMoodScore: 8,
    dominantSentiment: "positive",
    moodTrend: "stable",
    summary: "User maintained a mostly positive emotional state this week.",
    advice:
      "Maintain healthy routines and consider supporting others in the community when appropriate.",
    sourceDiaryIds: [diary2Id],
    generatedBy: "ai",
    createdAt: now,
    updatedAt: now
  },
  {
    userId: user3Id,
    weekStartDate: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    ),
    weekEndDate: now,
    averageMoodScore: 5,
    dominantSentiment: "neutral",
    moodTrend: "stable",
    summary: "User showed mostly neutral emotional signals this week.",
    advice: "Continue checking in with emotions regularly.",
    sourceDiaryIds: [diary4Id],
    generatedBy: "ai",
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// CHAT SESSIONS
// =========================================

const session1Id = new ObjectId();
const session2Id = new ObjectId();
const session3Id = new ObjectId();

const message1Id = new ObjectId();
const message2Id = new ObjectId();
const message3Id = new ObjectId();
const message4Id = new ObjectId();
const message5Id = new ObjectId();
const message6Id = new ObjectId();

db.chat_sessions.insertMany([
  {
    _id: session1Id,
    userId: user1Id,
    title: "Stress about university",
    overallSentiment: "negative",
    highestRiskLevel: "medium",
    isArchived: false,
    messages: [
      {
        _id: message1Id,
        sender: "user",
        content: "Dao nay minh cam thay rat met moi va ap luc.",
        isSafetyResponse: false,
        createdAt: now
      },
      {
        _id: message2Id,
        sender: "ai",
        content:
          "Minh nghe thay rang ban dang trai qua kha nhieu ap luc gan day. Ban co muon chia se dieu gi khien ban met nhat luc nay khong?",
        isSafetyResponse: false,
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    _id: session2Id,
    userId: user2Id,
    title: "Feeling positive after finishing homework",
    overallSentiment: "positive",
    highestRiskLevel: "low",
    isArchived: false,
    messages: [
      {
        _id: message3Id,
        sender: "user",
        content: "Hom nay minh thay vui va nhe nhom hon.",
        isSafetyResponse: false,
        createdAt: now
      },
      {
        _id: message4Id,
        sender: "ai",
        content:
          "Minh rat vui khi nghe ban cam thay nhe nhom hon. Hay tiep tuc giu thoi quen tot nay nhe.",
        isSafetyResponse: false,
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    _id: session3Id,
    userId: user1Id,
    title: "High risk emotional message",
    overallSentiment: "negative",
    highestRiskLevel: "high",
    isArchived: false,
    messages: [
      {
        _id: message5Id,
        sender: "user",
        content: "Doi khi minh chi muon bien mat khoi moi thu.",
        isSafetyResponse: false,
        createdAt: now
      },
      {
        _id: message6Id,
        sender: "ai",
        content:
          "Minh rat tiec vi ban dang trai qua cam giac nay. Ban khong can doi mat mot minh. Hay lien he voi nguoi than, ban be dang tin cay hoac dich vu ho tro khan cap tai noi ban song neu ban dang gap nguy hiem.",
        isSafetyResponse: true,
        createdAt: now
      }
    ],
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// AI ANALYSES
// emotion is unified as positive / neutral / negative.
// =========================================

const analysis1Id = new ObjectId();
const analysis2Id = new ObjectId();
const analysis3Id = new ObjectId();
const analysis4Id = new ObjectId();
const analysis5Id = new ObjectId();
const analysis6Id = new ObjectId();

db.ai_analyses.insertMany([
  {
    _id: analysis1Id,
    userId: user1Id,
    target: { type: "chat_message", id: message1Id },
    analysisType: "emotion_analysis",
    sentiment: "negative",
    emotion: "negative",
    emotionScore: 35,
    confidenceScore: 90,
    riskLevel: "medium",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    sourceTextSnapshot: "Dao nay minh cam thay rat met moi va ap luc.",
    summary: "User shows negative emotional signals.",
    suggestion: "Try taking short breaks and sharing feelings with trusted friends.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  },
  {
    _id: analysis2Id,
    userId: user2Id,
    target: { type: "chat_message", id: message3Id },
    analysisType: "emotion_analysis",
    sentiment: "positive",
    emotion: "positive",
    emotionScore: 80,
    confidenceScore: 88,
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    sourceTextSnapshot: "Hom nay minh thay vui va nhe nhom hon.",
    summary: "User shows positive emotional signals.",
    suggestion: "Encourage user to maintain healthy routines.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  },
  {
    _id: analysis3Id,
    userId: user1Id,
    target: { type: "chat_message", id: message5Id },
    analysisType: "emotion_analysis",
    sentiment: "negative",
    emotion: "negative",
    emotionScore: 10,
    confidenceScore: 95,
    riskLevel: "high",
    toxicityLevel: "low",
    safetyTriggered: true,
    safetyType: "self_harm_risk",
    sourceTextSnapshot: "Doi khi minh chi muon bien mat khoi moi thu.",
    summary: "Strong negative emotional signals detected.",
    suggestion:
      "Recommend contacting trusted people, professional support, or emergency services.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  },
  {
    _id: analysis4Id,
    userId: user1Id,
    target: { type: "diary", id: diary1Id },
    analysisType: "emotion_analysis",
    sentiment: "negative",
    emotion: "negative",
    emotionScore: 38,
    confidenceScore: 87,
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    sourceTextSnapshot: "Hom nay minh cam thay kha ap luc vi deadline.",
    summary: "Diary shows negative emotional signals.",
    suggestion: "Try short breaks and task prioritization.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  },
  {
    _id: analysis5Id,
    userId: user2Id,
    target: { type: "diary", id: diary2Id },
    analysisType: "emotion_analysis",
    sentiment: "positive",
    emotion: "positive",
    emotionScore: 82,
    confidenceScore: 90,
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    sourceTextSnapshot:
      "Minh vua hoan thanh xong bai tap va thay rat nhe nhom.",
    summary: "Diary shows positive emotional signals.",
    suggestion: "Maintain this positive routine and take time to rest.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  },
  {
    _id: analysis6Id,
    userId: user3Id,
    target: { type: "diary", id: diary4Id },
    analysisType: "emotion_analysis",
    sentiment: "neutral",
    emotion: "neutral",
    emotionScore: 50,
    confidenceScore: 75,
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    sourceTextSnapshot: "Hom nay minh di hoc, an com va lam bai tap.",
    summary: "Diary shows neutral emotional signals.",
    suggestion: "Continue tracking emotions regularly.",
    modelName: "hybrid-emotion-v1",
    analyzedAt: now,
    createdAt: now
  }
]);

// =========================================
// USER EMOTION PROFILES
// Main source of emotional state.
// =========================================

db.user_emotion_profiles.insertMany([
  {
    userId: user1Id,
    currentSentiment: "negative",
    averageEmotionScore: 28,
    latestEmotion: "negative",
    latestRiskLevel: "high",
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 3,
    analysisCount: 3,
    lastAnalysisId: analysis3Id,
    lastSource: "chat_message",
    lastSourceId: message5Id,
    lastAnalyzedAt: now,
    isVisibleToOthers: false,
    privacyLevel: "internal_only",
    createdAt: now,
    updatedAt: now
  },
  {
    userId: user2Id,
    currentSentiment: "positive",
    averageEmotionScore: 81,
    latestEmotion: "positive",
    latestRiskLevel: "low",
    positiveCount: 2,
    neutralCount: 0,
    negativeCount: 0,
    analysisCount: 2,
    lastAnalysisId: analysis5Id,
    lastSource: "diary",
    lastSourceId: diary2Id,
    lastAnalyzedAt: now,
    isVisibleToOthers: false,
    privacyLevel: "internal_only",
    createdAt: now,
    updatedAt: now
  },
  {
    userId: user3Id,
    currentSentiment: "neutral",
    averageEmotionScore: 50,
    latestEmotion: "neutral",
    latestRiskLevel: "low",
    positiveCount: 0,
    neutralCount: 1,
    negativeCount: 0,
    analysisCount: 1,
    lastAnalysisId: analysis6Id,
    lastSource: "diary",
    lastSourceId: diary4Id,
    lastAnalyzedAt: now,
    isVisibleToOthers: false,
    privacyLevel: "internal_only",
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// SAFETY EVENTS
// =========================================

const safetyEvent1Id = new ObjectId();

db.safety_events.insertOne({
  _id: safetyEvent1Id,
  userId: user1Id,
  source: { type: "chat_message", id: message5Id },
  riskLevel: "high",
  safetyType: "self_harm_risk",
  detectedText: "Doi khi minh chi muon bien mat khoi moi thu.",
  systemAction: "show_safety_response",
  safetyMessage:
    "Ban khong can doi mat mot minh. Hay lien he voi nguoi than, ban be dang tin cay hoac dich vu ho tro khan cap tai noi ban song neu ban dang gap nguy hiem.",
  isResolved: false,
  resolvedBy: null,
  resolvedAt: null,
  adminNote: null,
  createdAt: now,
  updatedAt: now
});

// =========================================
// EMOTIONAL TESTS
// =========================================

const test1Id = new ObjectId();
const testResult1Id = new ObjectId();
const testResult2Id = new ObjectId();

db.emotional_tests.insertOne({
  _id: test1Id,
  title: "Kiểm tra trí tuệ cảm xúc",
  description:
    "Bài kiểm tra nhận diện cảm xúc qua khuôn mặt, giúp người dùng tự đánh giá khả năng đọc cảm xúc của người khác. Kết quả chỉ mang tính tham khảo và không phải chẩn đoán y khoa.",
  questions: [
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q1_question_image.jpg", // TODO: dán link ảnh cho câu 1
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q1_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Sợ hãi",
      explanation:
        "Sợ hãi xuất hiện khi một người cảm thấy bị đe dọa về thể chất hoặc tâm lý. Biểu cảm này dễ bị nhầm với ngạc nhiên, nhưng sợ hãi thường có mí mắt căng hơn, lông mày phẳng hơn và khóe miệng kéo ngang.",
      options: [
        { label: "Bối rối", score: 0 },
        { label: "Sợ hãi", score: 1 },
        { label: "Buồn bã", score: 0 },
        { label: "Ngạc nhiên", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q2_question_image.jpg", // TODO: dán link ảnh cho câu 2
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q2_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Hạnh phúc",
      explanation:
        "Đây là nụ cười Duchenne, một nụ cười chân thật thể hiện hạnh phúc. Dấu hiệu quan trọng nằm ở mắt: cơ quanh mắt co lại, tạo nếp nhăn nhẹ và làm mí dưới hơi nâng lên.",
      options: [
        { label: "Tán tỉnh", score: 0 },
        { label: "Hứng thú", score: 0 },
        { label: "Hạnh phúc", score: 1 },
        { label: "Lịch sự", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q3_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q3_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Tức giận",
      explanation:
        "Tức giận thường thể hiện qua môi căng, ánh mắt căng thẳng và lông mày cau lại. Biểu cảm này dễ nhầm với ghê tởm, nhưng ghê tởm thường có môi trên nhấc lên và mũi nhăn lại.",
      options: [
        { label: "Buồn bã", score: 0 },
        { label: "Đau đớn", score: 0 },
        { label: "Tức giận", score: 1 },
        { label: "Ghê tởm", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q4_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q4_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai      correctAnswer: "Bối rối",
      explanation:
        "Khi bối rối, con người thường tránh ánh nhìn, cúi đầu lệch sang một bên và có thể mỉm cười gượng với môi mím lại. Biểu cảm này khác với xấu hổ vì đầu thường nghiêng sang bên thay vì cúi thẳng xuống.",
      options: [
        { label: "Bối rối", score: 1 },
        { label: "Buồn bã", score: 0 },
        { label: "Thích thú", score: 0 },
        { label: "Xấu hổ", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q5_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q5_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Tự hào",
      explanation:
        "Tự hào thường đi kèm nụ cười nhẹ, đầu hơi ngả ra sau và cằm nâng lên. Những dấu hiệu này thể hiện cảm giác tự tin, mạnh mẽ và có phần chiếm ưu thế.",
      options: [
        { label: "Tự hào", score: 1 },
        { label: "Khinh thường", score: 0 },
        { label: "Phấn khích", score: 0 },
        { label: "Tức giận", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q6_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q6_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Ngạc nhiên",
      explanation:
        "Ngạc nhiên được thể hiện qua mí mắt trên nâng cao, lông mày cong lên và hàm mở ra. Nó dễ nhầm với sợ hãi, nhưng khi sợ hãi miệng thường căng và kéo ngang hơn.",
      options: [
        { label: "Sợ hãi", score: 0 },
        { label: "Hứng thú", score: 0 },
        { label: "Ngạc nhiên", score: 1 },
        { label: "Đồng cảm", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q7_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q7_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Khinh thường",
      explanation:
        "Khinh thường thường được nhận ra khi một bên khóe miệng siết lại hoặc nhếch lên. Đây là biểu cảm cho thấy người đó đang nhìn nhận điều gì đó với sự xem thường hoặc nghi ngờ.",
      options: [
        { label: "Buồn bã", score: 0 },
        { label: "Xấu hổ", score: 0 },
        { label: "Ghê tởm", score: 0 },
        { label: "Khinh thường", score: 1 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q8_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q8_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Ghê tởm",
      explanation:
        "Ghê tởm thường có môi trên nâng lên, mũi nhăn lại, mắt hẹp hơn và đôi khi miệng mở ra. Biểu cảm này khác với tức giận vì tức giận thường làm lông mày hạ thấp và miệng siết chặt hơn.",
      options: [
        { label: "Tức giận", score: 0 },
        { label: "Đau đớn", score: 0 },
        { label: "Ghê tởm", score: 1 },
        { label: "Buồn bã", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q9_question_image.jpg", // TODO: dán link ảnh cho câu 9
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q9_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Tán tỉnh",
      explanation:
        "Tán tỉnh có thể xuất hiện khi một người quay đầu tránh đi nhưng vẫn giữ giao tiếp bằng mắt. Điều này thể hiện sự vừa tiếp cận vừa né tránh, một đặc điểm thường gặp trong hành vi tán tỉnh.",
      options: [
        { label: "Khao khát", score: 0 },
        { label: "Bối rối", score: 0 },
        { label: "Tán tỉnh", score: 1 },
        { label: "Tình yêu", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q10_question_image.jpg", // TODO: dán link ảnh cho câu 10
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q10_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Đau đớn",
      explanation:
        "Đau đớn khiến các cơ mặt co lại như một phản ứng tự bảo vệ. Mắt có thể nhắm chặt, lông mày hạ xuống và môi ép lên trên.",
      options: [
        { label: "Xấu hổ", score: 0 },
        { label: "Tức giận", score: 0 },
        { label: "Buồn bã", score: 0 },
        { label: "Đau đớn", score: 1 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q11_question_image.jpg", // TODO: dán link ảnh cho câu 11
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q11_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Đồng cảm",
      explanation:
        "Đồng cảm thường được thể hiện qua lông mày kéo vào trong và nâng lên, môi mím lại và đầu hơi nghiêng về phía trước. Đây là dấu hiệu của sự quan tâm và kết nối xã hội.",
      options: [
        { label: "Đồng cảm", score: 1 },
        { label: "Buồn bã", score: 0 },
        { label: "Tức giận", score: 0 },
        { label: "Hứng thú", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q12_question_image.jpg", // TODO: dán link ảnh cho câu 12
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q12_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Thích thú",
      explanation:
        "Thích thú thường thể hiện qua nụ cười hoặc tiếng cười với miệng mở, đầu hơi ngả về sau và cơ quanh mắt co lại. Đây là dấu hiệu của cảm xúc vui vẻ và thoải mái.",
      options: [
        { label: "Thích thú", score: 1 },
        { label: "Khao khát", score: 0 },
        { label: "Ngạc nhiên", score: 0 },
        { label: "Phấn khích", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q13_question_image.jpg", // TODO: dán link ảnh cho câu 13
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q13_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai
      correctAnswer: "Hứng thú",
      explanation:
        "Hứng thú thường có lông mày nâng lên và một nụ cười nhẹ. Biểu cảm này cho thấy sự chú ý, tò mò và cảm giác tích cực với điều đang diễn ra.",
      options: [
        { label: "Ngạc nhiên", score: 0 },
        { label: "Hứng thú", score: 1 },
        { label: "Khao khát", score: 0 },
        { label: "Hạnh phúc", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
      imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q14_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q14_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai    
      correctAnswer: "Buồn bã",
      explanation:
        "Buồn bã thường có phần trong của lông mày nâng lên, ánh mắt hướng xuống và khóe môi kéo xuống. Đây là biểu cảm dễ nhầm với xấu hổ hoặc đồng cảm.",
      options: [
        { label: "Buồn bã", score: 1 },
        { label: "Xấu hổ", score: 0 },
        { label: "Ghê tởm", score: 0 },
        { label: "Đồng cảm", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q15_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q15_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Khao khát",
      explanation:
        "Khao khát thường được thể hiện qua vùng miệng, chẳng hạn như liếm môi, cắn môi hoặc chu môi. Biểu cảm này liên quan đến sự hấp dẫn hoặc mong muốn.",
      options: [
        { label: "Ghê tởm", score: 0 },
        { label: "Tình yêu", score: 0 },
        { label: "Khinh thường", score: 0 },
        { label: "Khao khát", score: 1 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q16_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q16_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Xấu hổ",
      explanation:
        "Xấu hổ là biểu cảm có ánh mắt tránh đi và đầu cúi thẳng xuống, cằm thu vào gần cổ. Nó khác với tự hào, vốn thường có đầu ngẩng lên và cằm nâng cao.",
      options: [
        { label: "Buồn bã", score: 0 },
        { label: "Tự hào", score: 0 },
        { label: "Bối rối", score: 0 },
        { label: "Xấu hổ", score: 1 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q17_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q17_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Lịch sự",
      explanation:
        "Lịch sự thường được thể hiện bằng một nụ cười xã giao, không phải nụ cười hạnh phúc thật sự. Miệng có thể cười nhưng vùng mắt không có nhiều dấu hiệu của niềm vui chân thật.",
      options: [
        { label: "Hạnh phúc", score: 0 },
        { label: "Khao khát", score: 0 },
        { label: "Lịch sự", score: 1 },
        { label: "Đồng cảm", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q18_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q18_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Bối rối",
      explanation:
        "Bối rối có thể đi kèm hành động chạm tay lên mặt, quay đầu sang bên, tránh ánh nhìn và cười nhẹ. Đây thường là phản ứng khi một người cảm thấy lúng túng trong tình huống xã hội.",
      options: [
        { label: "Buồn bã", score: 0 },
        { label: "Xấu hổ", score: 0 },
        { label: "Bối rối", score: 1 },
        { label: "Tình yêu", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q19_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q19_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Đau đớn",
      explanation:
        "Đau đớn làm các cơ mặt co lại. Mắt có thể nhắm chặt, lông mày hạ xuống, môi ép lên trên và cổ có thể căng lại như một phản ứng tự vệ.",
      options: [
        { label: "Tội lỗi", score: 0 },
        { label: "Buồn bã", score: 0 },
        { label: "Đau đớn", score: 1 },
        { label: "Ghê tởm", score: 0 }
      ]
    },
    {
      question: "Khuôn mặt này đang thể hiện cảm xúc nào?",
imageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q20_question_image.jpg", // TODO: dán link ảnh cho câu 3
      answerImageUrl: "https://greatergood.berkeley.edu/images/EIQuiz/q20_answer_image.jpg", // ảnh sau khi trả lời, có chú thích đúng/sai          correctAnswer: "Tình yêu",
      explanation:
        "Tình yêu thường giống hạnh phúc nhưng mềm mại hơn, có nụ cười nhẹ và đầu nghiêng sang một bên. Dấu hiệu này thể hiện sự gần gũi, tin tưởng và kết nối.",
      options: [
        { label: "Hài lòng", score: 0 },
        { label: "Tán tỉnh", score: 0 },
        { label: "Tình yêu", score: 1 },
        { label: "Đồng cảm", score: 0 }
      ]
    }
  ],
  resultRules: [
    {
      level: "rat_thap",
      minScore: 0,
      maxScore: 5,
      title: "Bạn có thể đang gặp khó khăn trong việc đọc cảm xúc",
      description:
        "Kết quả cho thấy bạn có thể chưa quen với việc nhận diện cảm xúc qua nét mặt. Điều này không có nghĩa là bạn thiếu sự đồng cảm, mà chỉ cho thấy bạn cần luyện tập thêm cách quan sát mắt, lông mày, miệng và hướng đầu.",
      advice:
        "Hãy quan sát chậm hơn và chú ý các cảm xúc dễ nhầm như sợ hãi với ngạc nhiên, buồn bã với xấu hổ, tức giận với ghê tởm.",
      suggestion:
        "Bạn nên luyện tập thêm cách nhận diện tín hiệu cảm xúc qua nét mặt."
    },
    {
      level: "duoi_trung_binh",
      minScore: 6,
      maxScore: 10,
      title: "Bạn đang trong quá trình phát triển khả năng nhận diện cảm xúc",
      description:
        "Bạn có thể nhận ra một số cảm xúc cơ bản, nhưng vẫn dễ nhầm giữa các biểu cảm có nét tương đồng. Đây là điều khá bình thường vì nhiều cảm xúc có dấu hiệu khuôn mặt gần giống nhau.",
      advice:
        "Hãy tập ghi nhớ dấu hiệu đặc trưng của từng cảm xúc. Ví dụ: nụ cười thật thường thể hiện ở mắt, ngạc nhiên có lông mày nâng lên và hàm mở, còn sợ hãi có mí mắt căng và miệng kéo ngang.",
      suggestion:
        "Bạn đã nhận diện được một số cảm xúc, nhưng cần luyện thêm với các biểu cảm dễ nhầm lẫn."
    },
    {
      level: "trung_binh",
      minScore: 11,
      maxScore: 14,
      title: "Bạn có khả năng đọc cảm xúc ở mức cơ bản",
      description:
        "Kết quả cho thấy bạn đã có khả năng nhận diện nhiều biểu cảm, nhưng vẫn còn không gian để cải thiện. Bạn có thể nhận ra cảm xúc rõ ràng, nhưng có thể gặp khó với cảm xúc tinh tế như khinh thường, lịch sự, xấu hổ hoặc đồng cảm.",
      advice:
        "Hãy chú ý nhiều hơn đến các chi tiết nhỏ như ánh mắt, vị trí lông mày, hướng đầu và nụ cười có thật sự tự nhiên hay chỉ mang tính xã giao.",
      suggestion:
        "Bạn có nền tảng nhận diện cảm xúc cơ bản và có thể cải thiện thêm bằng luyện tập."
    },
    {
      level: "tot",
      minScore: 15,
      maxScore: 17,
      title: "Bạn đọc cảm xúc khá tốt",
      description:
        "Bạn có khả năng nhận diện cảm xúc qua nét mặt tương đối tốt. Bạn thường chú ý được những dấu hiệu quan trọng và có thể hiểu người khác đang cảm thấy thế nào trong các tình huống giao tiếp.",
      advice:
        "Để cải thiện hơn nữa, hãy luyện nhận diện những cảm xúc phức tạp hoặc dễ bị nhầm lẫn. Nên kết hợp nét mặt với ngữ cảnh, giọng nói và ngôn ngữ cơ thể.",
      suggestion:
        "Bạn đọc cảm xúc khá tốt và có thể tiếp tục phát triển với các biểu cảm phức tạp hơn."
    },
    {
      level: "xuat_sac",
      minScore: 18,
      maxScore: 20,
      title: "Bạn có khả năng nhận diện cảm xúc rất tốt",
      description:
        "Kết quả cho thấy bạn có kỹ năng rất tốt trong việc đọc cảm xúc qua biểu cảm khuôn mặt. Bạn có thể nhận ra những chi tiết tinh tế và phân biệt được các trạng thái cảm xúc gần giống nhau.",
      advice:
        "Hãy tiếp tục phát huy điểm mạnh này trong giao tiếp, làm việc nhóm và xây dựng mối quan hệ. Tuy nhiên, để thấu hiểu cảm xúc thật sự, bạn vẫn nên kết hợp quan sát với lắng nghe và đồng cảm.",
      suggestion:
        "Bạn có khả năng nhận diện cảm xúc xuất sắc và nền tảng trí tuệ cảm xúc tốt."
    }
  ],
  isActive: true,
  createdBy: adminId,
  createdAt: now,
  updatedAt: now
});

// =========================================
// TEST RESULTS
// =========================================

db.test_results.insertMany([
  {
    _id: testResult1Id,
    userId: user1Id,
    testId: test1Id,
    answers: [
      { questionIndex: 0, answer: "Sợ hãi", score: 1 },
      { questionIndex: 1, answer: "Hạnh phúc", score: 1 },
      { questionIndex: 2, answer: "Tức giận", score: 1 },
      { questionIndex: 3, answer: "Bối rối", score: 1 },
      { questionIndex: 4, answer: "Tự hào", score: 1 },
      { questionIndex: 5, answer: "Ngạc nhiên", score: 1 },
      { questionIndex: 6, answer: "Khinh thường", score: 1 },
      { questionIndex: 7, answer: "Ghê tởm", score: 1 },
      { questionIndex: 8, answer: "Tán tỉnh", score: 1 },
      { questionIndex: 9, answer: "Đau đớn", score: 1 },
      { questionIndex: 10, answer: "Đồng cảm", score: 1 },
      { questionIndex: 11, answer: "Khao khát", score: 0 },
      { questionIndex: 12, answer: "Ngạc nhiên", score: 0 },
      { questionIndex: 13, answer: "Xấu hổ", score: 0 },
      { questionIndex: 14, answer: "Ghê tởm", score: 0 },
      { questionIndex: 15, answer: "Buồn bã", score: 0 },
      { questionIndex: 16, answer: "Hạnh phúc", score: 0 },
      { questionIndex: 17, answer: "Buồn bã", score: 0 },
      { questionIndex: 18, answer: "Tội lỗi", score: 0 },
      { questionIndex: 19, answer: "Hài lòng", score: 0 }
    ],
    totalScore: 11,
    resultLevel: "trung_binh",
    suggestion:
      "Bạn có nền tảng nhận diện cảm xúc cơ bản và có thể cải thiện thêm bằng luyện tập.",
    nextTestDueAt: nextMonth,
    createdAt: now
  },
  {
    _id: testResult2Id,
    userId: user2Id,
    testId: test1Id,
    answers: [
      { questionIndex: 0, answer: "Sợ hãi", score: 1 },
      { questionIndex: 1, answer: "Hạnh phúc", score: 1 },
      { questionIndex: 2, answer: "Tức giận", score: 1 },
      { questionIndex: 3, answer: "Bối rối", score: 1 },
      { questionIndex: 4, answer: "Tự hào", score: 1 },
      { questionIndex: 5, answer: "Ngạc nhiên", score: 1 },
      { questionIndex: 6, answer: "Buồn bã", score: 0 },
      { questionIndex: 7, answer: "Ghê tởm", score: 1 },
      { questionIndex: 8, answer: "Tán tỉnh", score: 1 },
      { questionIndex: 9, answer: "Đau đớn", score: 1 },
      { questionIndex: 10, answer: "Đồng cảm", score: 1 },
      { questionIndex: 11, answer: "Thích thú", score: 1 },
      { questionIndex: 12, answer: "Hứng thú", score: 1 },
      { questionIndex: 13, answer: "Buồn bã", score: 1 },
      { questionIndex: 14, answer: "Ghê tởm", score: 0 },
      { questionIndex: 15, answer: "Xấu hổ", score: 1 },
      { questionIndex: 16, answer: "Lịch sự", score: 1 },
      { questionIndex: 17, answer: "Bối rối", score: 1 },
      { questionIndex: 18, answer: "Đau đớn", score: 1 },
      { questionIndex: 19, answer: "Tình yêu", score: 1 }
    ],
    totalScore: 18,
    resultLevel: "xuat_sac",
    suggestion:
      "Bạn có khả năng nhận diện cảm xúc xuất sắc và nền tảng trí tuệ cảm xúc tốt.",
    nextTestDueAt: nextMonth,
    createdAt: now
  }
]);

db.users.updateMany(
  { _id: { $in: [user1Id, user2Id, user3Id] } },
  {
    $set: {
      lastEmotionalTestAt: now,
      nextEmotionalTestDueAt: nextMonth
    }
  }
);

// =========================================
// TAGS
// =========================================

db.tags.insertMany([
  {
    name: "stress",
    description: "Stress and pressure discussions",
    postCount: 2,
    status: "active",
    createdAt: now,
    updatedAt: now
  },
  {
    name: "self-care",
    description: "Healthy coping and healing",
    postCount: 1,
    status: "active",
    createdAt: now,
    updatedAt: now
  },
  {
    name: "student-life",
    description: "Student life and academic pressure",
    postCount: 1,
    status: "active",
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// POSTS
// emotionStatus is positive / neutral / negative only.
// =========================================

const post1Id = new ObjectId();
const post2Id = new ObjectId();
const post3Id = new ObjectId();

db.posts.insertMany([
  {
    _id: post1Id,
    authorId: user1Id,
    content: "Moi nguoi lam gi khi cam thay mat dong luc?",
    mediaUrls: [
      {
        url: "https://example.com/images/motivation-support.jpg",
        type: "image"
      }
    ],
    emotionStatus: "negative",
    hashtags: ["stress", "student-life"],
    isAnonymous: true,
    anonymousName: "Tho Lem Linh",
    visibility: "public",
    status: "approved",
    statistics: {
      supportCount: 1,
      hugCount: 1,
      encourageCount: 0,
      thankyouCount: 0,
      commentCount: 1,
      reportCount: 1
    },
    isFlagged: true,
    toxicityLevel: "low",
    reactions: [
      { userId: user2Id, type: "support", createdAt: now },
      { userId: adminId, type: "hug", createdAt: now }
    ],
    editedAt: null,
    approvedAt: now,
    approvedBy: adminId,
    rejectedReason: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: post2Id,
    authorId: user2Id,
    content: "Minh vua hoan thanh bai tap va thay rat nhe nhom.",
    mediaUrls: [],
    emotionStatus: "positive",
    hashtags: ["self-care"],
    isAnonymous: false,
    anonymousName: null,
    visibility: "public",
    status: "approved",
    statistics: {
      supportCount: 1,
      hugCount: 0,
      encourageCount: 1,
      thankyouCount: 0,
      commentCount: 2,
      reportCount: 0
    },
    isFlagged: false,
    toxicityLevel: "low",
    reactions: [
      { userId: user1Id, type: "support", createdAt: now },
      { userId: adminId, type: "encourage", createdAt: now }
    ],
    editedAt: null,
    approvedAt: now,
    approvedBy: adminId,
    rejectedReason: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: post3Id,
    authorId: user3Id,
    content: "Hom nay minh di hoc va lam bai tap nhu binh thuong.",
    mediaUrls: [],
    emotionStatus: "neutral",
    hashtags: ["student-life"],
    isAnonymous: false,
    anonymousName: null,
    visibility: "public",
    status: "approved",
    statistics: {
      supportCount: 0,
      hugCount: 0,
      encourageCount: 1,
      thankyouCount: 0,
      commentCount: 1,
      reportCount: 0
    },
    isFlagged: false,
    toxicityLevel: "low",
    reactions: [{ userId: user2Id, type: "encourage", createdAt: now }],
    editedAt: null,
    approvedAt: now,
    approvedBy: adminId,
    rejectedReason: null,
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// COMMENTS
// =========================================

const comment1Id = new ObjectId();
const comment2Id = new ObjectId();
const comment3Id = new ObjectId();

db.comments.insertMany([
  {
    _id: comment1Id,
    postId: post1Id,
    authorId: user2Id,
    parentCommentId: null,
    content: "Minh thuong nghe nhac va nghi ngoi mot chut.",
    isAnonymous: false,
    anonymousName: null,
    status: "active",
    statistics: {
      supportCount: 1,
      hugCount: 0,
      encourageCount: 0,
      thankyouCount: 0,
      replyCount: 0,
      reportCount: 1
    },
    toxicityLevel: "low",
    reactions: [{ userId: user1Id, type: "support", createdAt: now }],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: comment2Id,
    postId: post2Id,
    authorId: user1Id,
    parentCommentId: null,
    content: "Cam on ban da chia se nang luong tich cuc.",
    isAnonymous: false,
    anonymousName: null,
    status: "active",
    statistics: {
      supportCount: 1,
      hugCount: 0,
      encourageCount: 0,
      thankyouCount: 1,
      replyCount: 0,
      reportCount: 0
    },
    toxicityLevel: "low",
    reactions: [
      { userId: user2Id, type: "support", createdAt: now },
      { userId: adminId, type: "thankyou", createdAt: now }
    ],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: comment3Id,
    postId: post3Id,
    authorId: user2Id,
    parentCommentId: null,
    content: "Mot ngay binh thuong cung dang duoc tran trong.",
    isAnonymous: false,
    anonymousName: null,
    status: "active",
    statistics: {
      supportCount: 0,
      hugCount: 0,
      encourageCount: 1,
      thankyouCount: 0,
      replyCount: 0,
      reportCount: 0
    },
    toxicityLevel: "low",
    reactions: [{ userId: user3Id, type: "encourage", createdAt: now }],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// REPORTS
// =========================================

const report1Id = new ObjectId();

db.reports.insertOne({
  _id: report1Id,
  targetType: "post",
  targetId: post1Id,
  reporterId: user2Id,
  reportedUserId: user1Id,
  reason: "Sensitive content",
  description: "Post may contain emotional distress.",
  status: "pending",
  createdAt: now,
  updatedAt: now
});

// =========================================
// MODERATION LOGS
// =========================================

db.moderation_logs.insertMany([
  {
    target: { type: "post", id: post1Id },
    action: "warn_user",
    reason: "Sensitive content",
    note:
      "Post flagged for emotional distress. User should receive supportive monitoring, not automatic punishment.",
    performedBy: adminId,
    previousStatus: "approved",
    newStatus: "approved",
    createdAt: now
  }
]);

// =========================================
// EVENTS
// =========================================

const event1Id = new ObjectId();
const event2Id = new ObjectId();
const event3Id = new ObjectId();

db.events.insertMany([
  {
    _id: event1Id,
    title: "Mental Wellness Workshop",
    description: "Workshop about emotional self-care.",
    speakerName: "Dr. Minh",
    organizerName: "SOUL Team",
    contactEmail: "events@soul.com",
    bannerImage: "https://example.com/images/mental-wellness-workshop.jpg",
    images: [
      { url: "https://example.com/images/workshop-room.jpg", type: "image" }
    ],
    eventType: "workshop",

    // Offline event: bắt buộc có location, meetingLink null
    eventMode: "offline",
    startDateTime: new Date("2026-08-01T09:00:00"),
    endDateTime: new Date("2026-08-01T11:00:00"),
    location: "FPT University Hall",
    meetingLink: null,
    locationKey: "offline:fpt university hall",

    capacity: 100,
    registeredCount: 1,
    participants: [
      {
        userId: user1Id,
        status: "registered",
        registeredAt: now,
        cancelledAt: null
      }
    ],
    status: "upcoming",
    createdBy: organizerId,
    approvalStatus: "approved",
    approvedBy: adminId,
    approvedAt: now,
    rejectedReason: null,
    lockAfterApproval: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: event2Id,
    title: "Stress Management Talkshow",
    description: "Discussion about coping with academic pressure.",
    speakerName: "Ms. Lan",
    organizerName: "SOUL Community",
    contactEmail: "talkshow@soul.com",
    bannerImage: "https://example.com/images/stress-management-talkshow.jpg",
    images: [
      { url: "https://example.com/images/online-talkshow.jpg", type: "image" }
    ],
    eventType: "talkshow",

    // Online event: bắt buộc có meetingLink, location null
    eventMode: "online",
    startDateTime: new Date("2026-09-15T18:00:00"),
    endDateTime: new Date("2026-09-15T20:00:00"),
    location: null,
    meetingLink: "https://zoom.example.com/soul-talkshow",
    locationKey: "online:https://zoom.example.com/soul-talkshow",

    capacity: 200,
    registeredCount: 1,
    participants: [
      {
        userId: user2Id,
        status: "registered",
        registeredAt: now,
        cancelledAt: null
      }
    ],
    status: "upcoming",
    createdBy: organizerId,
    approvalStatus: "approved",
    approvedBy: adminId,
    approvedAt: now,
    rejectedReason: null,
    lockAfterApproval: true,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: event3Id,
    title: "Mindfulness Practice Session",
    description: "Pending offline event waiting for admin review.",
    speakerName: "Coach An",
    organizerName: "SOUL Event Organizer",
    contactEmail: "organizer@soul.com",
    bannerImage: null,
    images: [],
    eventType: "community_event",

    // Event này để test luồng admin duyệt pending
    eventMode: "offline",
    startDateTime: new Date("2026-10-05T08:30:00"),
    endDateTime: new Date("2026-10-05T10:00:00"),
    location: "FPT University Room B203",
    meetingLink: null,
    locationKey: "offline:fpt university room b203",

    capacity: 50,
    registeredCount: 0,
    participants: [],
    status: "upcoming",
    createdBy: organizerId,
    approvalStatus: "pending",
    approvedBy: null,
    approvedAt: null,
    rejectedReason: null,
    lockAfterApproval: true,
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// FRIEND REQUESTS
// Optional for Friend Recommendation module.
// Example: negative user1 receives suggestion to connect with positive user2.
// =========================================

const friendRequest1Id = new ObjectId();

db.friend_requests.insertOne({
  _id: friendRequest1Id,
  requesterId: user1Id,
  receiverId: user2Id,
  status: "pending",
  source: "friend_recommendation",
  recommendationReason:
    "User1 currently has negative emotional state; User2 currently has positive emotional state.",
  createdAt: now,
  respondedAt: null,
  updatedAt: now
});

// =========================================
// FRIENDSHIPS
// Optional for Profile/Friend module.
// =========================================

db.friendships.insertOne({
  userAId: user2Id,
  userBId: user3Id,
  status: "active",
  createdFromRequestId: null,
  createdAt: now,
  updatedAt: now
});

// =========================================
// NOTIFICATIONS
// =========================================

db.notifications.insertMany([
  {
    userId: user1Id,
    type: "event_reminder",
    title: "Workshop Reminder",
    content: "Your workshop starts tomorrow.",
    related: { type: "event", id: event1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user2Id,
    type: "mental_insight",
    title: "Weekly Emotional Insight",
    content: "This week you maintained a mostly positive emotional state.",
    related: { type: "diary", id: diary2Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "safety_alert",
    title: "Emotional Support Reminder",
    content:
      "Remember that you can seek support from trusted people when overwhelmed.",
    related: { type: "safety_event", id: safetyEvent1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "emotional_test_reminder",
    title: "Monthly Emotional Test Reminder",
    content:
      "It is time to retake your Emotional Test to track your emotional state this month.",
    related: { type: "test_result", id: test1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "friend_suggestion",
    title: "SOUL found a positive companion",
    content:
      "SOUL found a positive community member who may be a supportive connection for you.",
    related: { type: "friend_request", id: friendRequest1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user2Id,
    type: "positive_support_request",
    title: "Community Support Request",
    content:
      "A community member may need encouragement. Consider connecting or leaving a supportive comment if you feel comfortable.",
    related: { type: "post", id: post1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  }
]);

print("SOUL MongoDB seed data inserted successfully.");