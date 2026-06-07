// =========================================
// SOUL DATABASE INIT - MONGODB / NOSQL
// =========================================

use("soul_db");

// =========================================
// DROP COLLECTIONS
// =========================================

db.users.drop();
db.diaries.drop();
db.weekly_emotional_insights.drop();
db.chat_sessions.drop();
db.ai_analyses.drop();
db.safety_events.drop();
db.emotional_tests.drop();
db.test_results.drop();
db.posts.drop();
db.comments.drop();
db.tags.drop();
db.reports.drop();
db.moderation_logs.drop();
db.events.drop();
db.notifications.drop();

// =========================================
// USERS
// =========================================

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["fullName", "email", "passwordHash", "role", "status", "createdAt"],
      properties: {
        fullName: { bsonType: "string" },
        email: { bsonType: "string" },
        phone: { bsonType: ["string", "null"] },
        passwordHash: { bsonType: "string" },
        avatarUrl: { bsonType: ["string", "null"] },
        bio: { bsonType: ["string", "null"] },

        savedPosts: { bsonType: "array", items: { bsonType: "objectId" } },

        role: { enum: ["user", "admin", "event_organizer"] },
        status: { enum: ["active", "inactive", "blocked"] },
        forumBannedUntil: { bsonType: ["date", "null"] },

        moodReputation: { enum: ["positive", "neutral", "negative"], default: "neutral" },
        moodReputationScore: { bsonType: "int", default: 0 },
        moodReputationUpdatedAt: { bsonType: ["date", "null"] },

        anonymousModeEnabled: { bsonType: "bool" },
        anonymousAlias: { bsonType: ["string", "null"] },
        anonymousModeUpdatedAt: { bsonType: ["date", "null"] },

        lastEmotionalTestAt: { bsonType: ["date", "null"] },
        nextEmotionalTestDueAt: { bsonType: ["date", "null"] },
        gender: { enum: ["male", "female", "other"] },
        dateOfBirth: { bsonType: ["date", "null"] },
        isEmailVerified: { bsonType: "bool" },
        emailVerifiedAt: { bsonType: ["date", "null"] },
        lastLoginAt: { bsonType: ["date", "null"] },
        failedLoginAttempts: { bsonType: "int" },
        passwordChangedAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ moodReputation: 1 });
db.users.createIndex({ nextEmotionalTestDueAt: 1 });

// =========================================
// DIARIES
// =========================================

