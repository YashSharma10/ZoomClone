import Message from "../models/Message.js";

export const getPrivateMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender", "email")
      .populate("receiver", "email");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chat history" });
  }
};