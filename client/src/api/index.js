import { getStoredAuth } from "../utils/storage.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildRequest = (method, body) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const storedAuth = getStoredAuth();
  if (storedAuth?.token) {
    headers["Authorization"] = `Bearer ${storedAuth.token}`;
  }

  return {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  };
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const authApi = {
  register: (payload) =>
    fetch(`${API_URL}/api/auth/register`, buildRequest("POST", payload)).then(parseResponse),
  login: (payload) =>
    fetch(`${API_URL}/api/auth/login`, buildRequest("POST", payload)).then(parseResponse),
  logout: () =>
    fetch(`${API_URL}/api/auth/logout`, buildRequest("POST")).then(parseResponse),
  getCurrentUser: () =>
    fetch(`${API_URL}/api/auth/me`, buildRequest("GET")).then(parseResponse),
  requestUpgrade: () =>
    fetch(`${API_URL}/api/auth/upgrade-request`, buildRequest("POST")).then(parseResponse),
};

export const roomApi = {
  createRoom: ({ roomId }) =>
    fetch(`${API_URL}/api/rooms`, buildRequest("POST", { roomId })).then(parseResponse),
  joinRoom: ({ roomId }) =>
    fetch(`${API_URL}/api/rooms/${roomId}/join`, buildRequest("POST")).then(parseResponse),
  getRoom: ({ roomId }) =>
    fetch(`${API_URL}/api/rooms/${roomId}`, buildRequest("GET")).then(parseResponse),
  getRecentRooms: () =>
    fetch(`${API_URL}/api/rooms/recent`, buildRequest("GET")).then(parseResponse),
};

export const teamApi = {
  createTeam: (payload) =>
    fetch(`${API_URL}/api/teams`, buildRequest("POST", payload)).then(parseResponse),
  getMyTeams: () =>
    fetch(`${API_URL}/api/teams`, buildRequest("GET")).then(parseResponse),
  getTeamDetails: (teamId) =>
    fetch(`${API_URL}/api/teams/${teamId}`, buildRequest("GET")).then(parseResponse),
  inviteToTeam: (teamId, payload) =>
    fetch(`${API_URL}/api/teams/${teamId}/invite`, buildRequest("POST", payload)).then(parseResponse),
  getMyInvitations: () =>
    fetch(`${API_URL}/api/teams/invitations`, buildRequest("GET")).then(parseResponse),
  respondToInvitation: (invitationId, payload) =>
    fetch(`${API_URL}/api/teams/invitations/${invitationId}`, buildRequest("PUT", payload)).then(parseResponse),
};

export const adminApi = {
  getUsers: () =>
    fetch(`${API_URL}/api/admin/users`, buildRequest("GET")).then(parseResponse),
  getUserDetails: (userId) =>
    fetch(`${API_URL}/api/admin/users/${userId}`, buildRequest("GET")).then(parseResponse),
  deleteUser: (userId) =>
    fetch(`${API_URL}/api/admin/users/${userId}`, buildRequest("DELETE")).then(parseResponse),
  getStats: () =>
    fetch(`${API_URL}/api/admin/stats`, buildRequest("GET")).then(parseResponse),
  upgradeUserRole: (userId) =>
    fetch(`${API_URL}/api/admin/users/${userId}/upgrade`, buildRequest("PUT")).then(parseResponse),
  getAnalytics: () =>
    fetch(`${API_URL}/api/admin/analytics`, buildRequest("GET")).then(parseResponse),
  getSessions: () =>
    fetch(`${API_URL}/api/admin/sessions`, buildRequest("GET")).then(parseResponse),
  getRooms: () =>
    fetch(`${API_URL}/api/admin/rooms`, buildRequest("GET")).then(parseResponse),
  terminateRoom: (roomId) =>
    fetch(`${API_URL}/api/admin/rooms/${roomId}`, buildRequest("DELETE")).then(parseResponse),
  getUpgradeRequests: () =>
    fetch(`${API_URL}/api/admin/upgrades`, buildRequest("GET")).then(parseResponse),
  resolveUpgradeRequest: (userId, action) =>
    fetch(`${API_URL}/api/admin/upgrades/${userId}`, buildRequest("PUT", { action })).then(parseResponse),
};

export const compileApi = {
  compileCode: (payload) =>
    fetch(`${API_URL}/api/compile/run`, buildRequest("POST", payload)).then(parseResponse),
};

export const broadcastApi = {
  getBroadcasts: (roomId) =>
    fetch(`${API_URL}/api/broadcasts${roomId ? `?roomId=${roomId}` : ""}`, buildRequest("GET")).then(parseResponse),
  createBroadcast: (payload) =>
    fetch(`${API_URL}/api/broadcasts`, buildRequest("POST", payload)).then(parseResponse),
};
