import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {
  extractBearerToken,
  extractCookieToken,
  verifyToken,
} from "../utils/generateToken.js";

const resolveRequestToken = (req) =>
  extractBearerToken(req.headers.authorization) || extractCookieToken(req.headers.cookie);

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = resolveRequestToken(req);

  if (!token) {
    throw new ApiError(401, "Not authorized. Please sign in to continue.");
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId).select(
    "_id username email role createdAt lastLoginAt lastSeenAt lastSessionDurationMs"
  );

  if (!user) {
    throw new ApiError(401, "Not authorized. User no longer exists.");
  }

  req.user = user;
  return next();
});

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized. Please sign in to continue.");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Admin access is required for this resource.");
  }

  return next();
};

export const authMiddleware = requireAuth;
