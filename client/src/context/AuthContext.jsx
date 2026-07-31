import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api.js";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../utils/storage.js";

const AuthContext = createContext(null);

const emptySession = {
  user: null,
};

export function AuthProvider({ children }) {
  const initialSession = getStoredAuth();
  const [user, setUser] = useState(initialSession.user || emptySession.user);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const applySession = (nextUser, nextToken) => {
    if (nextUser) {
      const existing = getStoredAuth();
      setStoredAuth({ user: nextUser, token: nextToken || existing.token || null });
    } else {
      clearStoredAuth();
    }

    setUser(nextUser || null);
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const response = await api.getCurrentUser();

        if (!isMounted) {
          return;
        }

        applySession(response.user);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        applySession(null);
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await api.login(credentials);
    applySession(response.user, response.token);
    return response;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    applySession(response.user, response.token);
    return response;
  };

  const refreshUser = async () => {
    if (!user) {
      return null;
    }

    const response = await api.getCurrentUser();
    applySession(response.user);
    return response.user;
  };

  const logout = async (options = {}) => {
    if (!options.skipRequest) {
      await api.logout().catch(() => {});
    }

    applySession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isBootstrapping,
        login,
        register,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};
