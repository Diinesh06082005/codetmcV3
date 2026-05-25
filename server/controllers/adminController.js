import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import {
  disconnectUserSockets,
  getActiveRoomsCount,
  getActiveSessionsCountForUser,
  getActiveUserCount,
  getCurrentSessionDurationMs,
  isUserOnline,
} from "../services/realtimePresence.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { validateObjectId } from "../utils/sanitize.js";
import { serializeUser } from "../utils/userSerializer.js";

const buildSessionCountMap = async () => {
  const counts = await Room.aggregate([
    {
      $group: {
        _id: "$createdBy",
        totalSessionsCreated: { $sum: 1 },
      },
    },
  ]);

  return counts.reduce((accumulator, item) => {
    if (item._id) {
      accumulator.set(item._id.toString(), item.totalSessionsCreated);
    }
    return accumulator;
  }, new Map());
};

const getSerializedAdminUser = (user, sessionCountMap) =>
  serializeUser(user, {
    totalSessionsCreated: sessionCountMap.get(user._id.toString()) || 0,
    activeSessionsCount: getActiveSessionsCountForUser(user._id.toString()),
    currentSessionDurationMs: getCurrentSessionDurationMs(user._id.toString()),
    isOnline: isUserOnline(user._id.toString()),
  });

export const getAllUsers = asyncHandler(async (req, res) => {
  const [users, sessionCountMap] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .select("_id username email role createdAt lastLoginAt lastSeenAt lastSessionDurationMs totalSessions totalTimeSpent")
      .lean(),
    buildSessionCountMap(),
  ]);

  return res.json({
    success: true,
    users: users.map((user) => getSerializedAdminUser(user, sessionCountMap)),
  });
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const userId = validateObjectId(req.params.id, "user");

  const [user, sessionCountMap, recentRooms, activeRoomMemberships] = await Promise.all([
    User.findById(userId)
      .select("_id username email role createdAt lastLoginAt lastSeenAt lastSessionDurationMs totalSessions totalTimeSpent")
      .lean(),
    buildSessionCountMap(),
    Room.find({
      $or: [{ createdBy: userId }, { users: userId }],
    })
      .sort({ updatedAt: -1 })
      .limit(6)
      .select("_id roomId createdAt updatedAt createdBy users")
      .lean(),
    Room.countDocuments({ users: userId }),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return res.json({
    success: true,
    user: {
      ...getSerializedAdminUser(user, sessionCountMap),
      activeRoomMemberships,
      recentRooms: recentRooms.map((room) => ({
        id: room._id.toString(),
        roomId: room.roomId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        collaboratorCount: Array.isArray(room.users) ? room.users.length : 0,
        createdByUserId: room.createdBy?.toString?.() || "",
      })),
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = validateObjectId(req.params.id, "user");

  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "You cannot delete your own account from the admin dashboard.");
  }

  const user = await User.findById(userId).select("_id role username email");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount <= 1) {
      throw new ApiError(400, "At least one admin account must remain in the system.");
    }
  }

  disconnectUserSockets(req.app.locals.io, userId, {
    message: "Your account was removed by an administrator.",
  });

  await Promise.all([
    Room.updateMany({ createdBy: userId }, { $set: { createdBy: req.user._id } }),
    Room.updateMany({ users: userId }, { $pull: { users: userId } }),
    User.findByIdAndDelete(userId),
  ]);

  return res.json({
    success: true,
    message: `Deleted ${user.username}.`,
    deletedUserId: userId,
  });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSessionsCreated] = await Promise.all([
    User.countDocuments(),
    Room.countDocuments(),
  ]);

  return res.json({
    success: true,
    stats: {
      totalUsers,
      activeRooms: getActiveRoomsCount(),
      totalSessionsCreated,
      activeUsers: getActiveUserCount(),
      serverStartedAt: req.app.locals.serverStartedAt,
      serverUptimeMs: Math.floor(process.uptime() * 1000),
    },
  });
});

export const upgradeUserRole = asyncHandler(async (req, res) => {
  const userId = validateObjectId(req.params.id, "user");

  if (req.user && req.user._id.toString() === userId) {
    throw new ApiError(400, "You cannot change your own role.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
    throw new ApiError(400, "Cannot change the role of the default system administrator.");
  }

  const newRole = user.role === "admin" ? "user" : "admin";
  user.role = newRole;
  await user.save();

  return res.json({
    success: true,
    message: `User ${user.username} role updated to ${newRole}.`,
    role: newRole,
  });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalRooms, totalSessionsCount, sessions] = await Promise.all([
    User.countDocuments(),
    Room.countDocuments(),
    Session.countDocuments(),
    Session.find().select("duration joinTime").lean(),
  ]);

  const activeUsers = getActiveUserCount();
  const totalDuration = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const avgSessionDuration = totalSessionsCount > 0 ? totalDuration / totalSessionsCount : 0;

  // Daily metrics aggregation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyActiveUsers = await Session.aggregate([
    { $match: { joinTime: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$joinTime" } },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        date: "$_id",
        count: { $size: "$uniqueUsers" },
        _id: 0,
      },
    },
    { $sort: { date: 1 } },
  ]);

  const dailySessions = await Session.aggregate([
    { $match: { joinTime: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$joinTime" } },
        count: { $sum: 1 },
      },
    },
    { $project: { date: "$_id", count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  const dailyRoomJoins = await Room.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: "$totalJoins" },
      },
    },
    { $project: { date: "$_id", count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  return res.json({
    success: true,
    analytics: {
      totalUsers,
      activeUsers,
      totalSessions: totalSessionsCount,
      totalRooms,
      avgSessionDuration,
      dailyActiveUsers,
      dailySessions,
      dailyRoomJoins,
    },
  });
});

export const getAdminSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find()
    .sort({ joinTime: -1 })
    .populate("userId", "username email")
    .populate("roomId", "roomId")
    .limit(100)
    .lean();

  return res.json({
    success: true,
    sessions,
  });
});

export const terminateRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  req.app.locals.io.to(roomId).emit("room-terminated", {
    message: "This room has been terminated by an administrator.",
  });
  req.app.locals.io.in(roomId).socketsLeave(roomId);

  await Room.deleteOne({ _id: room._id });

  return res.json({
    success: true,
    message: "Room terminated successfully.",
  });
});

export const getUpgradeRequests = asyncHandler(async (req, res) => {
  const requests = await User.find({ upgradeStatus: "pending" })
    .select("_id username email createdAt totalSessions totalTimeSpent")
    .lean();

  return res.json({
    success: true,
    requests,
  });
});

export const resolveUpgradeRequest = asyncHandler(async (req, res) => {
  const userId = validateObjectId(req.params.id, "user");
  const { action } = req.body;

  const user = await User.findById(userId);

  if (!user || user.upgradeStatus !== "pending") {
    throw new ApiError(404, "Pending upgrade request not found.");
  }

  if (action === "approve") {
    user.upgradeStatus = "approved";
    user.roomLimit = 100;
  } else {
    user.upgradeStatus = "rejected";
  }

  await user.save();

  return res.json({
    success: true,
    message: `Upgrade request ${action}d.`,
  });
});
