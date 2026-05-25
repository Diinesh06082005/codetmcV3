const resolveUserId = (user) => user?._id?.toString?.() || user?.id || "";

export const serializeUser = (user, options = {}) => ({
  id: resolveUserId(user),
  username: user?.username || "",
  email: user?.email || "",
  role: user?.role || "user",
  createdAt: user?.createdAt || null,
  lastLoginAt: user?.lastLoginAt || null,
  lastSeenAt: user?.lastSeenAt || null,
  lastSessionDurationMs: Number(
    options.lastSessionDurationMs ?? user?.lastSessionDurationMs ?? 0
  ),
  totalSessions: Number(user?.totalSessions ?? 0),
  totalTimeSpent: Number(user?.totalTimeSpent ?? 0),
  currentSessionDurationMs: Number(options.currentSessionDurationMs ?? 0),
  activeSessionsCount: Number(options.activeSessionsCount ?? 0),
  totalSessionsCreated: Number(options.totalSessionsCreated ?? 0),
  isOnline: Boolean(options.isOnline),
  roomLimit: Number(user?.roomLimit ?? 4),
  roomsCreatedToday: {
    count: Number(user?.roomsCreatedToday?.count ?? 0),
    date: user?.roomsCreatedToday?.date || null,
  },
  upgradeStatus: user?.upgradeStatus || "none",
});
