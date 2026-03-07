import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    createRoom,
    getMyRooms,
    createDirectRoom,
    createDirectRoomByUsername,
} from "../controllers/room.controller.js";

const router = express.Router();

router.get("/my", authMiddleware, getMyRooms);

router.post("/", authMiddleware, createRoom);

router.post("/direct", authMiddleware, createDirectRoom);

router.post(
    "/direct-by-username",
    authMiddleware,
    createDirectRoomByUsername
);

export default router;