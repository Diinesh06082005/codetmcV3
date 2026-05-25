const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildRequest = (method, body) => {
  const headers = {
    "Content-Type": "application/json",
  };

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

export const api = {
  register: async (payload) =>
    parseResponse(await fetch(`${API_URL}/api/auth/register`, buildRequest("POST", payload))),
  login: async (payload) =>
    parseResponse(await fetch(`${API_URL}/api/auth/login`, buildRequest("POST", payload))),
  logout: async () =>
    parseResponse(await fetch(`${API_URL}/api/auth/logout`, buildRequest("POST"))),
  getCurrentUser: async () =>
    parseResponse(await fetch(`${API_URL}/api/auth/me`, buildRequest("GET"))),
  createRoom: async ({ roomId }) =>
    parseResponse(await fetch(`${API_URL}/api/rooms`, buildRequest("POST", { roomId }))),
  joinRoom: async ({ roomId }) =>
    parseResponse(await fetch(`${API_URL}/api/rooms/${roomId}/join`, buildRequest("POST"))),
  getRoom: async ({ roomId }) =>
    parseResponse(await fetch(`${API_URL}/api/rooms/${roomId}`, buildRequest("GET"))),
  getAdminUsers: async () =>
    parseResponse(await fetch(`${API_URL}/api/admin/users`, buildRequest("GET"))),
  getAdminUserDetails: async (userId) =>
    parseResponse(await fetch(`${API_URL}/api/admin/users/${userId}`, buildRequest("GET"))),
  deleteAdminUser: async (userId) =>
    parseResponse(await fetch(`${API_URL}/api/admin/users/${userId}`, buildRequest("DELETE"))),
  getAdminStats: async () =>
    parseResponse(await fetch(`${API_URL}/api/admin/stats`, buildRequest("GET"))),
  upgradeUserRole: async (userId) =>
    parseResponse(await fetch(`${API_URL}/api/admin/users/${userId}/upgrade`, buildRequest("PUT"))),
  getAdminAnalytics: async () =>
    parseResponse(await fetch(`${API_URL}/api/admin/analytics`, buildRequest("GET"))),
  getAdminSessions: async () =>
    parseResponse(await fetch(`${API_URL}/api/admin/sessions`, buildRequest("GET"))),
  requestUpgrade: async () =>
    parseResponse(await fetch(`${API_URL}/api/auth/upgrade-request`, buildRequest("POST"))),
  terminateRoom: async (roomId) =>
    parseResponse(await fetch(`${API_URL}/api/admin/rooms/${roomId}`, buildRequest("DELETE"))),
  getUpgradeRequests: async () =>
    parseResponse(await fetch(`${API_URL}/api/admin/upgrades`, buildRequest("GET"))),
  resolveUpgradeRequest: async (userId, action) =>
    parseResponse(await fetch(`${API_URL}/api/admin/upgrades/${userId}`, buildRequest("PUT", { action }))),
  compileCode: async (payload) =>
    parseResponse(await fetch(`${API_URL}/api/compile/run`, buildRequest("POST", payload))),
};
