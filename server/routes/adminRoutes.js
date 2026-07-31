import express from "express";
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
  getUserDetails,
  upgradeUserRole,
  getAdminAnalytics,
  getAdminSessions,
  getAdminRooms,
  terminateRoom,
  getUpgradeRequests,
  resolveUpgradeRequest,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/users", getAllUsers);
adminRouter.get("/users/:id", getUserDetails);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.put("/users/:id/upgrade", upgradeUserRole);
adminRouter.get("/stats", getAdminStats);
adminRouter.get("/analytics", getAdminAnalytics);
adminRouter.get("/sessions", getAdminSessions);
adminRouter.get("/rooms", getAdminRooms);
adminRouter.delete("/rooms/:roomId", terminateRoom);
adminRouter.get("/upgrades", getUpgradeRequests);
adminRouter.put("/upgrades/:id", resolveUpgradeRequest);
