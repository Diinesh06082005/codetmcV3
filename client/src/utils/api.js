import { authApi, roomApi, teamApi, adminApi, compileApi, broadcastApi } from "../api/index.js";

export const api = {
  ...authApi,
  ...roomApi,
  ...teamApi,
  ...adminApi,
  ...compileApi,
  ...broadcastApi,
  getAdminUsers: adminApi.getUsers,
  getAdminUserDetails: adminApi.getUserDetails,
  deleteAdminUser: adminApi.deleteUser,
  getAdminStats: adminApi.getStats,
  getAdminAnalytics: adminApi.getAnalytics,
  getAdminSessions: adminApi.getSessions,
  getAdminRooms: adminApi.getRooms,
};
