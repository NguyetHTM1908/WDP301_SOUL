require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");

// Load models
const User = require("../models/User");
const Diary = require("../models/Diary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Event = require("../models/Event");
const ChatSession = require("../models/ChatSession");
const AIAnalysis = require("../models/AIAnalysis");
const SafetyEvent = require("../models/SafetyEvent");
const EmotionalTest = require("../models/EmotionalTest");
const TestResult = require("../models/TestResult");
const Tag = require("../models/Tag");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const ModerationLog = require("../models/ModerationLog");

const runTest = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB successfully for test.\n");

    // 1. Verify User Model
    const usersCount = await User.countDocuments();
    console.log(`[PASS] User Model - Found ${usersCount} users in database.`);
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log(`       - Admin found: ${admin.fullName} (${admin.email})`);
    }

    // 2. Verify Diary Model
    const diariesCount = await Diary.countDocuments();
    console.log(`[PASS] Diary Model - Found ${diariesCount} diaries in database.`);

    // 3. Verify Post Model
    const postsCount = await Post.countDocuments();
    console.log(`[PASS] Post Model - Found ${postsCount} posts in database.`);
    const samplePost = await Post.findOne().populate("authorId");
    if (samplePost) {
      console.log(`       - Sample Post content: "${samplePost.content}"`);
      console.log(`       - Author (populated): ${samplePost.authorId ? samplePost.authorId.fullName : "None"}`);
    }

    // 4. Verify Comment Model
    const commentsCount = await Comment.countDocuments();
    console.log(`[PASS] Comment Model - Found ${commentsCount} comments in database.`);

    // 5. Verify Event Model
    const eventsCount = await Event.countDocuments();
    console.log(`[PASS] Event Model - Found ${eventsCount} events in database.`);

    // 6. Verify ChatSession Model
    const chatSessionsCount = await ChatSession.countDocuments();
    console.log(`[PASS] ChatSession Model - Found ${chatSessionsCount} chat sessions.`);

    // 7. Verify AIAnalysis Model
    const aiAnalysesCount = await AIAnalysis.countDocuments();
    console.log(`[PASS] AIAnalysis Model - Found ${aiAnalysesCount} analyses.`);

    // 8. Verify SafetyEvent Model
    const safetyEventsCount = await SafetyEvent.countDocuments();
    console.log(`[PASS] SafetyEvent Model - Found ${safetyEventsCount} safety events.`);

    // 9. Verify EmotionalTest Model
    const emotionalTestsCount = await EmotionalTest.countDocuments();
    console.log(`[PASS] EmotionalTest Model - Found ${emotionalTestsCount} tests.`);

    // 10. Verify TestResult Model
    const testResultsCount = await TestResult.countDocuments();
    console.log(`[PASS] TestResult Model - Found ${testResultsCount} test results.`);

    // 11. Verify Tag Model
    const tagsCount = await Tag.countDocuments();
    console.log(`[PASS] Tag Model - Found ${tagsCount} tags.`);

    // 12. Verify Report Model
    const reportsCount = await Report.countDocuments();
    console.log(`[PASS] Report Model - Found ${reportsCount} reports.`);

    // 13. Verify Notification Model
    const notificationsCount = await Notification.countDocuments();
    console.log(`[PASS] Notification Model - Found ${notificationsCount} notifications.`);

    // 14. Verify ModerationLog Model
    const moderationLogsCount = await ModerationLog.countDocuments();
    console.log(`[PASS] ModerationLog Model - Found ${moderationLogsCount} moderation logs.`);

    console.log("\n>>> ALL MONGOOSE MODELS HAVE COMPLETED VERIFICATION SUCCESSFULLY! <<<");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

runTest();
