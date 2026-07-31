import { createContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import { getStoredAuth } from "../utils/storage.js";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { isAuthenticated, isBootstrapping, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const logoutRef = useRef(logout);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (isBootstrapping || !isAuthenticated) {
      setSocket(null);
      setIsConnected(false);
      return undefined;
    }

    const storedAuth = getStoredAuth();
    const socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: {
        token: storedAuth?.token || "",
      },
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleForceLogout = (payload) => {
      setIsConnected(false);
      toast.error(payload?.message || "Your session is no longer active.");
      logoutRef.current({ skipRequest: true });
    };
    const handleSystemBroadcast = (payload) => {
      toast.custom(
        (t) => (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-5 py-3.5 rounded-2xl font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-amber-300 flex items-center gap-3">
            <span className="text-2xl">📢</span>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-950/80">GLOBAL GOD MODE BROADCAST ({payload?.sender ? `@${payload.sender}` : 'Admin'})</p>
              <p className="text-xs font-extrabold text-slate-950">{payload?.message || "System Alert Announcement"}</p>
            </div>
          </div>
        ),
        { duration: 10000, position: "top-center" }
      );
    };
    const handleConnectError = (error) => {
      setIsConnected(false);

      if (error?.message === "Authentication failed." || error?.message === "Authentication required.") {
        toast.error(error?.data?.message || "Your session expired. Please log in again.");
        logoutRef.current({ skipRequest: true });
      }
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("force-logout", handleForceLogout);
    socketInstance.on("system-broadcast", handleSystemBroadcast);
    socketInstance.on("connect_error", handleConnectError);

    setSocket(socketInstance);
    socketInstance.connect();

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("force-logout", handleForceLogout);
      socketInstance.off("system-broadcast", handleSystemBroadcast);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.disconnect();
    };
  }, [isAuthenticated, isBootstrapping]);

  const connectSocket = () => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  };

  const disconnectSocket = () => {
    if (socket?.connected) {
      socket.disconnect();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
