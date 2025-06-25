import express from "express";
import User from "../models/User.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, async (req, res) => {
  const users = await User.find().select("_id email");
  res.json(users);
});
export default router;