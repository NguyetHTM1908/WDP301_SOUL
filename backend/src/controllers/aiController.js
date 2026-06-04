const { askSoulAI } = require("../services/aiService");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await askSoulAI(message);

    return res.json({
      success: true,
      reply: result,
    });
  } catch (error) {
    console.error("AI Controller Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "AI service error",
      error: error.message,
    });
  }
};

module.exports = { chatWithAI };