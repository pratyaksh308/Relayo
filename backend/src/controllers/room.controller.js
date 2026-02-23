import Room from "../models/Room.js";

// Create new room (1-to-1 or group)
export const createRoom = async (req, res) => {
  try {
    const { members, isGroup } = req.body;

    if (!members || members.length < 2) {
      return res.status(400).json({
        message: "At least two members required",
      });
    }

    const room = await Room.create({
      members,
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
      members: userId,
    }).populate("members", "name email");

    res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};