import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Megaphone, ShieldAlert, Send, X, ChevronRight, Sparkles, CheckCheck, Trash2, Filter } from "lucide-react";
import { useBroadcast } from "../context/BroadcastContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useParams } from "react-router-dom";

export default function BroadcastSideBox() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const { broadcasts, unreadCount, isDrawerOpen, setIsDrawerOpen, sendBroadcast, markAllAsRead, removeBroadcast } = useBroadcast();

  const [activeTab, setActiveTab] = useState("all"); // "all", "admin", "team"
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("info");
  const [targetType, setTargetType] = useState(user?.role === "admin" ? "global" : "room");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "admin";
  // User can broadcast if admin or inside a room (can be team lead)
  const canBroadcast = isAdmin || Boolean(roomId);

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (activeTab === "admin") return b.role === "admin";
    if (activeTab === "team") return b.role === "team_lead";
    return true;
  });

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    markAllAsRead();
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const success = await sendBroadcast({
      title: title.trim() || (targetType === "global" ? "System Announcement" : "Team Lead Alert"),
      message: message.trim(),
      priority,
      targetType: isAdmin ? targetType : "room",
      roomId: targetType === "room" ? roomId : null,
    });

    setIsSubmitting(false);
    if (success) {
      setTitle("");
      setMessage("");
      setShowComposer(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Box / Pill on the right side */}
      <div className="fixed right-4 bottom-6 z-40 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenDrawer}
          className="relative flex items-center gap-2.5 rounded-2xl bg-slate-900/90 border border-violet-500/40 px-4 py-2.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] backdrop-blur-xl transition hover:border-violet-400 group"
        >
          <div className="relative">
            <Megaphone className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="tracking-tight">Broadcast Box</span>

          {broadcasts.length > 0 && (
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300 font-semibold border border-violet-500/30">
              {broadcasts.length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Side Box Drawer Window */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Side Box Card Container */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-slate-950/95 border-l border-violet-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-950/40 via-slate-950 to-amber-950/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-amber-400">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                      Broadcast Alerts
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Live Stream
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Realtime announcements from Team Leads & Admins
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action Bar & Tabs */}
              <div className="p-3 border-b border-white/10 bg-slate-900/50 flex items-center justify-between gap-2 text-xs">
                <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition ${
                      activeTab === "all" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All ({broadcasts.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition ${
                      activeTab === "admin" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ⚡ Admin
                  </button>
                  <button
                    onClick={() => setActiveTab("team")}
                    className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition ${
                      activeTab === "team" ? "bg-cyan-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    📢 Team Lead
                  </button>
                </div>

                {canBroadcast && (
                  <button
                    onClick={() => setShowComposer(!showComposer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[11px] hover:brightness-110 transition shadow-lg"
                  >
                    <Send className="h-3 w-3" />
                    {showComposer ? "Close" : "Broadcast"}
                  </button>
                )}
              </div>

              {/* Quick Broadcast Composer for Admins & Team Leads */}
              <AnimatePresence>
                {showComposer && canBroadcast && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleCreateBroadcast}
                    className="p-4 border-b border-amber-500/30 bg-amber-950/20 space-y-3 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        New Broadcast Dispatch
                      </span>
                      {isAdmin && (
                        <div className="flex gap-2 text-[10px]">
                          <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name="target"
                              value="global"
                              checked={targetType === "global"}
                              onChange={() => setTargetType("global")}
                              className="accent-amber-500"
                            />
                            Global Platform
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer text-slate-300">
                            <input
                              type="radio"
                              name="target"
                              value="room"
                              checked={targetType === "room"}
                              onChange={() => setTargetType("room")}
                              className="accent-amber-500"
                            />
                            Room Only
                          </label>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Title / Heading (e.g. Critical Bug Fix Deployed)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
                    />

                    <textarea
                      rows={3}
                      placeholder="Write your broadcast message alert..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 outline-none resize-none"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-400 font-semibold">Priority:</span>
                        {["info", "warning", "urgent"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={`px-2 py-0.5 rounded capitalize font-bold ${
                              priority === p
                                ? p === "urgent"
                                  ? "bg-rose-500 text-white"
                                  : p === "warning"
                                  ? "bg-amber-500 text-slate-950"
                                  : "bg-blue-500 text-white"
                                : "bg-white/5 text-slate-400 hover:bg-white/10"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-slate-950 text-xs flex items-center gap-1.5 disabled:opacity-50 transition"
                      >
                        {isSubmitting ? "Posting..." : "Dispatch Alert"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Broadcast List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {filteredBroadcasts.length > 0 ? (
                  filteredBroadcasts.map((b) => {
                    const isUrgent = b.priority === "urgent";
                    const isWarning = b.priority === "warning";
                    const isAdminPost = b.role === "admin";

                    return (
                      <motion.div
                        key={b._id || Math.random()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`group relative rounded-2xl p-4 border transition-all ${
                          isUrgent
                            ? "bg-gradient-to-br from-rose-950/50 via-slate-900 to-rose-950/30 border-rose-500/40 shadow-rose-950/50"
                            : isAdminPost
                            ? "bg-gradient-to-br from-amber-950/50 via-slate-900 to-amber-950/30 border-amber-500/40 shadow-amber-950/50"
                            : "bg-slate-900/80 border-violet-500/20 hover:border-violet-500/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                isAdminPost
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              }`}
                            >
                              {isAdminPost ? "⚡ ADMIN" : "📢 TEAM LEAD"}
                            </span>

                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                URGENT
                              </span>
                            )}
                            {isWarning && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                NOTICE
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => removeBroadcast(b._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
                            title="Dismiss broadcast"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-2 tracking-tight">
                          {b.title || "Announcement Alert"}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap">
                          {b.message}
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-300">
                            By @{b.senderName}
                          </span>
                          <span>
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Just now"}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                    <Megaphone className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-sm font-bold text-slate-300">No active broadcasts</p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Messages broadcasted by team leads or system admins will appear right here in real time.
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
