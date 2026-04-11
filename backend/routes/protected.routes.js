import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/protected.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

export default router;
