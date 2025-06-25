import express from "express";
import { getPrivateMessages } from "../controllers/chatController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:userId", protect, getPrivateMessages);
export default router;