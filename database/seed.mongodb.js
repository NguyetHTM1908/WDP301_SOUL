// =========================================
// SOUL DATABASE SEED - MONGODB / NOSQL
// =========================================

use("soul_db");

const now = new Date();

// =========================================
// DEMO USERS
// =========================================

//admin@soul.com  → Admin@123
//user1@soul.com  → User@123
//user2@soul.com  → User@123

const adminId = new ObjectId();
const user1Id = new ObjectId();
const user2Id = new ObjectId();

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
    gender: "female",
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
    note: "Hôm nay mình cảm thấy khá áp lực vì deadline.",
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
    note: "Mình vừa hoàn thành xong bài tập và thấy rất nhẹ nhõm.",
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
    note: "Mình lo lắng về kết quả môn học sắp tới.",
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
// CHAT SESSIONS
// =========================================

const session1Id = new ObjectId();
const session2Id = new ObjectId();
const session3Id = new ObjectId();

db.chat_sessions.insertMany([
  {
    _id: session1Id,
    userId: user1Id,
    title: "Stress about university",
    overallSentiment: "negative",
    highestRiskLevel: "medium",
    isArchived: false,
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
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// CHAT MESSAGES
// =========================================

const message1Id = new ObjectId();
const message2Id = new ObjectId();
const message3Id = new ObjectId();
const message4Id = new ObjectId();
const message5Id = new ObjectId();
const message6Id = new ObjectId();

db.chat_messages.insertMany([
  {
    _id: message1Id,
    sessionId: session1Id,
    userId: user1Id,
    sender: "user",
    content: "Dạo này mình cảm thấy rất mệt mỏi và áp lực.",
    isSafetyResponse: false,
    createdAt: now
  },
  {
    _id: message2Id,
    sessionId: session1Id,
    userId: user1Id,
    sender: "ai",
    content: "Mình nghe thấy rằng bạn đang trải qua khá nhiều áp lực gần đây. Bạn có muốn chia sẻ điều gì khiến bạn mệt nhất lúc này không?",
    isSafetyResponse: false,
    createdAt: now
  },
  {
    _id: message3Id,
    sessionId: session2Id,
    userId: user2Id,
    sender: "user",
    content: "Dạo này mình cảm thấy khá cô đơn.",
    isSafetyResponse: false,
    createdAt: now
  },
  {
    _id: message4Id,
    sessionId: session2Id,
    userId: user2Id,
    sender: "ai",
    content: "Mình nghe thấy rằng bạn đang cảm thấy thiếu kết nối với mọi người gần đây. Một bước nhỏ có thể là nhắn tin cho một người bạn mà bạn tin tưởng.",
    isSafetyResponse: false,
    createdAt: now
  },
  {
    _id: message5Id,
    sessionId: session3Id,
    userId: user1Id,
    sender: "user",
    content: "Đôi khi mình chỉ muốn biến mất khỏi mọi thứ.",
    isSafetyResponse: false,
    createdAt: now
  },
  {
    _id: message6Id,
    sessionId: session3Id,
    userId: user1Id,
    sender: "ai",
    content: "Mình rất tiếc vì bạn đang trải qua cảm giác này. Bạn không cần đối mặt một mình. Hãy liên hệ với người thân, bạn bè đáng tin cậy hoặc dịch vụ hỗ trợ khẩn cấp tại nơi bạn sống nếu bạn đang gặp nguy hiểm.",
    isSafetyResponse: true,
    createdAt: now
  }
]);

// =========================================
// AI ANALYSES
// =========================================

db.ai_analyses.insertMany([
  {
    userId: user1Id,
    target: {
      type: "chat_message",
      id: message1Id
    },
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
    target: {
      type: "chat_message",
      id: message3Id
    },
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
    target: {
      type: "chat_message",
      id: message5Id
    },
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
    target: {
      type: "diary",
      id: diary1Id
    },
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
  source: {
    type: "chat_message",
    id: message5Id
  },
  riskLevel: "high",
  safetyType: "self_harm_risk",
  detectedText: "Đôi khi mình chỉ muốn biến mất khỏi mọi thứ.",
  systemAction: "show_safety_response",
  safetyMessage: "Bạn không cần đối mặt một mình. Hãy liên hệ với người thân, bạn bè đáng tin cậy hoặc dịch vụ hỗ trợ khẩn cấp tại nơi bạn sống nếu bạn đang gặp nguy hiểm.",
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
      question: "How often do you feel tired or mentally exhausted?",
      options: [
        { label: "Rarely", score: 1 },
        { label: "Sometimes", score: 2 },
        { label: "Often", score: 3 }
      ]
    },
    {
      question: "How often do you feel overwhelmed by study or work?",
      options: [
        { label: "Rarely", score: 1 },
        { label: "Sometimes", score: 2 },
        { label: "Often", score: 3 }
      ]
    },
    {
      question: "How difficult is it for you to relax recently?",
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
      { questionIndex: 0, answer: "Often", score: 3 },
      { questionIndex: 1, answer: "Sometimes", score: 2 },
      { questionIndex: 2, answer: "Moderate", score: 2 }
    ],
    totalScore: 7,
    resultLevel: "medium",
    suggestion: "You may be experiencing some stress. Try resting and sharing with someone trusted.",
    createdAt: now
  },
  {
    userId: user2Id,
    testId: test1Id,
    answers: [
      { questionIndex: 0, answer: "Sometimes", score: 2 },
      { questionIndex: 1, answer: "Rarely", score: 1 },
      { questionIndex: 2, answer: "Easy", score: 1 }
    ],
    totalScore: 4,
    resultLevel: "low",
    suggestion: "Your stress level seems low. Maintain healthy routines.",
    createdAt: now
  }
]);

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
    content: "Mọi người làm gì khi cảm thấy mất động lực?",
    mediaUrls: [
      {
        url: "https://example.com/images/motivation-support.jpg",
        type: "image"
      }
    ],
    emotionStatus: "stress",
    hashtags: ["stress", "student-life"],
    isAnonymous: true,
    visibility: "public",
    status: "approved",
    statistics: {
      likeCount: 0,
      supportCount: 1,
      hugCount: 0,
      commentCount: 1,
      reportCount: 1
    },
    isFlagged: true,
    toxicityLevel: "low",
    reactions: [
      {
        userId: user2Id,
        type: "support",
        createdAt: now
      }
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
    content: "Có ai từng bị burnout vì học tập chưa?",
    mediaUrls: [],
    emotionStatus: "stress",
    hashtags: ["stress"],
    isAnonymous: true,
    visibility: "public",
    status: "approved",
    statistics: {
      likeCount: 0,
      supportCount: 1,
      hugCount: 0,
      commentCount: 1,
      reportCount: 0
    },
    isFlagged: false,
    toxicityLevel: "low",
    reactions: [
      {
        userId: user1Id,
        type: "support",
        createdAt: now
      }
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
    content: "Mình đang cố gắng ngủ sớm hơn để cải thiện tâm trạng.",
    mediaUrls: [
      {
        url: "https://example.com/images/self-care-sleep.jpg",
        type: "image"
      }
    ],
    emotionStatus: "happy",
    hashtags: ["self-care"],
    isAnonymous: false,
    visibility: "public",
    status: "approved",
    statistics: {
      likeCount: 1,
      supportCount: 0,
      hugCount: 0,
      commentCount: 1,
      reportCount: 0
    },
    isFlagged: false,
    toxicityLevel: "low",
    reactions: [
      {
        userId: user2Id,
        type: "like",
        createdAt: now
      }
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
    content: "Mình thường nghe nhạc và nghỉ ngơi một chút.",
    isAnonymous: false,
    status: "active",
    statistics: {
      likeCount: 1,
      supportCount: 0,
      hugCount: 0,
      reportCount: 1
    },
    toxicityLevel: "low",
    reactions: [
      {
        userId: user1Id,
        type: "like",
        createdAt: now
      }
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
    content: "Mình từng như vậy, nghỉ ngơi một chút sẽ giúp hơn.",
    isAnonymous: false,
    status: "active",
    statistics: {
      likeCount: 0,
      supportCount: 1,
      hugCount: 0,
      reportCount: 0
    },
    toxicityLevel: "low",
    reactions: [
      {
        userId: user2Id,
        type: "support",
        createdAt: now
      }
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
    content: "Ngủ đủ thật sự giúp mood ổn hơn nhiều.",
    isAnonymous: false,
    status: "active",
    statistics: {
      likeCount: 0,
      supportCount: 0,
      hugCount: 0,
      reportCount: 0
    },
    toxicityLevel: "low",
    reactions: [],
    editedAt: null,
    createdAt: now,
    updatedAt: now
  },
  {
    _id: comment4Id,
    postId: post2Id,
    authorId: user2Id,
    parentCommentId: comment2Id,
    content: "Cảm ơn bạn, mình sẽ thử nghỉ ngơi nhiều hơn.",
    isAnonymous: false,
    status: "active",
    statistics: {
      likeCount: 0,
      supportCount: 0,
      hugCount: 0,
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
    target: {
      type: "report",
      id: report2Id
    },
    action: "reject_report",
    reason: "Potential harmful advice",
    note: "Admin reviewed the comment and found no harmful content.",
    performedBy: adminId,
    previousStatus: "pending",
    newStatus: "dismissed",
    createdAt: now
  },
  {
    target: {
      type: "post",
      id: post1Id
    },
    action: "hide_content",
    reason: "Sensitive content",
    note: "Post flagged for emotional distress. Pending further review.",
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
      {
        url: "https://example.com/images/workshop-room.jpg",
        type: "image"
      }
    ],
    eventType: "workshop",
    startDateTime: new Date("2025-08-01T09:00:00"),
    endDateTime: new Date("2025-08-01T11:00:00"),
    location: "FPT University Hall",
    meetingLink: null,
    capacity: 100,
    registeredCount: 1,
    status: "upcoming",
    createdBy: adminId,
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
      {
        url: "https://example.com/images/online-talkshow.jpg",
        type: "image"
      }
    ],
    eventType: "talkshow",
    startDateTime: new Date("2025-09-15T18:00:00"),
    endDateTime: new Date("2025-09-15T20:00:00"),
    location: "Online Zoom",
    meetingLink: "https://zoom.example.com/soul-talkshow",
    capacity: 200,
    registeredCount: 1,
    status: "upcoming",
    createdBy: adminId,
    createdAt: now,
    updatedAt: now
  }
]);

// =========================================
// EVENT REGISTRATIONS
// =========================================

db.event_registrations.insertMany([
  {
    eventId: event1Id,
    userId: user1Id,
    status: "registered",
    registeredAt: now,
    cancelledAt: null
  },
  {
    eventId: event2Id,
    userId: user2Id,
    status: "registered",
    registeredAt: now,
    cancelledAt: null
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
    related: {
      type: "event",
      id: event1Id
    },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user2Id,
    type: "mental_insight",
    title: "Weekly Emotional Insight",
    content: "This week you showed signs of stress on multiple days.",
    related: {
      type: "diary",
      id: diary2Id
    },
    isRead: false,
    readAt: null,
    createdAt: now
  },
  {
    userId: user1Id,
    type: "safety_alert",
    title: "Emotional Support Reminder",
    content: "Remember that you can seek support from trusted people when overwhelmed.",
    related: {
      type: "safety_event",
      id: safetyEvent1Id
    },
    isRead: false,
    readAt: null,
    createdAt: now
  }
]);

print("SOUL MongoDB seed data inserted successfully.");