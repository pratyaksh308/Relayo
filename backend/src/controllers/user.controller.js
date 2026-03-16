import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        message: "Username query is required",
      });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("name username avatar");

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};