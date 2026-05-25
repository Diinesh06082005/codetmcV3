import { createContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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

    const socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleForceLogout = (payload) => {
      setIsConnected(false);
      toast.error(payload?.message || "Your session is no longer active.");
      logoutRef.current({ skipRequest: true });
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
    socketInstance.on("connect_error", handleConnectError);

    setSocket(socketInstance);
    socketInstance.connect();

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("force-logout", handleForceLogout);
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