db.createCollection("diaries", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "mood", "moodScore", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        mood: { bsonType: "string" },
        moodScore: { bsonType: "int", minimum: 1, maximum: 10 },
        note: { bsonType: ["string", "null"] },
        isPrivate: { bsonType: "bool" },

        aiInsight: {
          bsonType: ["object", "null"],
          properties: {
            emotion: { bsonType: ["string", "null"] },
            summary: { bsonType: ["string", "null"] },
            suggestion: { bsonType: ["string", "null"] }
          }
        },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.diaries.createIndex({ userId: 1 });
db.diaries.createIndex({ userId: 1, createdAt: -1 });

// =========================================
// WEEKLY EMOTIONAL INSIGHTS
// =========================================

db.createCollection("weekly_emotional_insights", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "weekStartDate", "weekEndDate", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        weekStartDate: { bsonType: "date" },
        weekEndDate: { bsonType: "date" },

        averageMoodScore: { bsonType: ["double", "int", "null"] },
        dominantEmotion: { bsonType: ["string", "null"] },
        moodTrend: { enum: ["improving", "stable", "declining"] },

        summary: { bsonType: ["string", "null"] },
        advice: { bsonType: ["string", "null"] },

        sourceDiaryIds: { bsonType: "array", items: { bsonType: "objectId" } },

        generatedBy: { enum: ["ai", "system"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.weekly_emotional_insights.createIndex({ userId: 1 });
db.weekly_emotional_insights.createIndex({ userId: 1, weekStartDate: -1 });
db.weekly_emotional_insights.createIndex({ moodTrend: 1 });

// =========================================
// CHAT SESSIONS
// =========================================

db.createCollection("chat_sessions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "title", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        title: { bsonType: "string" },
        overallSentiment: { enum: ["positive", "neutral", "negative"] },
        highestRiskLevel: { enum: ["low", "medium", "high"] },
        isArchived: { bsonType: "bool" },

        messages: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["_id", "sender", "content", "createdAt"],
            properties: {
              _id: { bsonType: "objectId" },
              sender: { enum: ["user", "ai"] },
              content: { bsonType: "string" },
              isSafetyResponse: { bsonType: "bool" },
              createdAt: { bsonType: "date" }
            }
          }
        },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.chat_sessions.createIndex({ userId: 1 });
db.chat_sessions.createIndex({ userId: 1, createdAt: -1 });
db.chat_sessions.createIndex({ "messages._id": 1 });

// =========================================
// AI ANALYSES
// =========================================

db.createCollection("ai_analyses", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "target", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },

        target: {
          bsonType: "object",
          required: ["type", "id"],
          properties: {
            type: { enum: ["chat_message", "diary", "post", "comment"] },
            id: { bsonType: "objectId" }
          }
        },

        sentiment: { enum: ["positive", "neutral", "negative"] },
        emotion: { bsonType: ["string", "null"] },
        riskLevel: { enum: ["low", "medium", "high", null] },
        toxicityLevel: { enum: ["low", "medium", "high", null] },

        safetyTriggered: { bsonType: "bool" },
        safetyType: {
          enum: [
            "self_harm_risk",
            "suicidal_intent",
            "medical_advice_request",
            "medication_request",
            "violence_risk",
            "toxic_content"
          ]
        },

        summary: { bsonType: ["string", "null"] },
        suggestion: { bsonType: ["string", "null"] },
        modelName: { bsonType: ["string", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.ai_analyses.createIndex({ userId: 1 });
db.ai_analyses.createIndex({ "target.type": 1, "target.id": 1 });
db.ai_analyses.createIndex({ riskLevel: 1 });
db.ai_analyses.createIndex({ safetyTriggered: 1 });

// =========================================
// SAFETY EVENTS
// =========================================

db.createCollection("safety_events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "userId",
        "source",
        "riskLevel",
        "safetyType",
        "systemAction",
        "createdAt"
      ],
      properties: {
        userId: { bsonType: "objectId" },

        source: {
          bsonType: "object",
          required: ["type", "id"],
          properties: {
            type: { enum: ["chat_message", "diary", "post", "comment"] },
            id: { bsonType: "objectId" }
          }
        },

        riskLevel: { enum: ["medium", "high"] },

        safetyType:{
 enum:[
   "self_harm_risk",
   "suicidal_intent",
   "medical_advice_request",
   "medication_request",
   "violence_risk",
   "toxic_content",
   null
 ]
        },

        detectedText: { bsonType: ["string", "null"] },

        systemAction: {
          enum: [
            "show_safety_response",
            "block_ai_response",
            "suggest_human_support",
            "notify_admin_review"
          ]
        },

        safetyMessage: { bsonType: ["string", "null"] },
        isResolved: { bsonType: "bool" },
        resolvedBy: { bsonType: ["objectId", "null"] },
        resolvedAt: { bsonType: ["date", "null"] },
        adminNote: { bsonType: ["string", "null"] },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.safety_events.createIndex({ userId: 1 });
db.safety_events.createIndex({ riskLevel: 1 });
db.safety_events.createIndex({ safetyType: 1 });
db.safety_events.createIndex({ isResolved: 1 });
db.safety_events.createIndex({ createdAt: -1 });

// =========================================
// EMOTIONAL TESTS
// =========================================

db.createCollection("emotional_tests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "questions", "resultRules", "createdBy", "createdAt"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },

        questions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["question", "options"],
            properties: {
              question: { bsonType: "string" },
              imageUrl: { bsonType: ["string", "null"] },
              correctAnswer: { bsonType: ["string", "null"] },
              explanation: { bsonType: ["string", "null"] },
              options: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["label", "score"],
                  properties: {
                    label: { bsonType: "string" },
                    score: { bsonType: "int" }
                  }
                }
              }
            }
          }
        },

        resultRules: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["level", "minScore", "maxScore", "suggestion"],
            properties: {
              level: { enum: ["low", "medium", "high"] },
              minScore: { bsonType: "int" },
              maxScore: { bsonType: "int" },
              suggestion: { bsonType: "string" }
            }
          }
        },

        isActive: { bsonType: "bool" },
        createdBy: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.emotional_tests.createIndex({ isActive: 1 });
db.emotional_tests.createIndex({ createdBy: 1 });

// =========================================
// TEST RESULTS
// =========================================

db.createCollection("test_results", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "testId", "answers", "totalScore", "resultLevel", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        testId: { bsonType: "objectId" },

        answers: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["questionIndex", "answer", "score"],
            properties: {
              questionIndex: { bsonType: "int" },
              answer: { bsonType: "string" },
              score: { bsonType: "int" }
            }
          }
        },

        totalScore: { bsonType: "int" },
        resultLevel: { enum: ["low", "medium", "high"] },
        suggestion: { bsonType: ["string", "null"] },
        nextTestDueAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.test_results.createIndex({ userId: 1 });
