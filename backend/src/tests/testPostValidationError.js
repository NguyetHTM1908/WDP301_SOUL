require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Post = require("../models/Post");

const test = async () => {
  await connectDB();
  try {
    const postFields = {
      authorId: new mongoose.Types.ObjectId(),
      content: "test content",
      mediaUrls: [],
      emotionStatus: "stress",
      hashtags: [],
      isAnonymous: false,
      anonymousName: null,
      visibility: "public",
      status: "approved",
      isFlagged: false,
      toxicityLevel: "low"
    };
    await Post.create(postFields);
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
    if (error.errInfo) {
      console.error("ErrInfo:", JSON.stringify(error.errInfo, null, 2));
    }
  }
  process.exit(0);
};

test();
