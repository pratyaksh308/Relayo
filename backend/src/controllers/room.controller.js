import Room from "../models/Room.js";
import User from "../models/User.js";

// Create new room (1-to-1 or group)
export const createRoom = async (req, res) => {
  try {
    const { members, participants, isGroup, name, email, participantEmail } = req.body;
    const requesterId = String(req.user.id);
    const requestedEmail = (participantEmail || email || "").trim().toLowerCase();
    const providedParticipants = Array.isArray(participants) ? participants : members;
    let roomParticipants = [];

    if (Array.isArray(providedParticipants) && providedParticipants.length > 0) {
      const unique = new Set(
        providedParticipants
          .map((id) => String(id).trim())
          .filter(Boolean)
      );
      unique.add(requesterId);
      roomParticipants = Array.from(unique);
    } else if (requestedEmail) {
      const targetUser = await User.findOne({ email: requestedEmail }).select("_id");

      if (!targetUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (String(targetUser._id) === requesterId) {
        return res.status(400).json({
          message: "Cannot create chat with yourself",
        });
      }

      // Reuse existing 1:1 room if one already exists for these participants
      const existingRoom = await Room.findOne({
        isGroup: false,
        participants: {
          $all: [requesterId, targetUser._id],
          $size: 2,
        },
      });

      if (existingRoom) {
        return res.status(200).json({
          message: "Room already exists",
          room: existingRoom,
        });
      }

      roomParticipants = [requesterId, String(targetUser._id)];
    }

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
