const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});
async function testStuAI() {
  const apiKey = String(
    process.env.AI_MODERATION_API_KEY || ""
  ).trim();

  const baseUrl = String(
    process.env.AI_MODERATION_BASE_URL ||
      "https://aiportalapi.stu-platform.live/use"
  )
    .trim()
    .replace(/\/$/, "");

  const model = String(
    process.env.AI_MODERATION_MODEL ||
      "GPT-5.4-mini"
  ).trim();

  if (!apiKey) {
    throw new Error(
      "Thiếu AI_MODERATION_API_KEY trong .env"
    );
  }

  console.log("STU AI config:", {
    url: `${baseUrl}/responses`,
    model,
    keyPrefix: apiKey.slice(0, 7),
    keySuffix: apiKey.slice(-4),
  });

  const response = await fetch(
    `${baseUrl}/responses`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input:
          'Chỉ trả về JSON hợp lệ: {"status":"ok"}',
      }),
    }
  );

  const responseText = await response.text();

  console.log("HTTP status:", response.status);
  console.log("Response:", responseText);
}

testStuAI().catch((error) => {
  console.error("TEST STU AI ERROR:", error);
  process.exitCode = 1;
});