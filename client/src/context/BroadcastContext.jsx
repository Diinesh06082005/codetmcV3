import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api.js";
import { useAuth } from "./AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";

const BroadcastContext = createContext(null);

export function BroadcastProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();
  const [broadcasts, setBroadcasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadBroadcasts = useCallback(async (roomId = null) => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getBroadcasts(roomId);
      if (data?.success && Array.isArray(data.broadcasts)) {
        setBroadcasts(data.broadcasts);
      }
    } catch (err) {
      console.warn("Could not fetch broadcast history:", err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBroadcasts();
    } else {
      setBroadcasts([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, loadBroadcasts]);

  useEffect(() => {
    if (!socket) return;

    const handleBroadcastReceived = (broadcast) => {
      setBroadcasts((prev) => [broadcast, ...prev.filter((b) => b._id !== broadcast._id)]);
      setUnreadCount((prev) => prev + 1);

      // Play soft chime notification sound using Web Audio API
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // ignore audio play restriction if unhandled
      }

      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              setIsDrawerOpen(true);
            }}
            className={`cursor-pointer max-w-md w-full p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 transition ${
              broadcast.priority === "urgent"
                ? "bg-rose-950/90 border-rose-500/50 text-white shadow-rose-900/30"
                : broadcast.role === "admin"
                ? "bg-amber-950/90 border-amber-500/50 text-white shadow-amber-900/30"
                : "bg-slate-900/90 border-violet-500/40 text-white shadow-violet-900/30"
            }`}
          >
            <span className="text-2xl mt-0.5">
              {broadcast.priority === "urgent" ? "🚨" : broadcast.role === "admin" ? "⚡" : "📢"}
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-white/10">
                  {broadcast.role === "admin" ? "ADMIN BROADCAST" : "TEAM LEAD ALERT"}
                </span>
                <span className="text-[10px] text-slate-400">@{broadcast.senderName}</span>
              </div>
              <h4 className="text-xs font-bold mt-1 text-white truncate">{broadcast.title || "Announcement"}</h4>
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">{broadcast.message}</p>
            </div>
          </div>
        ),
        { duration: 7000, position: "top-right" }
      );
    };

    socket.on("broadcast-received", handleBroadcastReceived);

    return () => {
      socket.off("broadcast-received", handleBroadcastReceived);
    };
  }, [socket]);

  const sendBroadcast = async ({ title, message, priority = "info", targetType = "global", roomId = null }) => {
    try {
      // Send via REST endpoint for DB persistence
      const response = await api.createBroadcast({ title, message, priority, targetType, roomId });

      if (response?.success && response.broadcast) {
        // Also emit via socket for instant zero-latency distribution
        if (socket && socket.connected) {
          socket.emit("send-broadcast", {
            title,
            message,
            priority,
            targetType,
            roomId,
          });
        }
        setBroadcasts((prev) => [response.broadcast, ...prev]);
        toast.success("Broadcast alert dispatched successfully!");
        return true;
      }
    } catch (err) {
      toast.error(err.message || "Failed to send broadcast.");
      return false;
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const removeBroadcast = (id) => {
    setBroadcasts((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <BroadcastContext.Provider
      value={{
        broadcasts,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        sendBroadcast,
        markAllAsRead,
        removeBroadcast,
        loadBroadcasts,
      }}
    >
      {children}
    </BroadcastContext.Provider>
  );
}

export const useBroadcast = () => {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error("useBroadcast must be used within a BroadcastProvider.");
  }
  return context;
};
