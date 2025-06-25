import dotenv from "dotenv";
import AiChat from "../models/AiChatMessage.js";

dotenv.config();

export const handleAiChat = async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user?.id;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User ID missing" });
    }

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "ZoomClone AI Chat",
        },
        body: JSON.stringify({
          model: "openai/gpt-4",
          messages,
          max_tokens: 200,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json();
      console.error("OpenRouter API Error:", errorData);
      return res.status(500).json({ error: errorData });
    }

    const data = await openRouterResponse.json();
    const reply = data.choices[0]?.message?.content;

    // ✅ FIX: Include userId here
    await AiChat.create({
      userId,
      messages: [...messages, { role: "assistant", content: reply }],
    });

    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenRouter AI Error:", error.message);
    res.status(500).json({ error: "AI failed to respond." });
  }
};

// GET /api/ai-chat/history
export const getAiChatHistory = async (req, res) => {
  try {
    const chats = await AiChat.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(chats);
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

