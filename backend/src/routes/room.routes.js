import express from "express";
import { createRoom, getMyRooms } from "../controllers/room.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Create new room
router.post("/", authMiddleware, createRoom);

// Get my rooms
router.get("/my", authMiddleware, getMyRooms);

export default router;