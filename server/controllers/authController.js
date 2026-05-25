import { User } from "../models/User.js";
import { getActiveSessionsCountForUser } from "../services/realtimePresence.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {
  clearAuthCookie,
  generateToken,
  setAuthCookie,
} from "../utils/generateToken.js";
import { validateEmail, validatePassword, validateUsername } from "../utils/sanitize.js";
import { serializeUser } from "../utils/userSerializer.js";

export const registerUser = asyncHandler(async (req, res) => {
  const username = validateUsername(req.body?.username);
  const email = validateEmail(req.body?.email);
  const password = validatePassword(req.body?.password);
  const now = new Date();

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  }).lean();

  if (existingUser) {
    const message =
      existingUser.email === email
        ? "An account with that email already exists."
        : "That username is already taken.";

    throw new ApiError(409, message);
  }

  const user = await User.create({
    username,
    email,
    password,
    lastLoginAt: now,
    lastSeenAt: now,
  });
  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: serializeUser(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const email = validateEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password.");
  }
  const now = new Date();
  user.lastLoginAt = now;
  user.lastSeenAt = now;
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  return res.json({
    success: true,
    message: "Login successful.",
    user: serializeUser(user),
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const activeSessionsCount = getActiveSessionsCountForUser(req.user._id.toString());

  return res.json({
    success: true,
    user: serializeUser(req.user, { activeSessionsCount }),
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  return res.json({
    success: true,
    message: "Logout successful.",
  });
});

export const requestUpgrade = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    throw new ApiError(400, "Admins don't need upgrades.");
  }

  if (user.upgradeStatus === "pending") {
    throw new ApiError(400, "You already have a pending upgrade request.");
  }

  if (user.upgradeStatus === "approved") {
    throw new ApiError(400, "Your account has already been upgraded.");
  }

  user.upgradeStatus = "pending";
  await user.save();

  return res.json({
    success: true,
    message: "Upgrade request submitted successfully.",
    user: serializeUser(user),
  });
});
