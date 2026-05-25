const activeRoomUsers = new Map();
const socketRoomState = new Map();
const activeUserSockets = new Map();
const activeUserSessionStarts = new Map();
const socketUserIndex = new Map();

const getOrCreateRoomUsers = (roomId) => {
  if (!activeRoomUsers.has(roomId)) {
    activeRoomUsers.set(roomId, new Map());
  }

  return activeRoomUsers.get(roomId);
};

export const addActiveRoomUser = (roomId, socketId, user, extraData = {}) => {
  getOrCreateRoomUsers(roomId).set(socketId, { ...user, ...extraData });
};

export const removeActiveRoomUser = (roomId, socketId) => {
  const roomUsers = activeRoomUsers.get(roomId);

  if (!roomUsers) {
    return;
  }

  roomUsers.delete(socketId);

  if (roomUsers.size === 0) {
    activeRoomUsers.delete(roomId);
  }
};

export const getActiveUsers = (roomId) => 
  [...(activeRoomUsers.get(roomId)?.values() || [])].filter(u => !u.isSpectator);

export const getAllUsersIncludingSpectators = (roomId) => 
  [...(activeRoomUsers.get(roomId)?.values() || [])];

export const getActiveRoomsCount = () => activeRoomUsers.size;

export const setSocketRoomState = (socketId, state) => {
  socketRoomState.set(socketId, state);
};

export const getSocketRoomState = (socketId) => socketRoomState.get(socketId);

export const clearSocketRoomState = (socketId) => {
  socketRoomState.delete(socketId);
};

export const trackSocketConnection = (socketId, userId) => {
  const normalizedUserId = userId?.toString?.() || userId;

  if (!normalizedUserId) {
    return;
  }

  let userSockets = activeUserSockets.get(normalizedUserId);

  if (!userSockets) {
    userSockets = new Set();
    activeUserSockets.set(normalizedUserId, userSockets);
  }

  const isFirstConnection = userSockets.size === 0;
  userSockets.add(socketId);
  socketUserIndex.set(socketId, normalizedUserId);

  if (isFirstConnection) {
    activeUserSessionStarts.set(normalizedUserId, Date.now());
  }
};

export const trackSocketDisconnection = (socketId) => {
  const userId = socketUserIndex.get(socketId);
  socketUserIndex.delete(socketId);

  if (!userId) {
    return {
      userId: "",
      isUserStillActive: false,
      sessionDurationMs: 0,
    };
  }

  const userSockets = activeUserSockets.get(userId);

  if (!userSockets) {
    return {
      userId,
      isUserStillActive: false,
      sessionDurationMs: 0,
    };
  }

  userSockets.delete(socketId);

  if (userSockets.size > 0) {
    return {
      userId,
      isUserStillActive: true,
      sessionDurationMs: 0,
    };
  }

  activeUserSockets.delete(userId);

  const startedAt = activeUserSessionStarts.get(userId) || Date.now();
  activeUserSessionStarts.delete(userId);

  return {
    userId,
    isUserStillActive: false,
    sessionDurationMs: Math.max(Date.now() - startedAt, 0),
  };
};

export const isUserOnline = (userId) =>
  activeUserSockets.has(userId?.toString?.() || userId || "");

export const getActiveUserCount = () => activeUserSockets.size;

export const getCurrentSessionDurationMs = (userId) => {
  const startedAt = activeUserSessionStarts.get(userId?.toString?.() || userId || "");

  if (!startedAt) {
    return 0;
  }

  return Math.max(Date.now() - startedAt, 0);
};

export const getActiveSessionsCountForUser = (userId) => {
  const normalizedUserId = userId?.toString?.() || userId || "";
  const socketIds = activeUserSockets.get(normalizedUserId);

  if (!socketIds?.size) {
    return 0;
  }

  const roomIds = new Set();

  socketIds.forEach((socketId) => {
    const state = socketRoomState.get(socketId);

    if (state?.roomId) {
      roomIds.add(state.roomId);
    }
  });

  return roomIds.size;
};

export const getSocketIdsForUser = (userId) => [
  ...(activeUserSockets.get(userId?.toString?.() || userId || "") || []),
];

export const disconnectUserSockets = (io, userId, payload = {}) => {
  const socketIds = getSocketIdsForUser(userId);

  socketIds.forEach((socketId) => {
    const socket = io?.sockets?.sockets?.get(socketId);

    if (!socket) {
      return;
    }

    socket.emit("force-logout", payload);
    socket.disconnect(true);
  });
};
