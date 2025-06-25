import express from "express";
import { handleAiChat, getAiChatHistory } from "../controllers/aiChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/ai-chat
router.post("/",protect, handleAiChat);
router.get("/history", protect, getAiChatHistory);

export default router;
