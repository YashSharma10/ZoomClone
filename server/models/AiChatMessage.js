import mongoose from "mongoose";

const AiChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      role: { type: String, required: true }, // 'user' | 'assistant'
      content: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("AiChat", AiChatSchema);
