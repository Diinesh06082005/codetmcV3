import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  Home,
  Users,
  PlusCircle,
  LogIn,
  Shield,
  Bell,
  Palette,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle,
  Radio,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

function Navbar({
  roomId,
  isConnected,
  user,
  onLeave,
  onLogout,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onNavigateSection,
  activeTab,
  invitations = [],
  onRespondInvitation,
}) {
  const location = useLocation();
  const { theme, setTheme, THEMES } = useTheme();

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const themeRef = useRef(null);
  const notifRef = useRef(null);

  const isAdminView = location.pathname.startsWith("/admin");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setIsThemeOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = invitations.length;

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="sticky top-3 z-40 shrink-0 mb-4 glass-card-strong px-4 py-2.5 border border-white/10 backdrop-blur-2xl shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        {/* ================= LEFT CORNER: LOGO & APP TITLE ================= */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF] text-white font-medium shadow-sm">
              <Code2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white font-display">
                  CodeTMC <span className="text-[#007AFF]">Studio</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-medium border border-white/10">
                  <Sparkles size={10} /> v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
                Collaborative IDE
              </p>
            </div>
          </Link>

          {/* Connection Status Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-[#30D158]" : "bg-[#FF453A]"
              }`}
            />
            <span className={isConnected ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* ================= MIDDLE / RIGHT NAVBAR: NAVIGATION LINKS ================= */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* Home Link */}
          <button
            onClick={() => onNavigateSection ? onNavigateSection("overview") : null}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 ${
              activeTab === "overview" || (!activeTab && !roomId)
                ? "bg-white/15 text-white border border-white/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Home size={14} />
            <span>Home</span>
          </button>

          {/* Team Link */}
          <button
            onClick={() => onNavigateSection ? onNavigateSection("team") : null}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 ${
              activeTab === "team"
                ? "bg-white/15 text-white border border-white/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users size={14} />
            <span>Team</span>
            {invitations.length > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#007AFF] text-white text-[10px] flex items-center justify-center font-bold">
                {invitations.length}
              </span>
            )}
          </button>

          {/* Join Room */}
          <button
            onClick={() => onOpenJoinRoom ? onOpenJoinRoom() : onNavigateSection ? onNavigateSection("join") : null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 transition-colors duration-150"
          >
            <LogIn size={14} className="text-slate-300" />
            <span>Join Room</span>
          </button>

          {/* Create Room */}
          <button
            onClick={() => onOpenCreateRoom ? onOpenCreateRoom() : onNavigateSection ? onNavigateSection("create") : null}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-white bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] transition-colors duration-150 shadow-none border-none"
          >
            <PlusCircle size={14} />
            <span>Create Room</span>
          </button>

          {/* Admin Command Center */}
          {user?.role === "admin" && (
            <Link
              to={isAdminView ? "/dashboard" : "/admin"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-colors duration-150"
            >
              <Shield size={14} />
              <span>{isAdminView ? "Dashboard" : "Admin"}</span>
            </Link>
          )}
        </div>

        {/* ================= FAR RIGHT CORNER: THEME + NOTIFS + PROFILE ================= */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 1. Theme Switcher Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150 flex items-center gap-1.5"
              title="Theme Switcher"
            >
              <Palette size={15} className="text-slate-300" />
            </button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/95 p-2 backdrop-blur-2xl shadow-lg z-50"
                >
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Palette
                  </p>
                  <div className="space-y-1">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 ${
                          theme === t.id
                            ? "bg-white/15 text-white border border-white/20"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-white/20"
                            style={{ backgroundColor: t.color }}
                          />
                          <span>{t.name}</span>
                        </div>
                        {theme === t.id && <CheckCircle size={14} className="text-[#007AFF]" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-colors duration-150"
              title="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF453A] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur-2xl shadow-lg z-50"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell size={14} className="text-[#007AFF]" /> Notifications
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {unreadCount} pending
                    </span>
                  </div>

                  {invitations.length === 0 ? (
                    <div className="text-xs text-slate-400 italic text-center py-6">
                      No new notifications right now.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                      {invitations.map((inv) => (
                        <div
                          key={inv._id}
                          className="p-3 rounded-xl border border-white/10 bg-white/[0.04] flex flex-col gap-2 text-xs"
                        >
                          <p className="text-slate-200">
                            <strong className="text-white">@{inv.senderId?.username}</strong> invited you to team{" "}
                            <strong className="text-white">"{inv.teamId?.name}"</strong>
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                onRespondInvitation && onRespondInvitation(inv._id, "accept");
                                setIsNotificationsOpen(false);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white font-medium text-[11px] flex-1 text-center transition-colors duration-150"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => {
                                onRespondInvitation && onRespondInvitation(inv._id, "reject");
                                setIsNotificationsOpen(false);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A]/25 font-medium text-[11px] flex-1 text-center transition-colors duration-150"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Profile Corner Dropdown */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-xl border border-white/10 bg-white/[0.08] hover:bg-white/[0.14] transition-colors duration-150"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007AFF] text-white font-medium text-xs">
                  {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                </div>
                <span className="text-xs font-medium text-white hidden sm:block max-w-[100px] truncate">
                  @{user.username}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/95 p-4 backdrop-blur-2xl shadow-lg z-50"
                  >
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF] text-white font-medium text-xs">
                        {user.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">@{user.username}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs mb-4">
                      <div className="flex justify-between text-slate-300 py-0.5">
                        <span>Role:</span>
                        <span className="font-medium text-slate-200 uppercase">{user.role}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 py-0.5">
                        <span>Daily Rooms:</span>
                        <span className="font-medium text-white">
                          {user.roomsCreatedToday?.count || 0} / {user.roomLimit || 5}
                        </span>
                      </div>
                    </div>

                    {onLeave && (
                      <button
                        onClick={() => {
                          onLeave();
                          setIsProfileOpen(false);
                        }}
                        className="w-full mb-2 flex items-center justify-center gap-2 py-1.5 rounded-xl bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30 text-xs font-medium hover:bg-[#FF453A]/25 transition-colors duration-150"
                      >
                        <LogOut size={14} /> Leave Current Room
                      </button>
                    )}

                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-medium transition-colors duration-150"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}

export default Navbar;
