import express from "express";
import { searchUsers } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);

export default router;