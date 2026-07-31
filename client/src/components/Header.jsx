import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  PlusCircle,
  LogIn,
  Palette,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Shield,
  Crown,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Header({
  activeSection,
  isConnected,
  user: userProp,
  onOpenCreateRoom,
  onOpenJoinRoom,
  invitations = [],
  onRespondInvitation,
  searchQuery,
  onSearchChange,
}) {
  const { theme, setTheme, THEMES, toggleTheme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const user = userProp || authUser;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const themeRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setIsThemeOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sectionTitles = {
    home: "Home Overview",
    projects: "Projects & Workspaces",
    team: "Team Hub & Collaboration",
    compiler: "Compiler IDE Playground",
    settings: "Settings & Profile",
    admin: "Admin Command Center",
  };

  const currentTitle = sectionTitles[activeSection] || "Dashboard";
  const unreadCount = invitations.length;
  const currentThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  const userRoleDisplay = user?.role === "admin" ? "ADMIN" : "DEV PRO";

  return (
    <header className="app-header sticky top-3 z-30 shrink-0 mx-2 md:mx-4 mt-3 mb-4 flex flex-col gap-4 rounded-2xl border border-white/10 glass-card-strong px-5 py-3 shadow-xl backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
      {/* Left: Section Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/10 text-white font-bold text-sm shadow-inner">
          <Sparkles size={18} className="text-[#007AFF]" />
        </div>
        <div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>Studio</span>
            <span>/</span>
            <span className="text-[#007AFF] font-bold uppercase tracking-wider">{activeSection}</span>
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-tight font-display">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Search, Live Status, Theme Selector Icon, Notifications, Actions & User Account */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Input Bar with Keyboard Hint */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-40 sm:w-56 rounded-xl border border-white/10 bg-white/[0.05] pl-8 pr-9 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-[#007AFF] focus:bg-white/[0.08] transition-colors duration-150 outline-none font-medium"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-slate-400 bg-white/10 border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* Live Socket Connection Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-[#30D158] shadow-[0_0_8px_#30D158]" : "bg-[#FF453A]"
            }`}
          />
          <span className={isConnected ? "text-emerald-400" : "text-rose-400"}>
            {isConnected ? "Live" : "Offline"}
          </span>
        </div>

        {/* Theme Selector Icon Button & Menu */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="relative flex items-center justify-center p-2 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-all duration-150 shadow-sm"
            title="Theme Selector"
          >
            <Palette size={16} className="text-cyan-400" />
            <span
              className="absolute top-1 right-1 h-2 w-2 rounded-full border border-slate-900 shadow-sm"
              style={{ backgroundColor: currentThemeObj.color || "#22d3ee" }}
            />
          </button>

          <AnimatePresence>
            {isThemeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-3 backdrop-blur-2xl shadow-2xl z-50 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Palette size={14} className="text-cyan-400" /> Theme Palette
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="text-[10px] text-cyan-400 hover:underline font-semibold"
                  >
                    Quick Toggle
                  </button>
                </div>

                <div className="space-y-1">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span
                          className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex items-center justify-center p-2 rounded-xl border border-white/10 bg-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.14] transition-all duration-150 shadow-sm"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF453A] text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-950/95 p-4 backdrop-blur-2xl shadow-2xl z-50"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell size={14} className="text-[#007AFF]" /> Notifications
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                    {unreadCount} pending
                  </span>
                </div>

                {invitations.length === 0 ? (
                  <div className="text-xs text-slate-400 italic text-center py-6">
                    No pending invitations right now.
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
                              setIsNotifOpen(false);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white font-semibold text-[11px] flex-1 text-center transition-colors duration-150"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              onRespondInvitation && onRespondInvitation(inv._id, "reject");
                              setIsNotifOpen(false);
                            }}
                            className="px-3 py-1 rounded-lg bg-[#FF453A]/15 border border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A]/25 font-semibold text-[11px] flex-1 text-center transition-colors duration-150"
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

        {/* Action Buttons: Join & New Room */}
        <button
          onClick={onOpenJoinRoom}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-100 bg-white/[0.08] border border-white/10 hover:bg-white/[0.14] active:bg-white/[0.2] transition-all duration-150"
        >
          <LogIn size={14} className="text-slate-300" />
          <span>Join</span>
        </button>

        <button
          onClick={onOpenCreateRoom}
          className="gradient-button text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
        >
          <PlusCircle size={14} />
          <span>New Room</span>
        </button>

        {/* Separator Line */}
        <div className="h-6 w-px bg-white/10 mx-0.5 hidden sm:block" />

        {/* User Account Name & Profile Picture Component */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-white/25 transition-all duration-150 shadow-sm group"
          >
            {/* Profile Avatar Picture */}
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-md border border-white/30 group-hover:scale-105 transition-transform duration-150">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </div>
              <span className="h-2.5 w-2.5 bg-[#30D158] border-2 border-slate-900 rounded-full absolute -bottom-0.5 -right-0.5 shadow-sm" />
            </div>

            {/* Username & Role Badge */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-tight truncate max-w-[100px]">
                @{user?.username || "Developer"}
              </span>
              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-0.5">
                {user?.role === "admin" ? <Crown size={9} /> : null}
                {userRoleDisplay}
              </span>
            </div>

            <ChevronDown size={14} className="text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* User Account Dropdown Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-3 backdrop-blur-2xl shadow-2xl z-50 space-y-3"
              >
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.05] border border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-md">
                    {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">@{user?.username}</span>
                    <span className="text-[10px] text-slate-400 truncate">{user?.email || "developer@codetmc.com"}</span>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 w-max uppercase">
                      {user?.role || "Developer"}
                    </span>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-1 text-xs font-medium">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Account Status
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300">
                    <span>Daily Room Limit</span>
                    <span className="font-mono font-bold text-white">{user?.roomLimit || 50} Rooms</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300">
                    <span>Rooms Created Today</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {user?.roomsCreatedToday?.count || 0} / {user?.roomLimit || 50}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout && logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition-colors duration-150"
                  >
                    <LogOut size={14} /> Sign Out Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
