import express from "express";
import { createRoom, getMyRooms, createDirectRoom } from "../controllers/room.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Create new room
router.post("/", authMiddleware, createRoom);

// Get my rooms
router.get("/my", authMiddleware, getMyRooms);

router.post("/direct", authMiddleware, createDirectRoom);

export default router;