db.test_results.createIndex({ userId: 1, createdAt: -1 });

// =========================================
// POSTS
// =========================================

db.createCollection("posts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["authorId", "content", "createdAt"],
      properties: {
        authorId: { bsonType: "objectId" },

        content: { bsonType: "string" },

        mediaUrls: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["url", "type"],
            properties: {
              url: { bsonType: "string" },
              type: { enum: ["image", "video"] }
            }
          }
        },

        emotionStatus: {
          enum: ["happy", "sad", "stress", "anxious", "angry", "neutral"]
        },

        hashtags: {
          bsonType: "array",
          items: { bsonType: "string" }
        },

        isAnonymous: { bsonType: "bool" },
        anonymousName: { bsonType: ["string", "null"] },

        visibility: { enum: ["public", "private"] },

        status: {
          enum: ["pending", "approved", "rejected", "hidden", "deleted"]
        },

        statistics: {
  bsonType: "object",
  properties: {
    supportCount: { bsonType: "int" },
    hugCount: { bsonType: "int" },
    encourageCount: { bsonType: "int" },
    thankyouCount: { bsonType: "int" },
    commentCount: { bsonType: "int" },
    reportCount: { bsonType: "int" }
  }
        },

        isFlagged: { bsonType: "bool" },

        toxicityLevel: { enum: ["low", "medium", "high", null] },

        reactions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "type", "createdAt"],
            properties: {
              userId: { bsonType: "objectId" },
              type: { enum: ["support", "hug", "encourage", "thankyou"] },
              createdAt: { bsonType: "date" }
            }
          }
        },

        editedAt: { bsonType: ["date", "null"] },
        approvedAt: { bsonType: ["date", "null"] },
        approvedBy: { bsonType: ["objectId", "null"] },
        rejectedReason: { bsonType: ["string", "null"] },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.posts.createIndex({ authorId: 1 });
db.posts.createIndex({ hashtags: 1 });
db.posts.createIndex({ status: 1 });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ isFlagged: 1 });

// =========================================
// COMMENTS
// =========================================

db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "authorId", "content", "createdAt"],
      properties: {
        postId: { bsonType: "objectId" },
        authorId: { bsonType: "objectId" },
        parentCommentId: { bsonType: ["objectId", "null"] },

        content: { bsonType: "string" },

        isAnonymous: { bsonType: "bool" },
        anonymousName: { bsonType: ["string", "null"] },

        status: { enum: ["active", "hidden", "deleted"] },

        statistics: {
  bsonType: "object",
  properties: {
    supportCount: { bsonType: "int" },
    hugCount: { bsonType: "int" },
    encourageCount: { bsonType: "int" },
    thankyouCount: { bsonType: "int" },
    replyCount: { bsonType: "int" },
    reportCount: { bsonType: "int" }
  }


        },

        toxicityLevel: { enum: ["low", "medium", "high", null] },

        reactions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "type", "createdAt"],
            properties: {
              userId: { bsonType: "objectId" },
              type: { enum: ["support", "hug", "encourage", "thankyou"] },
              createdAt: { bsonType: "date" }
            }
          }
        },

        editedAt: { bsonType: ["date", "null"] },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.comments.createIndex({ postId: 1 });
db.comments.createIndex({ authorId: 1 });
db.comments.createIndex({ parentCommentId: 1 });
db.comments.createIndex({ status: 1 });

// =========================================
// TAGS
// =========================================

