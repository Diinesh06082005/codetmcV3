import { motion } from "framer-motion";
import {
  Code2,
  Home,
  FolderGit2,
  Users,
  Terminal,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function Sidebar({
  activeSection,
  onSelectSection,
  user,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  pendingInvitesCount = 0,
}) {
  const NAV_ITEMS = [
    {
      id: "home",
      label: "Home Overview",
      icon: Home,
      badge: null,
    },
    {
      id: "projects",
      label: "Projects & Rooms",
      icon: FolderGit2,
      badge: null,
    },
    {
      id: "team",
      label: "Team Hub",
      icon: Users,
      badge: pendingInvitesCount > 0 ? pendingInvitesCount : null,
    },
    {
      id: "compiler",
      label: "Compiler Studio",
      icon: Terminal,
      badge: "IDE",
    },
    {
      id: "settings",
      label: "Settings & Profile",
      icon: Settings,
      badge: null,
    },
  ];

  if (user?.role === "admin") {
    NAV_ITEMS.push({
      id: "admin",
      label: "Admin Center",
      icon: Shield,
      badge: "ADMIN",
    });
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="app-sidebar relative flex flex-col h-[calc(100vh-1.5rem)] sticky top-3 z-40 select-none shrink-0 my-2 md:my-3 ml-2 md:ml-3 rounded-3xl border border-white/10 glass-card-strong shadow-2xl overflow-hidden backdrop-blur-2xl"
    >
      {/* Sidebar Top Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#007AFF] to-indigo-600 text-white font-medium shadow-md">
            <Code2 size={18} />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="text-sm font-bold tracking-tight text-white font-display flex items-center gap-1">
                CodeTMC <span className="text-[#007AFF]">Studio</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise v2.0</span>
            </motion.div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-150"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Sidebar Navigation Items */}
      <div className="flex-1 space-y-1 p-2.5 overflow-y-auto scrollbar-thin">
        {!isCollapsed && (
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-white/15 text-white border border-white/20 shadow-md"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={16}
                className={`shrink-0 transition-colors duration-150 ${
                  isActive ? "text-[#007AFF]" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />

              {!isCollapsed && (
                <span className="truncate flex-1 text-left font-semibold">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    typeof item.badge === "number"
                      ? "bg-[#FF453A] text-white shadow-sm"
                      : "bg-white/10 text-slate-300 border border-white/10"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Bar Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeSideBarTab"
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#007AFF]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer User Info */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center justify-between p-2 rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md border border-white/20">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
              </div>
              <span className="h-2 w-2 rounded-full bg-[#30D158] border border-slate-900 absolute bottom-0 right-0" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="truncate text-xs font-bold text-white">@{user?.username}</span>
                <span className="truncate text-[10px] text-slate-400 font-semibold uppercase">{user?.role || "Developer"}</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#FF453A] hover:bg-[#FF453A]/15 transition-colors duration-150"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;
