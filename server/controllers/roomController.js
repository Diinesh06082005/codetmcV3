import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {
  createRoomId,
  defaultStarterCode,
  sanitizeCode,
  sanitizeRoomId,
  validateRoomId,
} from "../utils/sanitize.js";

const MAX_ROOM_USERS = 100;

const roomPopulation = [
  { path: "users", select: "_id username email createdAt" },
  { path: "createdBy", select: "_id username email createdAt" },
];

const serializeUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
});

const serializeRoom = (room) => ({
  id: room._id.toString(),
  roomId: room.roomId,
  code: typeof room.code === "string" ? room.code : defaultStarterCode,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
  createdBy: room.createdBy ? serializeUser(room.createdBy) : null,
  users: Array.isArray(room.users) ? room.users.map(serializeUser) : [],
});

const generateUniqueRoomId = async () => {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = createRoomId();
    const roomExists = await Room.exists({ roomId: candidate });

    if (!roomExists) {
      return candidate;
    }
  }

  throw new ApiError(500, "Unable to create a room right now. Please try again.");
};

export const createRoom = asyncHandler(async (req, res) => {
  if (req.body?.roomId !== undefined && !sanitizeRoomId(req.body.roomId)) {
    throw new ApiError(400, "A valid custom room ID is required.");
  }

  const requestedRoomId = sanitizeRoomId(req.body?.roomId);
  const roomId = requestedRoomId || (await generateUniqueRoomId());

  if (requestedRoomId) {
    const existingRoom = await Room.exists({ roomId });

    if (existingRoom) {
      throw new ApiError(409, "That room ID is already in use.");
    }
  }

  const user = await User.findById(req.user._id);

  if (user.role !== "admin") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.roomsCreatedToday.date || user.roomsCreatedToday.date.getTime() !== today.getTime()) {
      user.roomsCreatedToday.date = today;
      user.roomsCreatedToday.count = 0;
    }

    if (user.roomsCreatedToday.count >= user.roomLimit) {
      throw new ApiError(403, `Daily room creation limit (${user.roomLimit}) reached. Please request an upgrade.`);
    }

    user.roomsCreatedToday.count += 1;
    await user.save();
  }

  const room = await Room.create({
    roomId,
    users: [req.user._id],
    code: sanitizeCode(req.body?.code) || defaultStarterCode,
    createdBy: req.user._id,
  });

  await room.populate(roomPopulation);

  return res.status(201).json({
    success: true,
    room: serializeRoom(room),
  });
});

export const getRecentRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const recentRooms = await Room.find({
    $or: [{ createdBy: userId }, { users: userId }],
  })
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate(roomPopulation)
    .lean();

  return res.json({
    success: true,
    rooms: recentRooms.map(serializeRoom),
  });
});

export const getRoom = asyncHandler(async (req, res) => {
  const roomId = validateRoomId(req.params.roomId);
  const room = await Room.findOne({ roomId }).populate(roomPopulation);

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  return res.json({
    success: true,
    room: serializeRoom(room),
  });
});

export const joinRoom = asyncHandler(async (req, res) => {
  const roomId = validateRoomId(req.params.roomId);
  const room = await Room.findOne({ roomId }).populate(roomPopulation);

  if (!room) {
    throw new ApiError(404, "Room not found.");
  }

  const alreadyJoined = room.users.some(
    (user) => user._id.toString() === req.user._id.toString()
  );

  if (!alreadyJoined && room.users.length >= MAX_ROOM_USERS) {
    throw new ApiError(403, "This room is full.");
  }

  if (!alreadyJoined) {
    room.users.push(req.user._id);
    await room.save();
    await room.populate(roomPopulation);
  }

  return res.json({
    success: true,
    room: serializeRoom(room),
  });
});

