import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { getIO } from "../socket.js";

 // Send message
export const sendMessage = async (req, res) => {
  try {
    const { roomId, text } = req.body;
    const senderId = req.user.id;

    if (!roomId || !text) {
      return res.status(400).json({ message: "roomId and text required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.participants.includes(senderId)) {
      return res.status(403).json({
        message: "You are not a participant of this room"
      });
    }

    let message = await Message.create({
      room: roomId,
      sender: senderId,
      text,
    });

    // Populate the sender so the frontend socket listener has full user details
    message = await message.populate("sender", "name username email avatar");

    // update room's lastMessage pointer so list preview works
    await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

    const io = getIO();
    io.to(roomId).emit("newMessage", message);

    res.status(201).json({
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 // Get messages by room
export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ room: roomId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};