import Room from "../models/Room.js";
import User from "../models/User.js";

// Create new room (1-to-1 or group)
export const createRoom = async (req, res) => {
  try {
    const { members, participants, isGroup, name } = req.body;
    const roomParticipants = Array.isArray(participants) ? participants : members;

    if (!roomParticipants || roomParticipants.length < 2) {
      return res.status(400).json({
        message: "At least two members required",
      });
    }

    const room = await Room.create({
      name: name || "",
      participants: roomParticipants,
      isGroup: isGroup || false,
    });

    res.status(201).json({
      message: "Room created",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get rooms of logged-in user
export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await Room.find({
      participants: userId,
    })
      .populate("participants", "name email username avatar")
      // include lastMessage document so frontend can render a preview
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const createDirectRoom = async (req, res) => {
  try {
    const { email } = req.body;
    const currentUserId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // Find target user
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser._id.toString() === currentUserId) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    // First try to find an existing direct room
    let room = await Room.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, targetUser._id], $size: 2 }
    });

    let statusCode = 200;
    
    // If it doesn't exist, create it
    if (!room) {
      room = await Room.create({
        isGroup: false,
        participants: [currentUserId, targetUser._id],
      });
      statusCode = 201;
    }

    // Populate data to return
    room = await Room.findById(room._id)
      .populate("participants", "name email username avatar")
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.status(statusCode).json(room);
  } catch (error) {
    console.error("Create direct room error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createDirectRoomByUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const currentUserId = req.user.id;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const targetUser = await User.findOne({ username });

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (targetUser._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot start a chat with yourself",
      });
    }

    // First try to find an existing direct room
    let room = await Room.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, targetUser._id], $size: 2 }
    });

    let statusCode = 200;
    
    // If it doesn't exist, create it
    if (!room) {
      room = await Room.create({
        isGroup: false,
        participants: [currentUserId, targetUser._id],
      });
      statusCode = 201;
    }

    // Populate data to return
    room = await Room.findById(room._id)
      .populate("participants", "name email username avatar")
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "name" },
      });

    res.status(statusCode).json(room);
  } catch (error) {
    console.error("Create direct room error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};