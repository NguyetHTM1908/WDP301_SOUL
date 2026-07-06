const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createChatSession,
  getChatSessions,
  getChatMessages,
  sendMessageToSession,
  deleteChatSession,
} = require("../controllers/aiController");

router.post("/sessions", auth, createChatSession);

router.get("/sessions", auth, getChatSessions);

router.get("/sessions/:sessionId/messages", auth, getChatMessages);

router.post("/sessions/:sessionId/messages", auth, sendMessageToSession);

router.delete("/sessions/:sessionId", auth, deleteChatSession);

module.exports = router;