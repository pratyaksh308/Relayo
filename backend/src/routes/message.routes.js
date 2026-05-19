import express from "express";
import {
  sendMessage,
  getMessagesByRoom,
  upload,
  sendFileMessage,
} from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.post("/file", authMiddleware, upload.single("file"), sendFileMessage);
router.get("/:roomId", authMiddleware, getMessagesByRoom);

export default router;