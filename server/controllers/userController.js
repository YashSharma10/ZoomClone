import User from "../models/User.js";

// @desc    Get all users (only _id and email)
// @route   GET /api/users
// @access  Protected
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
