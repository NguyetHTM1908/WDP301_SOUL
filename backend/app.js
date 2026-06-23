require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./src/config/db");
const emotionAnalysisRoutes = require("./src/routes/emotionAnalysisRoutes");
const authRouter = require("./src/routes/auth");
const diaryRoutes = require("./src/routes/diaryRoutes");
const postRoutes = require("./src/routes/postRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const reactionRoutes = require("./src/routes/reactionRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const adminForumRoutes = require("./src/routes/adminForumRoutes");
// const journalRoutes = require("./src/routes/journalRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const tagRoutes = require("./src/routes/tagRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const app = express();
const emotionalTestRoutes = require("./src/routes/emotionalTestRoutes");

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRouter);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/forum", adminForumRoutes);
app.use("/api/diaries", diaryRoutes);
// app.use("/api/journals", journalRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/emotion-analysis", emotionAnalysisRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/emotional-tests", emotionalTestRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SOUL API Running",
  });
});

module.exports = app;