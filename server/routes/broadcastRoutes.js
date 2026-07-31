import express from "express";
import { createBroadcast, getBroadcasts } from "../controllers/broadcastController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getBroadcasts);
router.post("/", createBroadcast);

export default router;
