import Room from "../models/Room.js";

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
      .populate("participants", "name email")
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
