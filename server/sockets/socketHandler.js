import { Room } from "../models/Room.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import {
  addActiveRoomUser,
  clearSocketRoomState,
  getActiveUsers,
  getAllUsersIncludingSpectators,
  getSocketRoomState,
  removeActiveRoomUser,
  setSocketRoomState,
  trackSocketConnection,
  trackSocketDisconnection,
} from "../services/realtimePresence.js";
import {
  extractBearerToken,
  extractCookieToken,
  verifyToken,
} from "../utils/generateToken.js";
import {
  defaultStarterCode,
  sanitizeChatMessage,
  sanitizeCode,
  sanitizeLanguage,
  sanitizeRoomId,
} from "../utils/sanitize.js";
import { serializeUser } from "../utils/userSerializer.js";

const roomSaveTimers = new Map();
const socketRateState = new Map();

const resolveRoomCode = (room) =>
  typeof room?.code === "string" ? room.code : defaultStarterCode;

const extractSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.startsWith("Bearer ")
      ? extractBearerToken(authToken)
      : authToken.trim();
  }

  return (
    extractBearerToken(socket.handshake.headers?.authorization) ||
    extractCookieToken(socket.handshake.headers?.cookie)
  );
};

const scheduleRoomSave = (roomId, code) => {
  if (!roomId) {
    return;
  }

  const existingTimer = roomSaveTimers.get(roomId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(async () => {
    try {
      await Room.findOneAndUpdate(
        { roomId },
        { code: sanitizeCode(code) },
        { new: true }
      );
    } catch (error) {
      console.error(`Failed to persist code for room ${roomId}:`, error.message);
    } finally {
      roomSaveTimers.delete(roomId);
    }
  }, 350);

  roomSaveTimers.set(roomId, timer);
};

const emitRoomUsers = (io, roomId) => {
  io.to(roomId).emit("room-users", getActiveUsers(roomId));
};

const removeSocketFromRoom = async (io, socket) => {
  const state = getSocketRoomState(socket.id);

  if (!state) {
    return;
  }

  const { roomId, sessionId, joinTime } = state;
  const user = serializeUser(socket.user);

  removeActiveRoomUser(roomId, socket.id);
  clearSocketRoomState(socket.id);
  socket.leave(roomId);

  if (getActiveUsers(roomId).length > 0) {
    emitRoomUsers(io, roomId);
  }

  if (!state.isSpectator) {
    socket.to(roomId).emit("user-left", {
      roomId,
      user,
      message: `${user.username} left the room`,
    });
  }

  if (sessionId) {
    const leaveTime = new Date();
    const durationMs = leaveTime - new Date(joinTime);
    try {
      await Session.findByIdAndUpdate(sessionId, { leaveTime, duration: durationMs });
      await User.updateOne({ _id: user.id }, { $inc: { totalTimeSpent: durationMs } });
    } catch (err) {
      console.error("Error updating session on leave:", err.message);
    }
  }
};

const withinSocketRateLimit = (socket, maxEvents, windowMs = 10_000) => {
  const now = Date.now();
  const existing = socketRateState.get(socket.id);

  if (!existing || existing.resetAt <= now) {
    socketRateState.set(socket.id, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (existing.count >= maxEvents) {
    return false;
  }

  existing.count += 1;
  socketRateState.set(socket.id, existing);
  return true;
};

export const authorizeSocketConnection = async (socket, next) => {
  try {
    const token = extractSocketToken(socket);

    if (!token) {
      const error = new Error("Authentication required.");
      error.data = { message: "Please sign in before connecting to rooms." };
      return next(error);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select(
      "_id username email role createdAt lastLoginAt lastSeenAt lastSessionDurationMs"
    );

    if (!user) {
      const error = new Error("Authentication failed.");
      error.data = { message: "Your session is no longer valid. Please log in again." };
      return next(error);
    }

    socket.user = serializeUser(user);
    trackSocketConnection(socket.id, socket.user.id);
    await User.findByIdAndUpdate(socket.user.id, { lastSeenAt: new Date() });
    return next();
  } catch (error) {
    const authError = new Error("Authentication failed.");
    authError.data = { message: "Your session expired. Please log in again." };
    return next(authError);
  }
};

export const registerSocketHandlers = (io, socket, options = {}) => {
  const maxEvents = Number(options.socketRateLimitMaxEvents || 80);

  socket.on("join-room", async (payload = {}, callback = () => {}) => {
    if (!withinSocketRateLimit(socket, maxEvents)) {
      callback({ success: false, message: "Too many socket events. Try again soon." });
      return;
    }

    const roomId = sanitizeRoomId(payload.roomId);
    const language = sanitizeLanguage(payload.language) || "javascript";

    if (!roomId) {
      callback({ success: false, message: "A valid room ID is required." });
      return;
    }

    try {
      await removeSocketFromRoom(io, socket);

      const room = await Room.findOne({ roomId }).populate("users", "_id username email");

      if (!room) {
        callback({ success: false, message: "Room not found." });
        return;
      }

      const isExistingMember = room.users.some(
        (user) => user._id.toString() === socket.user.id
      );
      const isAdmin = socket.user.role === "admin";

      if (!isExistingMember && !isAdmin) {
        callback({ success: false, message: "You are not authorized to join this room." });
        return;
      }

      const isSpectator = payload.isSpectator === true && isAdmin;
      const peerId = payload.peerId || null;

      await socket.join(roomId);
      addActiveRoomUser(roomId, socket.id, socket.user, { 
        peerId, 
        isSpectator, 
        mediaPermissions: { audio: true, video: true },
        mediaState: { audio: true, video: true }
      });
      
      const joinTime = new Date();
      let sessionId = null;
      try {
        await Room.updateOne({ roomId }, { $inc: { totalJoins: 1 } });
        await User.updateOne({ _id: socket.user.id }, { $inc: { totalSessions: 1 } });
        const newSession = await Session.create({
          userId: socket.user.id,
          roomId: room._id,
          joinTime
        });
        sessionId = newSession._id;
      } catch (err) {
        console.error("Session creation error:", err.message);
      }

      setSocketRoomState(socket.id, { roomId, language, sessionId, joinTime, isSpectator, isTeamLeader: room.createdBy.toString() === socket.user.id });

      // Emit room users only to normal members, or to the spectator joining directly
      emitRoomUsers(io, roomId);

      if (!isSpectator) {
        socket.to(roomId).emit("user-joined", {
          roomId,
          user: socket.user,
          peerId,
          message: `${socket.user.username} joined the room`,
        });
      }

      callback({
        success: true,
        roomId,
        code: resolveRoomCode(room),
        language,
        activeUsers: getActiveUsers(roomId),
        isTeamLeader: room.createdBy.toString() === socket.user.id,
      });
    } catch (error) {
      console.error("join-room error:", error.message);
      callback({ success: false, message: "Unable to join the room right now." });
    }
  });

  socket.on("leave-room", async (payload = {}, callback = () => {}) => {
    try {
      const roomId = sanitizeRoomId(payload.roomId || getSocketRoomState(socket.id)?.roomId);

      if (!roomId) {
        callback({ success: false, message: "Invalid room." });
        return;
      }

      await removeSocketFromRoom(io, socket);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: "Unable to leave the room." });
    }
  });

  socket.on("code-change", async (payload = {}, callback = () => {}) => {
    if (!withinSocketRateLimit(socket, maxEvents)) {
      callback({ success: false, message: "Too many code events. Slow down a bit." });
      return;
    }

    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);
    const hasCodeValue = typeof payload.code === "string";
    const code = sanitizeCode(payload.code);
    const language = sanitizeLanguage(payload.language || state?.language) || "javascript";

    if (!state || !roomId || !hasCodeValue) {
      callback({ success: false, message: "Invalid code sync payload." });
      return;
    }

    setSocketRoomState(socket.id, {
      ...state,
      language,
    });

    socket.to(roomId).emit("code-change", {
      code,
      language,
      updatedBy: socket.user.username,
    });

    scheduleRoomSave(roomId, code);
    callback({ success: true });
  });

  socket.on("chat-message", (payload = {}, callback = () => {}) => {
    if (!withinSocketRateLimit(socket, maxEvents)) {
      callback({ success: false, message: "Too many chat events. Try again in a moment." });
      return;
    }

    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);
    const message = sanitizeChatMessage(payload.message);

    if (!state || !roomId || !message) {
      callback({ success: false, message: "Invalid chat message." });
      return;
    }

    io.to(roomId).emit("chat-message", {
      id: `${socket.id}-${Date.now()}`,
      user: socket.user,
      username: socket.user.username,
      message,
      sentAt: new Date().toISOString(),
    });

    callback({ success: true });
  });

  socket.on("typing", (payload = {}) => {
    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);

    if (!state || !roomId) {
      return;
    }

    socket.to(roomId).emit("typing", {
      user: socket.user,
      username: socket.user.username,
      isTyping: Boolean(payload.isTyping),
    });
  });

  socket.on("sync-code", async (payload = {}, callback = () => {}) => {
    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);

    if (!roomId) {
      callback({ success: false, message: "Invalid room." });
      return;
    }

    try {
      const room = await Room.findOne({ roomId });

      if (!room) {
        callback({ success: false, message: "Room not found." });
        return;
      }

      socket.emit("sync-code", {
        code: resolveRoomCode(room),
        language: state?.language || "javascript",
      });

      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: "Failed to resync code." });
    }
  });

  socket.on("disconnect", async () => {
    await removeSocketFromRoom(io, socket);
    socketRateState.delete(socket.id);
    const { userId, isUserStillActive, sessionDurationMs } = trackSocketDisconnection(socket.id);

    if (!userId) {
      return;
    }

    await User.findByIdAndUpdate(userId, {
      lastSeenAt: new Date(),
      ...(isUserStillActive ? {} : { lastSessionDurationMs: sessionDurationMs }),
    }).catch((error) => {
      console.error("disconnect tracking error:", error.message);
    });
  });

  socket.on("media-permission-change", (payload = {}, callback = () => {}) => {
    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);
    
    if (!state || !roomId || !state.isTeamLeader) {
      callback({ success: false, message: "Only the team leader can change permissions." });
      return;
    }

    const { targetUserId, permissions } = payload;
    
    const allUsers = getAllUsersIncludingSpectators(roomId);
    const targetUser = allUsers.find(u => u.id === targetUserId);
    
    if (!targetUser) {
      callback({ success: false, message: "User not found in room." });
      return;
    }

    targetUser.mediaPermissions = { ...targetUser.mediaPermissions, ...permissions };
    
    io.to(roomId).emit("media-permission-updated", {
      targetUserId,
      permissions: targetUser.mediaPermissions
    });

    callback({ success: true });
  });

  socket.on("toggle-media", (payload = {}) => {
    const state = getSocketRoomState(socket.id);
    const roomId = sanitizeRoomId(payload.roomId || state?.roomId);
    
    if (!state || !roomId || state.isSpectator) {
      return;
    }

    const { mediaState } = payload; // { audio: boolean, video: boolean }
    
    const allUsers = getAllUsersIncludingSpectators(roomId);
    const currentUser = allUsers.find(u => u.id === socket.user.id);
    
    if (currentUser) {
      currentUser.mediaState = { ...currentUser.mediaState, ...mediaState };
      socket.to(roomId).emit("user-media-toggled", {
        userId: socket.user.id,
        mediaState: currentUser.mediaState
      });
    }
  });
};
