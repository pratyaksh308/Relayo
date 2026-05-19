import Message from "../models/Message.js";
import Room from "../models/Room.js";
import { getIO } from "../socket.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

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

    const isParticipant = room.participants.some(p => p.toString() === String(senderId));
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
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

    const isParticipant = room.participants.some(p => p.toString() === String(userId));
    if (!isParticipant) {
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

// Send file message
export const sendFileMessage = async (req, res) => {
  try {
    const { roomId } = req.body;
    const senderId = req.user.id;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isParticipant = room.participants.some((p) => p.toString() === String(senderId));
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    let message = await Message.create({
      room: roomId,
      sender: senderId,
      messageType: "file",
      fileUrl,
      fileName,
      fileType,
      fileSize,
    });

    message = await message.populate("sender", "name username email avatar");

    await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

    const io = getIO();
    io.to(roomId).emit("newMessage", message);

    res.status(201).json({
      message: "File sent",
      data: message,
    });
  } catch (error) {
    console.error("Send file error:", error);
    if (error.message === "Invalid file type") {
      return res.status(400).json({ message: "Invalid file type" });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }
    res.status(500).json({ message: "Server error" });
  }
};