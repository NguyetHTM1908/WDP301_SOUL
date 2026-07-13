require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require(
  "cookie-parser"
);

const connectDB = require(
  "./src/config/db"
);

const authRouter = require(
  "./src/routes/auth"
);

const diaryRoutes = require(
  "./src/routes/diaryRoutes"
);

const postRoutes = require(
  "./src/routes/postRoutes"
);

const commentRoutes = require(
  "./src/routes/commentRoutes"
);

const reactionRoutes = require(
  "./src/routes/reactionRoutes"
);

const reportRoutes = require(
  "./src/routes/reportRoutes"
);

const adminForumRoutes = require(
  "./src/routes/adminForumRoutes"
);

const eventRoutes = require(
  "./src/routes/eventRoutes"
);

const tagRoutes = require(
  "./src/routes/tagRoutes"
);

const adminRoutes = require(
  "./src/routes/adminRoutes"
);

const usersRouter = require(
  "./src/routes/users"
);

const emotionalTestRoutes = require(
  "./src/routes/emotionalTestRoutes"
);

const emotionAnalysisRoutes = require(
  "./src/routes/emotionAnalysisRoutes"
);

const aiRoutes = require(
  "./src/routes/aiRoutes"
);

const app = express();

connectDB();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

app.use(cookieParser());

app.use(morgan("dev"));

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "SOUL API Running",
  });
});

app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/posts",
  postRoutes
);

app.use(
  "/api/comments",
  commentRoutes
);

app.use(
  "/api/reactions",
  reactionRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/admin/forum",
  adminForumRoutes
);

app.use(
  "/api/diaries",
  diaryRoutes
);

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/tags",
  tagRoutes
);

app.use(
  "/api/emotion-analysis",
  emotionAnalysisRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/emotional-tests",
  emotionalTestRoutes
);

app.use(
  "/api/users",
  usersRouter
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      `Không tìm thấy API: ` +
      `${req.method} ${req.originalUrl}`,
  });
});

app.use(
  (error, req, res, next) => {
    console.error(
      "[GLOBAL SERVER ERROR]",
      error
    );

    return res
      .status(error.status || 500)
      .json({
        success: false,
        message:
          error.message ||
          "Đã xảy ra lỗi máy chủ.",
      });
  }
);

module.exports = app;