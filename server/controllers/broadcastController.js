import { Broadcast } from "../models/Broadcast.js";
import { Room } from "../models/Room.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const getBroadcasts = asyncHandler(async (req, res) => {
  const { roomId } = req.query;
  const userId = req.user._id;
  const isUserAdmin = req.user.role === "admin";

  const query = {
    $or: [{ targetType: "global" }],
  };

  if (roomId) {
    query.$or.push({ roomId });
  } else if (!isUserAdmin) {
    // Find rooms user belongs to
    const userRooms = await Room.find({ users: userId }).select("roomId");
    const userRoomIds = userRooms.map((r) => r.roomId);
    if (userRoomIds.length > 0) {
      query.$or.push({ roomId: { $in: userRoomIds } });
    }
  } else {
    // Admin sees all room broadcasts too
    query.$or.push({ targetType: "room" });
  }

  const broadcasts = await Broadcast.find(query)
    .sort({ createdAt: -1 })
    .limit(40);

  return res.status(200).json({
    success: true,
    broadcasts,
  });
});

export const createBroadcast = asyncHandler(async (req, res) => {
  const { title, message, priority = "info", targetType = "global", roomId } = req.body;
  const user = req.user;
  const userId = user._id || user.id;

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "Broadcast message text is required.");
  }

  let senderRole = "team_lead";
  if (user.role === "admin") {
    senderRole = "admin";
  } else {
    if (targetType === "global") {
      throw new ApiError(403, "Only System Admins can post global platform broadcasts.");
    }

    if (!roomId) {
      throw new ApiError(400, "Room ID is required for team broadcasts.");
    }

    const room = await Room.findOne({ roomId });
    if (!room || room.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "Only the Team Leader of this room can send team broadcasts.");
    }
  }

  const broadcast = await Broadcast.create({
    sender: userId,
    senderName: user.username,
    role: senderRole,
    targetType: targetType === "global" ? "global" : "room",
    roomId: targetType === "room" ? roomId : null,
    title: title?.trim() || (senderRole === "admin" ? "Admin Alert" : "Team Lead Announcement"),
    message: message.trim(),
    priority,
  });

  return res.status(201).json({
    success: true,
    broadcast,
  });
});