db.createCollection("tags", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "createdAt"],
      properties: {
        name: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },
        postCount: { bsonType: "int" },
        status: { enum: ["active", "inactive"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.tags.createIndex({ name: 1 }, { unique: true });
db.tags.createIndex({ status: 1 });

// =========================================
// REPORTS
// =========================================

db.createCollection("reports", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "targetType",
        "targetId",
        "reporterId",
        "reportedUserId",
        "reason",
        "status",
        "createdAt"
      ],
      properties: {
        targetType: { enum: ["post", "comment"] },

        targetId: { bsonType: "objectId" },

        reporterId: { bsonType: "objectId" },

        reportedUserId: { bsonType: "objectId" },

        reason: { bsonType: "string" },

        description: { bsonType: ["string", "null"] },

        status: { enum: ["pending", "dismissed", "action_taken"] },

        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.reports.createIndex({ targetType: 1, targetId: 1 });
db.reports.createIndex({ reporterId: 1 });
db.reports.createIndex({ reportedUserId: 1 });
db.reports.createIndex({ status: 1 });
db.reports.createIndex({ createdAt: -1 });

db.reports.createIndex(
  { targetType: 1, targetId: 1, reporterId: 1 },
  { unique: true }
);

// =========================================
// MODERATION LOGS
// =========================================

db.createCollection("moderation_logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["target", "action", "performedBy", "createdAt"],
      properties: {
        target: {
          bsonType: "object",
          required: ["type", "id"],
          properties: {
            type: { enum: ["post", "comment", "user", "report"] },
            id: { bsonType: "objectId" }
          }
        },

        action: {
          enum: [
            "approve_post",
            "reject_post",
            "hide_content",
            "delete_content",
            "restore_content",
            "warn_user",
            "block_user",
            "resolve_report",
            "reject_report"
          ]
        },

        reason: { bsonType: ["string", "null"] },
        note: { bsonType: ["string", "null"] },
        performedBy: { bsonType: "objectId" },

        previousStatus: { bsonType: ["string", "null"] },
        newStatus: { bsonType: ["string", "null"] },

        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.moderation_logs.createIndex({ "target.type": 1, "target.id": 1 });
db.moderation_logs.createIndex({ performedBy: 1 });
db.moderation_logs.createIndex({ action: 1 });
db.moderation_logs.createIndex({ createdAt: -1 });

// =========================================
// EVENTS - NOSQL EMBEDDED PARTICIPANTS
// =========================================

db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "startDateTime", "createdBy", "createdAt"],
      properties: {
        title: { bsonType: "string" },
        description: { bsonType: ["string", "null"] },
        speakerName: { bsonType: ["string", "null"] },
        organizerName: { bsonType: ["string", "null"] },
        contactEmail: { bsonType: ["string", "null"] },
        bannerImage: { bsonType: ["string", "null"] },

        images: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["url", "type"],
            properties: {
              url: { bsonType: "string" },
              type: { enum: ["image"] }
            }
          }
        },

        eventType: { enum: ["workshop", "talkshow", "webinar", "community_event", null] },
        startDateTime: { bsonType: "date" },
        endDateTime: { bsonType: ["date", "null"] },
        location: { bsonType: ["string", "null"] },
        meetingLink: { bsonType: ["string", "null"] },
        capacity: { bsonType: ["int", "null"] },
        registeredCount: { bsonType: "int" },

        participants: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "status", "registeredAt"],
            properties: {
              userId: { bsonType: "objectId" },
              status: { enum: ["registered", "cancelled", "attended"] },
              registeredAt: { bsonType: "date" },
              cancelledAt: { bsonType: ["date", "null"] }
            }
          }
        },

        status: { enum: ["upcoming", "ongoing", "completed", "cancelled"] },

        approvalStatus: { enum: ["pending", "approved", "rejected", null] },
        approvedBy: { bsonType: ["objectId", "null"] },
        approvedAt: { bsonType: ["date", "null"] },
        rejectedReason: { bsonType: ["string", "null"] },
        lockAfterApproval: { bsonType: "bool" },

        createdBy: { bsonType: "objectId" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.events.createIndex({ status: 1 });
db.events.createIndex({ startDateTime: 1 });
db.events.createIndex({ createdBy: 1 });
db.events.createIndex({ approvalStatus: 1 });
db.events.createIndex({ "participants.userId": 1 });

// =========================================
// NOTIFICATIONS
// =========================================

db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "title", "content", "createdAt"],
      properties: {
        userId: { bsonType: "objectId" },
        type: {
          enum: [
            "event_reminder",
            "mental_insight",
            "safety_alert",
            "report_update",
            "emotional_test_reminder",
            "positive_support_request",
            "system"
          ]
        },
        title: { bsonType: "string" },
        content: { bsonType: "string" },

        related: {
          bsonType: ["object", "null"],
          properties: {
            type: { bsonType: ["string", "null"] },
            id: { bsonType: ["objectId", "null"] }
          }
        },

        isRead: { bsonType: "bool" },
        readAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ userId: 1, isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

print("SOUL MongoDB database initialized successfully.");
