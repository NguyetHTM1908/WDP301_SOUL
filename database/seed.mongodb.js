
use("soul_db");
 
const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
 
// =========================================
// DEMO USERS
// =========================================
 
// admin@soul.com      -> Admin@123
// user1@soul.com      -> User@123
// user2@soul.com      -> User@123
// organizer@soul.com  -> User@123
 
const adminId = new ObjectId();
const user1Id = new ObjectId();
const user2Id = new ObjectId();
const organizerId = new ObjectId();
 
db.users.insertMany([
  {
    _id: adminId,
    fullName: "Admin SOUL",
    email: "admin@soul.com",
    phone: "0900000001",
    passwordHash: "$2b$10$aZNR27yMewRS93tPRdlm5OC7oVeHJqM.WoySg0L2Z0K.nBFWEToYO",
    avatarUrl: null,
    bio: "Administrator account for SOUL platform.",
    savedPosts: [],
    role: "admin",
    status: "active",
    forumBannedUntil: null,
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
    passwordHash: "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "University student interested in emotional wellness.",
    savedPosts: [],
    role: "user",
    status: "active",
    forumBannedUntil: null,
    moodReputation: "negative",
    moodReputationScore: 35,
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
    passwordHash: "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "Student who enjoys self-care and mindfulness activities.",
    savedPosts: [],
    role: "user",
    status: "active",
    forumBannedUntil: null,
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
    _id: organizerId,
    fullName: "SOUL Event Organizer",
    email: "organizer@soul.com",
    phone: "0900000004",
    passwordHash: "$2b$10$14/MOZ5I5VgxcxcCgtnXK.KsMGQm5Lz0/4MfqMS.IsrVv7bE.Zgn.",
    avatarUrl: null,
    bio: "Event organizer account for managing SOUL workshops and talkshows.",
    savedPosts: [],
    role: "event_organizer",
    status: "active",
    forumBannedUntil: null,
    moodReputation: "neutral",
    moodReputationScore: 0,
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
 
db.diaries.insertMany([
  {
    _id: diary1Id,
    userId: user1Id,
    mood: "stressed",
    moodScore: 3,
    note: "Hom nay minh cam thay kha ap luc vi deadline.",
    isPrivate: true,
    aiInsight: {
      emotion: "stress",
      summary: "User feels pressured because of deadlines.",
      suggestion: "Try breaking tasks into smaller steps and taking short breaks."
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
      emotion: "relief",
      summary: "User feels relieved after finishing school work.",
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
      emotion: "anxiety",
      summary: "User is worried about upcoming academic results.",
      suggestion: "Focus on what can be controlled and talk to someone trusted."
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
    weekStartDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
    weekEndDate: now,
    averageMoodScore: 3.5,
    dominantEmotion: "stress",
    moodTrend: "declining",
    summary: "User showed stress and anxiety across multiple diary entries this week.",
    advice: "Try small daily breaks, write down controllable tasks, and reach out to trusted people when feeling overwhelmed.",
    sourceDiaryIds: [diary1Id, diary3Id],
    generatedBy: "ai",
    createdAt: now,
    updatedAt: now
  },
  {
    userId: user2Id,
    weekStartDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
    weekEndDate: now,
    averageMoodScore: 8,
    dominantEmotion: "relief",
    moodTrend: "stable",
    summary: "User maintained a mostly positive emotional state this week.",
    advice: "Maintain healthy routines and consider supporting others in the community when appropriate.",
    sourceDiaryIds: [diary2Id],
    generatedBy: "ai",
    createdAt: now,
    updatedAt: now
  }
]);
 
// =========================================
// CHAT SESSIONS - EMBEDDED MESSAGES
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
        content: "Minh nghe thay rang ban dang trai qua kha nhieu ap luc gan day. Ban co muon chia se dieu gi khien ban met nhat luc nay khong?",
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
    title: "Feeling lonely recently",
    overallSentiment: "negative",
    highestRiskLevel: "low",
    isArchived: false,
    messages: [
      {
        _id: message3Id,
        sender: "user",
        content: "Dao nay minh cam thay kha co don.",
        isSafetyResponse: false,
        createdAt: now
      },
      {
        _id: message4Id,
        sender: "ai",
        content: "Minh nghe thay rang ban dang cam thay thieu ket noi voi moi nguoi gan day. Mot buoc nho co the la nhan tin cho mot nguoi ban ma ban tin tuong.",
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
    title: "Overthinking and stress",
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
        content: "Minh rat tiec vi ban dang trai qua cam giac nay. Ban khong can doi mat mot minh. Hay lien he voi nguoi than, ban be dang tin cay hoac dich vu ho tro khan cap tai noi ban song neu ban dang gap nguy hiem.",
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
// =========================================
 
db.ai_analyses.insertMany([
  {
    userId: user1Id,
    target: { type: "chat_message", id: message1Id },
    sentiment: "negative",
    emotion: "stress",
    riskLevel: "medium",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    summary: "User is experiencing academic stress.",
    suggestion: "Try taking short breaks and sharing feelings with trusted friends.",
    modelName: "gpt-4",
    createdAt: now
  },
  {
    userId: user2Id,
    target: { type: "chat_message", id: message3Id },
    sentiment: "negative",
    emotion: "loneliness",
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    summary: "User is experiencing loneliness.",
    suggestion: "Encourage user to connect with trusted friends or communities.",
    modelName: "gpt-4",
    createdAt: now
  },
  {
    userId: user1Id,
    target: { type: "chat_message", id: message5Id },
    sentiment: "negative",
    emotion: "hopelessness",
    riskLevel: "high",
    toxicityLevel: "low",
    safetyTriggered: true,
    safetyType: "self_harm_risk",
    summary: "Potential emotional crisis detected.",
    suggestion: "Recommend contacting trusted people, professional support, or emergency services.",
    modelName: "gpt-4",
    createdAt: now
  },
  {
    userId: user1Id,
    target: { type: "diary", id: diary1Id },
    sentiment: "negative",
    emotion: "stress",
    riskLevel: "low",
    toxicityLevel: "low",
    safetyTriggered: false,
    safetyType: null,
    summary: "Diary shows stress due to deadlines.",
    suggestion: "Try short breaks and task prioritization.",
    modelName: "gpt-4",
    createdAt: now
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
  safetyMessage: "Ban khong can doi mat mot minh. Hay lien he voi nguoi than, ban be dang tin cay hoac dich vu ho tro khan cap tai noi ban song neu ban dang gap nguy hiem.",
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
 
db.emotional_tests.insertOne({
  _id: test1Id,
  title: "Stress Level Test",
  description: "Simple emotional stress assessment for self-reflection. This test is not a medical diagnosis.",
  questions: [
    {
      question: "This face is expressing which emotion?",
      imageUrl: "https://example.com/images/emotion-fear.jpg",
      correctAnswer: "Fear",
      explanation: "Fear is often shown through widened eyes, raised eyebrows, and tense facial muscles.",
      options: [
        { label: "Happiness", score: 1 },
        { label: "Fear", score: 3 },
        { label: "Politeness", score: 1 }
      ]
    },
    {
      question: "How often do you feel overwhelmed by study or work?",
      imageUrl: null,
      correctAnswer: null,
      explanation: "This question helps estimate current stress frequency.",
      options: [
        { label: "Rarely", score: 1 },
        { label: "Sometimes", score: 2 },
        { label: "Often", score: 3 }
      ]
    },
    {
      question: "How difficult is it for you to relax recently?",
      imageUrl: null,
      correctAnswer: null,
      explanation: "Difficulty relaxing may indicate stress or anxiety.",
      options: [
        { label: "Easy", score: 1 },
        { label: "Moderate", score: 2 },
        { label: "Difficult", score: 3 }
      ]
    }
  ],
  resultRules: [
    {
      level: "low",
      minScore: 3,
      maxScore: 4,
      suggestion: "Your stress level seems low. Maintain healthy routines."
    },
    {
      level: "medium",
      minScore: 5,
      maxScore: 7,
      suggestion: "You may be experiencing some stress. Try resting and sharing with someone trusted."
    },
    {
      level: "high",
      minScore: 8,
      maxScore: 9,
      suggestion: "You may be under high stress. Consider seeking support from trusted people or professionals."
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
    userId: user1Id,
    testId: test1Id,
    answers: [
      { questionIndex: 0, answer: "Fear", score: 3 },
      { questionIndex: 1, answer: "Sometimes", score: 2 },
      { questionIndex: 2, answer: "Moderate", score: 2 }
    ],
    totalScore: 7,
    resultLevel: "medium",
    suggestion: "You may be experiencing some stress. Try resting and sharing with someone trusted.",
    nextTestDueAt: nextMonth,
    createdAt: now
  },
  {
    userId: user2Id,
    testId: test1Id,
    answers: [
      { questionIndex: 0, answer: "Happiness", score: 1 },
      { questionIndex: 1, answer: "Rarely", score: 1 },
      { questionIndex: 2, answer: "Easy", score: 1 }
    ],
    totalScore: 3,
    resultLevel: "low",
    suggestion: "Your stress level seems low. Maintain healthy routines.",
    nextTestDueAt: nextMonth,
    createdAt: now
  }
]);
 
db.users.updateMany(
  { _id: { $in: [user1Id, user2Id] } },
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
      { url: "https://example.com/images/motivation-support.jpg", type: "image" }
    ],
    emotionStatus: "stress",
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
    content: "Co ai tung bi burnout vi hoc tap chua?",
    mediaUrls: [],
    emotionStatus: "stress",
    hashtags: ["stress"],
    isAnonymous: true,
    anonymousName: "Cao Thong Minh",
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
    authorId: user1Id,
    content: "Minh dang co gang ngu som hon de cai thien tam trang.",
    mediaUrls: [
      { url: "https://example.com/images/self-care-sleep.jpg", type: "image" }
    ],
    emotionStatus: "happy",
    hashtags: ["self-care"],
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
    reactions: [
      { userId: user2Id, type: "encourage", createdAt: now }
    ],
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
const comment4Id = new ObjectId();
 
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
    reactions: [
      { userId: user1Id, type: "support", createdAt: now }
    ],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: comment2Id,
    postId: post2Id,
    authorId: user1Id,
    parentCommentId: null,
    content: "Minh tung nhu vay, nghi ngoi mot chut se giup hon.",
    isAnonymous: false,
    anonymousName: null,
    status: "active",
    statistics: {
      supportCount: 1,
      hugCount: 0,
      encourageCount: 0,
      thankyouCount: 1,
      replyCount: 1,
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
    content: "Ngu du that su giup mood on hon nhieu.",
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
    reactions: [
      { userId: user1Id, type: "encourage", createdAt: now }
    ],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: comment4Id,
    postId: post2Id,
    authorId: user2Id,
    parentCommentId: comment2Id,
    content: "Cam on ban, minh se thu nghi ngoi nhieu hon.",
    isAnonymous: false,
    anonymousName: null,
    status: "active",
    statistics: {
      supportCount: 0,
      hugCount: 0,
      encourageCount: 0,
      thankyouCount: 0,
      replyCount: 0,
      reportCount: 0
    },
    toxicityLevel: "low",
    reactions: [],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  }
]);
 
// =========================================
// REPORTS
// =========================================
 
const report1Id = new ObjectId();
const report2Id = new ObjectId();
 
db.reports.insertMany([
  {
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
  },
  {
    _id: report2Id,
    targetType: "comment",
    targetId: comment1Id,
    reporterId: user1Id,
    reportedUserId: user2Id,
    reason: "Potential harmful advice",
    description: "Comment may negatively affect emotional state.",
    status: "dismissed",
    createdAt: now,
    updatedAt: now
  }
]);
 
// =========================================
// MODERATION LOGS
// =========================================
 
db.moderation_logs.insertMany([
  {
    target: { type: "report", id: report2Id },
    action: "reject_report",
    reason: "Potential harmful advice",
    note: "Admin reviewed the comment and found no harmful content.",
    performedBy: adminId,
    previousStatus: "pending",
    newStatus: "dismissed",
    createdAt: now
  },
  {
    target: { type: "post", id: post1Id },
    action: "warn_user",
    reason: "Sensitive content",
    note: "Post flagged for emotional distress. User should receive supportive monitoring, not automatic punishment.",
    performedBy: adminId,
    previousStatus: "approved",
    newStatus: "approved",
    createdAt: now
  }
]);
 
// =========================================
// EVENTS - EMBEDDED PARTICIPANTS
// =========================================
 
const event1Id = new ObjectId();
const event2Id = new ObjectId();
 
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
    startDateTime: new Date("2026-08-01T09:00:00"),
    endDateTime: new Date("2026-08-01T11:00:00"),
    location: "FPT University Hall",
    meetingLink: null,
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
    startDateTime: new Date("2026-09-15T18:00:00"),
    endDateTime: new Date("2026-09-15T20:00:00"),
    location: "Online Zoom",
    meetingLink: "https://zoom.example.com/soul-talkshow",
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
  }
]);
 
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
    content: "This week you showed signs of stress on multiple days.",
    related: { type: "diary", id: diary2Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "safety_alert",
    title: "Emotional Support Reminder",
    content: "Remember that you can seek support from trusted people when overwhelmed.",
    related: { type: "safety_event", id: safetyEvent1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "emotional_test_reminder",
    title: "Monthly Emotional Test Reminder",
    content: "It is time to retake your Emotional Test to track your emotional state this month.",
    related: { type: "test_result", id: test1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user2Id,
    type: "positive_support_request",
    title: "Community Support Request",
    content: "A community member may need encouragement. Consider leaving a supportive comment if you feel comfortable.",
    related: { type: "post", id: post1Id },
    isRead: false,
    readAt: null,
    createdAt: now
  }
]);
 
print("SOUL MongoDB seed data inserted successfully.");
