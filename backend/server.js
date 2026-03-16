import http from "http";
import { Server } from "socket.io";
import { setIO } from "./src/socket.js";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
  },
});

setIO(io);

// Basic connection test
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`📥 Socket ${socket.id} joined room ${roomId}`);
  });

  // Typing indicators
  socket.on("typing", ({ roomId, userId, userName }) => {
    socket.to(roomId).emit("typing", { roomId, userId, userName });
  });

  socket.on("stopTyping", ({ roomId, userId }) => {
    socket.to(roomId).emit("stopTyping", { roomId, userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});