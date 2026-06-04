const API_URL = "http://localhost:5000/api/ai/chat";
// ví dụ: http://192.168.1.5:8000/chat

export async function sendMessageToAI(message: string) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("AI API error");
  }

  const data = await res.json();
  return data.reply;
}