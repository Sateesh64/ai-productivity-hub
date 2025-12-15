// backend/src/routes/aiRoutes.js
const express = require("express");

const router = express.Router();

// Demo AI – no external API, only for practice
router.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Simple fake AI reply (demo mode)
  const reply =
    `🤖 Demo AI Response:\n\n` +
    `You said: "${prompt}".\n\n` +
    `Right now this project is running in *demo mode*, ` +
    `so I'm not calling any real AI API (OpenAI/DeepSeek). ` +
    `But the full MERN flow is working: React → Express → Route → Response.\n\n` +
    `Later, you can easily plug in a real AI API here using the same route.`;

  return res.json({ reply });
});

module.exports = router;
