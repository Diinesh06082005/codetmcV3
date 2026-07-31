import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Activity,
  Clock,
  ShieldAlert,
  MonitorPlay,
  Key,
  Search,
  Trash2,
  ArrowUpCircle,
  Sliders,
  CheckCircle,
  WifiOff,
  GitBranch,
  Eye,
  Video,
  Zap,
  Crown,
  Lock,
  Unlock,
  Settings,
  ChevronLeft,
  ChevronRight,
  Code2,
  LogOut,
  Send,
  MessageSquare,
  Radio,
  Edit3,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  FileCode,
  HardDrive,
  FolderPlus,
  Cpu,
  Save,
  CheckSquare,
  Slash,
} from "lucide-react";
import FullPageLoader from "../components/FullPageLoader.jsx";
import ModalShell from "../components/ModalShell.jsx";
import VideoChat from "../components/VideoChat.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";
import { formatDateTime } from "../utils/formatters.js";

const ADMIN_THEME_COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#3b82f6"];

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  // Admin Navigation Tabs ("overview" | "users" | "code_interceptor" | "features" | "teams_control" | "analytics")
  const [adminNavSection, setAdminNavSection] = useState("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // System Stats & Analytics
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessionsLogs, setSessionsLogs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Global Master Feature Controls
  const [globalFeatures, setGlobalFeatures] = useState({
    videoCall: true,
    teamsHub: true,
    compilerSandbox: true,
    offlineMode: true,
    gitBranching: true,
    liveWebPreview: true,
    teamLeadPermissions: true,
  });

  // User God Mode Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [userResourceForm, setUserResourceForm] = useState({
    username: "",
    email: "",
    role: "user",
    roomLimit: 5,
    maxFilesLimit: 20,
    storageQuotaMB: 100,
    videoCallEnabled: true,
    webPreviewEnabled: true,
    offlineModeEnabled: true,
  });

  // Live Code Overwrite God Mode State
  const [selectedRoomForCode, setSelectedRoomForCode] = useState(null);
  const [liveCodeSnippet, setLiveCodeSnippet] = useState(`// Master Admin Code Interceptor
// Select a room to view and overwrite user code live in real-time.`);
  const [liveCodeLanguage, setLiveCodeLanguage] = useState("javascript");

  // God Mode CCTV Video & Audio Surveillance State
  const [selectedSurveillanceRoomId, setSelectedSurveillanceRoomId] = useState("");

  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [upgradeRequests, setUpgradeRequests] = useState([]);

  // System Broadcast State
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [joinRoomId, setJoinRoomId] = useState("");

  const loadDashboard = async (options = {}) => {
    const shouldUseBlockingLoader = Boolean(options.withLoader);
    if (shouldUseBlockingLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [statsRes, usersRes, analyticsRes, sessionsRes, upgradesRes, teamsRes, roomsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAnalytics(),
        api.getAdminSessions(),
        api.getUpgradeRequests(),
        api.getMyTeams().catch(() => ({ teams: [] })),
        api.getAdminRooms().catch(() => ({ rooms: [] })),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setAnalytics(analyticsRes.analytics);
      setSessionsLogs(sessionsRes.sessions);
      setUpgradeRequests(upgradesRes.requests);
      if (teamsRes.success) setTeams(teamsRes.teams);
      if (roomsRes.success) setRoomsList(roomsRes.rooms);
    } catch (error) {
      toast.error(error.message || "Unable to load admin command center.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard({ withLoader: true });
  }, []);

  // God Mode User Resource & Feature Editor Handlers
  const handleOpenUserResourceEditor = (member) => {
    setEditingUser(member);
    setUserResourceForm({
      username: member.username || "",
      email: member.email || "",
      role: member.role || "user",
      roomLimit: member.roomLimit || 5,
      maxFilesLimit: member.maxFilesLimit || 25,
      storageQuotaMB: member.storageQuotaMB || 250,
      videoCallEnabled: member.videoCallEnabled !== false,
      webPreviewEnabled: member.webPreviewEnabled !== false,
      offlineModeEnabled: member.offlineModeEnabled !== false,
    });
  };

  const handleSaveUserResourceEditor = () => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              username: userResourceForm.username,
              email: userResourceForm.email,
              role: userResourceForm.role,
              roomLimit: Number(userResourceForm.roomLimit),
              maxFilesLimit: Number(userResourceForm.maxFilesLimit),
              storageQuotaMB: Number(userResourceForm.storageQuotaMB),
              videoCallEnabled: userResourceForm.videoCallEnabled,
              webPreviewEnabled: userResourceForm.webPreviewEnabled,
              offlineModeEnabled: userResourceForm.offlineModeEnabled,
            }
          : u
      )
    );

    toast.success(`⚡ Allocated resources & features updated for @${userResourceForm.username}!`);
    setEditingUser(null);
  };

  // Live Code Overwrite Action
  const handleSelectRoomCode = (room) => {
    setSelectedRoomForCode(room);
    setLiveCodeSnippet(room.code || `// Live workspace code for Room #${room.roomId}\nconsole.log("God Mode Interceptor Active");`);
  };

  const handleForceSaveLiveCode = () => {
    if (!selectedRoomForCode) {
      toast.error("Select an active room first.");
      return;
    }

    if (socket) {
      socket.emit("admin-code-overwrite", {
        roomId: selectedRoomForCode.roomId,
        code: liveCodeSnippet,
        language: liveCodeLanguage,
      }, (res) => {
        if (res?.success) {
          toast.success(`⚡ Live Overwrite applied to Room #${selectedRoomForCode.roomId}!`);
        } else {
          toast.error(res?.message || "Failed to overwrite room code.");
        }
      });
    } else {
      toast.success(`⚡ Live Overwrite recorded for Room #${selectedRoomForCode.roomId}.`);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;

    try {
      setIsDeleting(true);
      await api.deleteAdminUser(deleteCandidate.id);
      toast.success(`${deleteCandidate.username} deleted.`);
      setUsers((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      setDeleteCandidate(null);
      loadDashboard();
    } catch (error) {
      toast.error(error.message || "Unable to delete user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleGlobalFeature = (featureKey) => {
    setGlobalFeatures((prev) => {
      const nextState = !prev[featureKey];
      toast.success(
        `Master Global Feature '${featureKey}' is now ${nextState ? "ENABLED" : "DISABLED"}`
      );
      return { ...prev, [featureKey]: nextState };
    });
  };

  const handleActivateAllUsers = () => {
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        roomLimit: 999,
        maxFilesLimit: 100,
        storageQuotaMB: 1000,
        role: "admin",
        videoCallEnabled: true,
        webPreviewEnabled: true,
      }))
    );
    toast.success("⚡ Master Admin Override: All users granted Unlimited Resources & Features!");
  };

  const handleSendSystemBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    if (socket) {
      socket.emit("system-broadcast", {
        message: broadcastMessage.trim(),
      }, (res) => {
        if (res?.success) {
          toast.success("System announcement broadcasted to all connected developer rooms!");
        }
      });
    } else {
      toast.success("System broadcast sent.");
    }

    setBroadcastMessage("");
    setIsBroadcastModalOpen(false);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;
    navigate(`/room/${joinRoomId.trim()}`);
  };

  const handleResolveUpgrade = async (userId, action) => {
    try {
      await api.resolveUpgradeRequest(userId, action);
      toast.success(`Request ${action}d successfully.`);
      setUpgradeRequests((prev) => prev.filter((r) => r._id !== userId));
      loadDashboard();
    } catch (error) {
      toast.error(error.message || "Failed to resolve request.");
    }
  };

  const handleTerminateRoom = async (roomId) => {
    try {
      await api.terminateRoom(roomId);
      toast.success("Room terminated successfully.");
      setRoomsList((prev) => prev.filter((r) => r.roomId !== roomId));
    } catch (error) {
      toast.error(error.message || "Failed to terminate room.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const roleData = useMemo(() => {
    const adminCount = users.filter((u) => u.role === "admin").length;
    const userCount = users.length - adminCount;
    return [
      { name: "Team Leader / Admin", value: adminCount },
      { name: "Developer", value: userCount },
    ];
  }, [users]);

  // Combine rooms from rooms API & user room lists
  const allActiveRooms = useMemo(() => {
    const roomsMap = new Map();
    if (roomsList && roomsList.length > 0) {
      roomsList.forEach((r) => roomsMap.set(r.roomId, r));
    }
    users.forEach((u) => {
      if (u.recentRooms) {
        u.recentRooms.forEach((r) => {
          if (!roomsMap.has(r.roomId)) {
            roomsMap.set(r.roomId, r);
          }
        });
      }
    });
    return Array.from(roomsMap.values());
  }, [roomsList, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06070d] p-6 flex flex-col gap-6 font-display">
        <div className="skeleton-bar h-16 w-full" />
        <div className="grid flex-1 gap-6 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="skeleton-bar h-[600px] w-full" />
          <div className="skeleton-bar h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-[#06070d] font-display text-white selection:bg-amber-500/30 overflow-hidden">
      {/* ================= DISTINCT CYBERPUNK ADMIN SIDEBAR ================= */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative flex flex-col h-screen sticky top-0 z-40 border-r border-amber-500/20 bg-slate-950/95 backdrop-blur-2xl shadow-[0_0_30px_rgba(245,158,11,0.1)] select-none shrink-0"
      >
        {/* Admin Brand Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Crown size={22} />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-base font-black tracking-wider text-white uppercase">
                  GOD MODE <span className="text-amber-400">ADMIN</span>
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono">Control Center v3.0</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-500/10 hover:text-amber-300 transition"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 space-y-1.5 p-3 overflow-y-auto scrollbar-thin">
          {!isSidebarCollapsed && (
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
              <Zap size={12} /> Master Operations
            </p>
          )}

          {[
            { id: "overview", label: "Dashboard Overview", icon: ShieldAlert },
            { id: "users", label: "User Resources & Allocations", icon: Users, badge: users.length },
            { id: "code_interceptor", label: "Live Code Overwrite", icon: FileCode, badge: "LIVE" },
            { id: "surveillance", label: "Live Video & Audio Surveillance", icon: Video, badge: "CCTV" },
            { id: "features", label: "Global Feature Controls", icon: Sliders },
            { id: "teams_control", label: "Team Hub & Room Management", icon: Shield },
            { id: "analytics", label: "System Telemetry", icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = adminNavSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setAdminNavSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/25 to-amber-600/10 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition ${
                    isActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-300"
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                {!isSidebarCollapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-slate-950/60 space-y-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full subtle-button text-xs py-2.5 px-3 flex items-center justify-center gap-2 font-bold border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <Code2 size={15} /> Exit to Developer Studio
          </button>

          <div className="flex items-center justify-between p-2 rounded-xl border border-amber-500/20 bg-black/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                GA
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">@{user?.username}</span>
                  <span className="text-[9px] text-amber-400 font-mono font-bold uppercase">God Mode Authority</span>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ================= MAIN GOD MODE ADMIN WORKSPACE ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Distinct Cyberpunk Header */}
        <header className="sticky top-0 z-30 border-b border-amber-500/20 bg-slate-950/90 px-6 py-4 backdrop-blur-2xl flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <ShieldAlert size={15} /> GOD MODE COMMAND CENTER
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Interceptor Ready
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Radio size={15} /> Global Broadcast
            </button>

            <button
              onClick={handleActivateAllUsers}
              className="gradient-button text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Zap size={14} /> Unlimited Privilege Override
            </button>
          </div>
        </header>

        {/* Main Section Content */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {/* SECTION 1: OVERVIEW */}
            {adminNavSection === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: "Registered Developers", value: users.length, icon: Users, color: "text-amber-400" },
                    { title: "Active Project Rooms", value: stats?.activeRooms || allActiveRooms.length || 1, icon: MonitorPlay, color: "text-emerald-400" },
                    { title: "Managed Developer Teams", value: teams.length || 4, icon: Shield, color: "text-cyan-400" },
                    { title: "Limit Upgrade Requests", value: upgradeRequests.length, icon: ArrowUpCircle, color: "text-rose-400" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border border-amber-500/20 bg-slate-950/80 backdrop-blur-md relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    >
                      <div className={`absolute top-0 right-0 p-4 opacity-20 ${stat.color}`}>
                        <stat.icon size={50} />
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                    </div>
                  ))}
                </div>

                {/* God Mode Access Panel */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1 p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md space-y-4">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Key size={18} /> Infiltrate Any Room (God Mode)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Join any developer's project room invisibly with master admin privileges.
                    </p>
                    <form onSubmit={handleJoinRoom} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter Room ID (e.g. K89H3RPV)"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        className="input-shell text-xs py-2.5 px-3 w-full bg-slate-950 border-amber-500/30 text-white"
                      />
                      <button
                        type="submit"
                        className="gradient-button text-xs py-2.5 w-full font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      >
                        Infiltrate Room
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 p-6 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <Activity size={16} className="text-amber-400" /> Active Session Telemetry
                    </h3>
                    <div className="flex-1 overflow-auto max-h-[220px] scrollbar-thin">
                      <table className="w-full text-xs text-left">
                        <thead className="text-[10px] text-amber-300 uppercase bg-slate-900 sticky top-0 font-black">
                          <tr>
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Room</th>
                            <th className="px-3 py-2">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {sessionsLogs.slice(0, 10).map((log, i) => (
                            <tr key={i} className="hover:bg-amber-500/5">
                              <td className="px-3 py-2 font-bold text-white">@{log.userId?.username || "Developer"}</td>
                              <td className="px-3 py-2 font-mono text-amber-400">#{log.roomId?.roomId || "Workspace"}</td>
                              <td className="px-3 py-2 text-slate-400">{formatDateTime(log.joinTime)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 2: USER RESOURCE & ALLOCATION EDITOR */}
            {adminNavSection === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">User Accounts & Resource Allocations</h3>
                    <p className="text-xs text-slate-400">
                      Configure room creation limits, max files per room, storage quota, and feature toggles per developer.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search developer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 w-full md:w-60"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Team Leader / Admin</option>
                      <option value="user">Developer</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 text-amber-300 uppercase tracking-wider font-extrabold">
                      <tr>
                        <th className="px-4 py-3">User & Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Room Limit</th>
                        <th className="px-4 py-3">Storage Quota</th>
                        <th className="px-4 py-3">Features Enabled</th>
                        <th className="px-4 py-3 text-right">God Mode Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {filteredUsers.map((member) => (
                        <tr key={member.id} className="hover:bg-amber-500/5 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-white">@{member.username}</div>
                            <div className="text-[11px] text-slate-400">{member.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                member.role === "admin"
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {member.role === "admin" ? "Team Leader" : "Developer"}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-amber-300 font-bold">
                            {member.roomLimit || 5} Rooms/day
                          </td>
                          <td className="px-4 py-3 font-mono text-emerald-400 font-bold">
                            {member.storageQuotaMB || 250} MB
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <span className={`px-2 py-0.5 rounded ${member.videoCallEnabled !== false ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                                Video {member.videoCallEnabled !== false ? "ON" : "OFF"}
                              </span>
                              <span className={`px-2 py-0.5 rounded ${member.webPreviewEnabled !== false ? "bg-cyan-500/20 text-cyan-300" : "bg-rose-500/20 text-rose-300"}`}>
                                Web {member.webPreviewEnabled !== false ? "ON" : "OFF"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenUserResourceEditor(member)}
                                className="px-3 py-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition flex items-center gap-1"
                              >
                                <Edit3 size={13} /> Edit Resources
                              </button>

                              <button
                                onClick={() => setDeleteCandidate(member)}
                                disabled={member.id === user?.id}
                                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition disabled:opacity-30"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SECTION 3: LIVE CODE OVERWRITE GOD MODE */}
            {adminNavSection === "code_interceptor" && (
              <motion.div
                key="code_interceptor"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-slate-950/80 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="text-lg font-extrabold text-white">Live Code Interceptor & Overwrite Studio</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly inspect code across active rooms and force live overrides directly into developers' Monaco editors.
                  </p>
                </div>

                {/* Active Rooms Selection Bar */}
                <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
                  <span className="text-xs font-bold text-amber-300 uppercase">Select Target Room:</span>
                  {allActiveRooms.length > 0 ? (
                    allActiveRooms.map((room) => (
                      <button
                        key={room.roomId}
                        onClick={() => handleSelectRoomCode(room)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition border ${
                          selectedRoomForCode?.roomId === room.roomId
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                            : "bg-slate-900 text-slate-400 border-white/10 hover:text-white"
                        }`}
                      >
                        #{room.roomId}
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No active rooms currently broadcasting.</span>
                  )}
                </div>

                {/* Code Overwrite Editor Console */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-white">
                        {selectedRoomForCode ? `Editing Code for Room #${selectedRoomForCode.roomId}` : "Select Room Above"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={liveCodeLanguage}
                        onChange={(e) => setLiveCodeLanguage(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold"
                      >
                        <option value="javascript">JavaScript / Node</option>
                        <option value="react">React JSX</option>
                        <option value="css">CSS</option>
                        <option value="html">HTML</option>
                        <option value="python">Python</option>
                      </select>

                      <button
                        onClick={handleForceSaveLiveCode}
                        className="gradient-button text-xs font-bold px-4 py-1.5 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      >
                        <Save size={14} /> Force Save Live Overwrite
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={liveCodeSnippet}
                    onChange={(e) => setLiveCodeSnippet(e.target.value)}
                    rows={14}
                    className="w-full bg-[#05060a] border border-amber-500/30 rounded-2xl p-4 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-400 scrollbar-thin shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {/* SECTION 3.5: LIVE VIDEO & AUDIO SURVEILLANCE */}
            {adminNavSection === "surveillance" && (
              <motion.div
                key="surveillance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Video size={20} className="text-amber-400" />
                      God Mode Live Video & Audio Surveillance Monitor
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Stream and monitor real-time video feeds and audio calls of any room directly from the Admin Command Center.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedSurveillanceRoomId}
                      onChange={(e) => setSelectedSurveillanceRoomId(e.target.value)}
                      className="px-4 py-2 bg-slate-900 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Select Room to Monitor...</option>
                      {allActiveRooms.map((r, i) => (
                        <option key={i} value={r.roomId}>
                          Room #{r.roomId} ({r.collaboratorCount || 1} online)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedSurveillanceRoomId ? (
                  <div className="glass-card p-6 rounded-3xl border border-amber-500/30 bg-slate-950/90 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        Surveillance Live Feed: Room #{selectedSurveillanceRoomId}
                      </div>
                      <button
                        onClick={() => navigate(`/room/${selectedSurveillanceRoomId}`)}
                        className="gradient-button text-xs py-1.5 px-3 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                      >
                        Infiltrate Room Directly
                      </button>
                    </div>

                    <VideoChat
                      socket={socket}
                      roomId={selectedSurveillanceRoomId}
                      user={user}
                      isTeamLeader={true}
                      activeUsers={users}
                      isSpectator={false}
                    />
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl border border-dashed border-amber-500/20 bg-slate-950/60 text-center space-y-3">
                    <Video size={40} className="mx-auto text-amber-400/50" />
                    <h4 className="text-sm font-bold text-white">No Room Selected for Video Surveillance</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Select an active room from the dropdown above to launch live WebRTC CCTV video surveillance and audio monitoring.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      {allActiveRooms.slice(0, 3).map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSurveillanceRoomId(r.roomId)}
                          className="subtle-button text-xs py-1.5 px-3 font-mono text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                        >
                          Monitor #{r.roomId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SECTION 4: GLOBAL FEATURE CONTROLS */}
            {adminNavSection === "features" && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {[
                  { key: "videoCall", title: "Video & Audio Call Engine", icon: Video, color: "text-rose-400", desc: "Enables or disables WebRTC video calling across all rooms and teams." },
                  { key: "teamsHub", title: "Team Creation & Team Hub", icon: Shield, color: "text-cyan-400", desc: "Enables or disables team creation and invitations in Team Hub." },
                  { key: "compilerSandbox", title: "Compiler Sandbox Studio", icon: Cpu, color: "text-violet-400", desc: "Enables or disables multi-language code execution." },
                  { key: "offlineMode", title: "Offline Mode & PR System", icon: WifiOff, color: "text-amber-400", desc: "Enables or disables offline code editing and PR submissions." },
                  { key: "gitBranching", title: "Git Branching Engine", icon: GitBranch, color: "text-emerald-400", desc: "Enables or disables Git branching, commit logs, and merges." },
                  { key: "liveWebPreview", title: "Live Web Preview Engine", icon: Eye, color: "text-blue-400", desc: "Enables or disables isolated React 18 / Babel preview modal." },
                ].map((feat) => (
                  <div
                    key={feat.key}
                    className="p-5 rounded-2xl border border-amber-500/20 bg-slate-950/80 flex flex-col justify-between gap-4 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 font-bold text-sm ${feat.color}`}>
                          <feat.icon size={18} /> {feat.title}
                        </div>
                        <button
                          onClick={() => handleToggleGlobalFeature(feat.key)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            globalFeatures[feat.key]
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {globalFeatures[feat.key] ? "ENABLED" : "DISABLED"}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* SECTION 5: TEAMS CONTROL & ROOM MANAGEMENT */}
            {adminNavSection === "teams_control" && (
              <motion.div
                key="teams_control"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                {/* Live Active Developer Roster Banner */}
                <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                        Live Online Developers & Active Presence
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time status of all developers connected to the platform studio.
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {users.filter((u) => u.isOnline).length} Active Online Developers
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {users.map((member) => (
                      <div
                        key={member.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                          member.isOnline
                            ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                            : "bg-slate-900/40 border-white/5 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-bold text-slate-950 flex items-center justify-center text-xs">
                              {member.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${
                                member.isOnline ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">@{member.username}</p>
                            <p className="text-[10px] text-amber-300 font-mono">
                              {member.role === "admin" ? "Team Leader" : "Developer"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            member.isOnline
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {member.isOnline ? "🟢 Active in Room" : "⚪ Offline"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Managed Developer Teams Hub Roster */}
                <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Shield size={18} className="text-amber-400" />
                      Managed Developer Teams ({teams.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Overview of created teams, assigned members, and team lead controls.
                    </p>
                  </div>

                  {teams.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {teams.map((team) => (
                        <div
                          key={team._id}
                          className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-amber-300">{team.name}</h4>
                              <p className="text-[11px] text-slate-400">{team.description || "No description specified"}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {team.members?.length || 1} Members
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs border-t border-white/5 pt-2">
                            <Crown size={14} className="text-amber-400" />
                            <span className="text-slate-400">Team Leader:</span>
                            <span className="font-bold text-white">@{team.leader?.username || "Lead"}</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Team Roster:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {team.members?.map((m, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950 text-slate-300 border border-white/10 flex items-center gap-1"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  @{m.user?.username || m.username || "Member"}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                      No active developer teams created yet in Team Hub.
                    </div>
                  )}
                </div>

                {/* Active Workspace Rooms Grid */}
                <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <MonitorPlay size={18} className="text-emerald-400" />
                      Active Workspace Rooms ({allActiveRooms.length})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Inspect and manage live collaboration rooms.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {allActiveRooms.map((room, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-amber-500/20 bg-slate-900/60 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-bold text-amber-300">#{room.roomId}</span>
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Collaborators: {room.collaboratorCount || 1} online
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/room/${room.roomId}`)}
                            className="gradient-button text-xs py-2 px-3 flex-1 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          >
                            Master Join
                          </button>
                          <button
                            onClick={() => handleTerminateRoom(room.roomId)}
                            className="subtle-button text-xs py-2 px-3 font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                          >
                            Terminate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 6: TELEMETRY & ANALYTICS */}
            {adminNavSection === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                <div className="p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 backdrop-blur-md">
                  <h3 className="text-sm font-bold mb-4 text-white">Daily Active Users & Telemetry</h3>
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer>
                      <LineChart data={analytics?.dailyActiveUsers || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#06070d", borderColor: "#f59e0b" }} />
                        <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-amber-500/20 bg-slate-950/80 backdrop-blur-md flex flex-col">
                  <h3 className="text-sm font-bold mb-2 text-white">Role Distribution</h3>
                  <div className="flex-1 min-h-[260px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ADMIN_THEME_COLORS[index % ADMIN_THEME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#06070d", borderColor: "#f59e0b" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* GOD MODE USER RESOURCE EDITOR MODAL */}
      <ModalShell isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Configure User Resources & Feature Allocations">
        {editingUser && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Username</label>
                <input
                  type="text"
                  value={userResourceForm.username}
                  onChange={(e) => setUserResourceForm({ ...userResourceForm, username: e.target.value })}
                  className="input-shell text-xs py-2 px-3 w-full bg-slate-950 border-amber-500/30 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={userResourceForm.email}
                  onChange={(e) => setUserResourceForm({ ...userResourceForm, email: e.target.value })}
                  className="input-shell text-xs py-2 px-3 w-full bg-slate-950 border-amber-500/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Assigned Role</label>
                <select
                  value={userResourceForm.role}
                  onChange={(e) => setUserResourceForm({ ...userResourceForm, role: e.target.value })}
                  className="input-shell text-xs py-2 px-3 w-full bg-slate-950 font-bold text-amber-300 border-amber-500/30"
                >
                  <option value="user">Developer</option>
                  <option value="admin">Team Leader / Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Daily Room Limit</label>
                <input
                  type="number"
                  value={userResourceForm.roomLimit}
                  onChange={(e) => setUserResourceForm({ ...userResourceForm, roomLimit: e.target.value })}
                  className="input-shell text-xs py-2 px-3 w-full bg-slate-950 font-bold text-amber-300 border-amber-500/30"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Storage Quota (MB)</label>
                <input
                  type="number"
                  value={userResourceForm.storageQuotaMB}
                  onChange={(e) => setUserResourceForm({ ...userResourceForm, storageQuotaMB: e.target.value })}
                  className="input-shell text-xs py-2 px-3 w-full bg-slate-950 font-bold text-emerald-400 border-amber-500/30"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-slate-950 space-y-2">
              <span className="text-xs font-bold text-amber-300 block">Feature Access Allocations</span>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userResourceForm.videoCallEnabled}
                    onChange={(e) => setUserResourceForm({ ...userResourceForm, videoCallEnabled: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>Video / Audio Calling</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userResourceForm.webPreviewEnabled}
                    onChange={(e) => setUserResourceForm({ ...userResourceForm, webPreviewEnabled: e.target.checked })}
                    className="accent-amber-500"
                  />
                  <span>Live Web Preview</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button onClick={() => setEditingUser(null)} className="subtle-button text-xs py-2 px-4 font-bold">
                Cancel
              </button>
              <button onClick={handleSaveUserResourceEditor} className="gradient-button text-xs py-2 px-4 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                Save Allocations
              </button>
            </div>
          </div>
        )}
      </ModalShell>

      {/* SYSTEM BROADCAST MODAL */}
      <ModalShell isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="Send Global Admin Announcement">
        <form onSubmit={handleSendSystemBroadcast} className="space-y-4 text-xs">
          <p className="text-slate-300">
            This message will be broadcast live to every active project room across the platform.
          </p>
          <textarea
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Type system alert announcement..."
            rows={4}
            className="input-shell text-xs py-2 px-3 w-full bg-slate-950 border-amber-500/30 text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="subtle-button text-xs py-2 px-4 font-bold"
            >
              Cancel
            </button>
            <button type="submit" className="gradient-button text-xs py-2 px-4 font-bold shadow-glow flex items-center gap-1.5">
              <Send size={14} /> Send Broadcast Now
            </button>
          </div>
        </form>
      </ModalShell>

      {/* Delete Candidate Modal */}
      <ModalShell isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} title="Confirm User Deletion">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">Are you sure you want to delete <strong className="text-white">@{deleteCandidate?.username}</strong>?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setDeleteCandidate(null)} className="subtle-button text-xs py-2 px-4 font-bold">Cancel</button>
            <button onClick={handleDeleteUser} disabled={isDeleting} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

export default AdminDashboard;
