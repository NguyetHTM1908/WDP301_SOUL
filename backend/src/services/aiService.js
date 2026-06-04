const axios = require("axios");

const askSoulAI = async (message) => {
  const response = await axios.post(
    "http://localhost:8001/chat",
    { message },
    { timeout: 120000 }
  );

  return response.data.reply;
};

module.exports = { askSoulAI };