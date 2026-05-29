import express from "express";
import { createRoom, getRoom, joinRoom, getRecentRooms } from "../controllers/roomController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const roomRouter = express.Router();

roomRouter.use(requireAuth);

roomRouter.post("/", createRoom);
roomRouter.get("/recent", getRecentRooms);
roomRouter.get("/:roomId", getRoom);
roomRouter.post("/:roomId/join", joinRoom);

