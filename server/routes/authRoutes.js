import express from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestUpgrade,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

export const authRouter = express.Router();

authRouter.post("/register", authLimiter, registerUser);
authRouter.post("/login", authLimiter, loginUser);
authRouter.post("/logout", requireAuth, logoutUser);
authRouter.get("/me", requireAuth, getCurrentUser);
authRouter.post("/upgrade-request", requireAuth, requestUpgrade);
