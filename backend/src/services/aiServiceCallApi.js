const axios = require("axios");

const AI_SERVER_URL =
  process.env.AI_SERVER_URL ||
  "https://eds-programmers-senator-knife.trycloudflare.com/chat";

const askSoulAI = async (message) => {
  try {
    const response = await axios.post(
      AI_SERVER_URL,
      { message },
      {
        timeout: 120000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Soul AI Service Error:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Message:", error.message);
    }

    return {
      reply:
        "Mình đang gặp lỗi kỹ thuật nên phản hồi chưa ổn định. Bạn có thể nói ngắn lại điều đang làm bạn khó chịu nhất lúc này không?",
      sentiment: "neutral",
      emotion: "neutral",
      riskLevel: "unknown",
      safetyWarning: false,
    };
  }
};

module.exports = { askSoulAI };