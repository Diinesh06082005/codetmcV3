import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import CreateRoomModal from "../components/CreateRoomModal.jsx";
import JoinRoomModal from "../components/JoinRoomModal.jsx";
import CompilerPlayground from "../components/CompilerPlayground.jsx";
import UserSettings from "../components/UserSettings.jsx";
import SocialCards from "../components/SocialCards.jsx";
import SideRays from "../components/ui/SideRays.jsx";
import AnimatedBackground from "../components/AnimatedBackground.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";
import { formatDateTime, formatDurationMs } from "../utils/formatters.js";
import { validateRoomId } from "../utils/validators.js";
import {
  Code2,
  Users,
  PlusCircle,
  LogIn,
  Clock,
  Activity,
  UserCheck,
  Sparkles,
  ArrowRight,
  FolderGit2,
  Send,
  Check,
  X,
  Layers,
  Crown,
  Laptop,
  Shield,
  Search,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { isConnected } = useSocket();

  // Active Sidebar section ("home" | "projects" | "team" | "compiler" | "settings" | "admin")
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Projects filter tab ("all" | "lead" | "developer")
  const [projectRoleFilter, setProjectRoleFilter] = useState("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Workspace history state
  const [recentRooms, setRecentRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Teams & Invitations state
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteMemberInputs, setInviteMemberInputs] = useState({});
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    if (hasRefreshedRef.current) return;
    hasRefreshedRef.current = true;
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const fetchRecentRooms = async () => {
    try {
      const response = await api.getRecentRooms();
      if (response.success) {
        setRecentRooms(response.rooms);
      }
    } catch (error) {
      console.error("Failed to load recent rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.getMyTeams();
      if (response.success) {
        setTeams(response.teams);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await api.getMyInvitations();
      if (response.success) {
        setInvitations(response.invitations);
      }
    } catch (error) {
      console.error("Failed to load invitations:", error);
    }
  };

  useEffect(() => {
    fetchRecentRooms();
    fetchTeams();
    fetchInvitations();
  }, []);

  const handleSelectSection = (section) => {
    if (section === "admin") {
      navigate("/admin");
    } else {
      setActiveSection(section);
    }
  };

  const handleCreateRoom = async (customId) => {
    try {
      setIsCreating(true);
      const response = await api.createRoom({
        roomId: customId || undefined,
      });
      toast.success(`Room ${response.room.roomId} created successfully.`);
      setIsCreateModalOpen(false);
      navigate(`/room/${response.room.roomId}`);
    } catch (error) {
      toast.error(error.message || "Unable to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (targetRoomId) => {
    const { roomId: nextRoomId, isValid } = validateRoomId(targetRoomId);

    if (!isValid) {
      toast.error("Enter a valid room ID.");
      return;
    }

    try {
      setIsJoining(true);
      await api.joinRoom({ roomId: nextRoomId });
      toast.success("Joining workspace...");
      setIsJoinModalOpen(false);
      navigate(`/room/${nextRoomId}`);
    } catch (error) {
      toast.error(error.message || "Unable to join that room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleRequestUpgrade = async () => {
    try {
      const response = await api.requestUpgrade();
      toast.success(response.message);
      await refreshUser();
    } catch (error) {
      toast.error(error.message || "Unable to request upgrade.");
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      toast.error("Enter a team name.");
      return;
    }

    try {
      const response = await api.createTeam({ name: newTeamName });
      toast.success(response.message);
      setNewTeamName("");
      await fetchTeams();
    } catch (error) {
      toast.error(error.message || "Unable to create team.");
    }
  };

  const handleInviteMember = async (teamId, e) => {
    e.preventDefault();
    const invitee = inviteMemberInputs[teamId];
    if (!invitee || !invitee.trim()) {
      toast.error("Enter a user ID, username, or email.");
      return;
    }

    try {
      const response = await api.inviteToTeam(teamId, { invitee });
      toast.success(response.message);
      setInviteMemberInputs((prev) => ({ ...prev, [teamId]: "" }));
    } catch (error) {
      toast.error(error.message || "Unable to send invitation.");
    }
  };

  const handleRespondInvitation = async (invitationId, action) => {
    try {
      const response = await api.respondToInvitation(invitationId, { action });
      toast.success(response.message);
      await Promise.all([fetchTeams(), fetchInvitations()]);
    } catch (error) {
      toast.error(error.message || "Unable to respond to invitation.");
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  // Helper: Determine exact role of current user in a given room/project
  const getUserProjectRole = (room) => {
    const creatorId = room.createdBy?._id || room.createdBy?.id || room.createdBy;
    const isOwner = creatorId && String(creatorId) === String(user?.id);
    return isOwner ? "Team Leader" : "Developer";
  };

  // Filtered rooms search
  const searchedRooms = recentRooms.filter((r) =>
    r.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered rooms by role tab
  const filteredRooms = searchedRooms.filter((room) => {
    const role = getUserProjectRole(room);
    if (projectRoleFilter === "lead") return role === "Team Leader";
    if (projectRoleFilter === "developer") return role === "Developer";
    return true;
  });

  const roomsLedCount = recentRooms.filter((r) => getUserProjectRole(r) === "Team Leader").length;
  const roomsDevCount = recentRooms.filter((r) => getUserProjectRole(r) === "Developer").length;

  // Build 3D Fan Carousel Cards for Dashboard
  const defaultFeatureCards = [
    {
      title: "Realtime Monaco IDE",
      tag: "STUDIO CODE EDITOR",
      description: "Multi-file editor with syntax highlights, multi-cursor sync, and typing indicators.",
      gradient: "from-cyan-900/90 via-slate-950 to-indigo-950",
      actionText: "Launch Studio",
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      title: "HD P2P WebRTC Call Stage",
      tag: "MEDIA CONFERENCING",
      description: "Screen share spotlight, active speaker highlights, and icon theme color customization.",
      gradient: "from-violet-900/90 via-slate-950 to-indigo-950",
      actionText: "Test Media Stage",
      onClick: () => setIsJoinModalOpen(true),
    },
    {
      title: "God Mode Surveillance",
      tag: "ADMIN TELEMETRY",
      description: "Complete room oversight, live feeds, system broadcasts, and permission overrides.",
      gradient: "from-amber-900/90 via-slate-950 to-rose-950",
      actionText: "Open Admin Panel",
      onClick: () => navigate("/admin"),
    },
    {
      title: "Polyglot Live Compiler",
      tag: "SANDBOX ENGINE",
      description: "Execute Python, JavaScript, C++, Java, and Rust in browser sandboxes.",
      gradient: "from-emerald-900/90 via-slate-950 to-teal-950",
      actionText: "Open Compiler",
      onClick: () => setActiveSection("compiler"),
    },
    {
      title: "Docker & Jenkins CI/CD",
      tag: "DEVOPS TELEMETRY",
      description: "Container builds, deployment status telemetry, and automated runner actions.",
      gradient: "from-blue-900/90 via-slate-950 to-cyan-950",
      actionText: "View Pipelines",
      onClick: () => setActiveSection("team"),
    },
    {
      title: "Git Branches & Offline PRs",
      tag: "VERSION CONTROL",
      description: "Create feature branches, commit code snapshots, and submit offline PRs.",
      gradient: "from-fuchsia-900/90 via-slate-950 to-purple-950",
      actionText: "Explore Projects",
      onClick: () => setActiveSection("projects"),
    },
    {
      title: "Encrypted JWT Sessions",
      tag: "RBAC AUTHENTICATION",
      description: "Role-based access control with secure socket authentication.",
      gradient: "from-slate-900/90 via-slate-950 to-violet-950",
      actionText: "Account Settings",
      onClick: () => setActiveSection("settings"),
    },
  ];

  // Dynamic calculations for project-driven analytics
  const totalProjectsCount = recentRooms.length;
  const totalActivityPercent = totalProjectsCount > 0
    ? Math.min(100, Math.max(25, Math.round(roomsLedCount * 35 + roomsDevCount * 25 + teams.length * 20)))
    : 0;

  const ledSegmentPercent = totalProjectsCount > 0 ? Math.round((roomsLedCount / totalProjectsCount) * 100) : 0;
  const devSegmentPercent = totalProjectsCount > 0 ? Math.round((roomsDevCount / totalProjectsCount) * 100) : 0;
  const teamSegmentPercent = totalProjectsCount > 0 ? Math.max(0, 100 - ledSegmentPercent - devSegmentPercent) : 100;

  const activeProject = recentRooms.length > 0 ? recentRooms[0] : null;
  const activeProjectRole = activeProject ? getUserProjectRole(activeProject) : "Developer";
  const activeProjectCodeLength = activeProject?.code ? activeProject.code.length : 0;
  const activeProjectProgress = activeProject
    ? Math.min(100, Math.max(35, Math.round((activeProjectCodeLength / 500) * 100)))
    : 0;

  const dynamicScheduleSessions = recentRooms.length > 0
    ? recentRooms.slice(0, 3).map((room) => {
        const role = getUserProjectRole(room);
        const isLead = role === "Team Leader";
        const d = new Date(room.updatedAt || room.createdAt || Date.now());
        const timeFormatted = Number.isNaN(d.getTime())
          ? "Recently Active"
          : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return {
          id: room.id || room.roomId,
          roomId: room.roomId,
          time: timeFormatted,
          title: `Room #${room.roomId}`,
          role,
          isLead,
          owner: room.createdBy?.username || "Dev",
          members: room.users?.length || 1,
        };
      })
    : [
        {
          id: "demo-compiler",
          roomId: "COMPILER",
          time: "Active Engine",
          title: "Polyglot Live Compiler",
          role: "Sandbox",
          isLead: true,
          owner: user?.username || "Developer",
          members: 1,
        },
      ];

  const weeklyHoursTotal = (totalProjectsCount * 3.2 + roomsLedCount * 2.1 + teams.length * 1.5).toFixed(1);
  const ideHours = (totalProjectsCount * 2.2 + roomsDevCount * 1.8).toFixed(1);
  const mediaCallHours = (teams.length * 1.8 + roomsLedCount * 1.4).toFixed(1);
  const compilerHours = Math.max(0.8, (totalProjectsCount * 0.9).toFixed(1));

  const weekDays = [
    { day: "Mon", factor: 0.55 },
    { day: "Tue", factor: 0.75 },
    { day: "Wed", factor: 0.90 },
    { day: "Thu", factor: 0.65 },
    { day: "Fri", factor: 1.00, active: true },
    { day: "Sat", factor: 0.80 },
    { day: "Sun", factor: 0.45 },
  ];

  const maxHours = Math.max(3.0, totalProjectsCount * 1.5 + 1.5);
  const activityBars = weekDays.map((w) => {
    const dayHrs = (maxHours * w.factor).toFixed(1);
    const heightPct = Math.min(100, Math.max(25, Math.round(w.factor * 100)));
    return {
      day: w.day,
      h: `${heightPct}%`,
      hours: `${dayHrs}h`,
      active: !!w.active,
    };
  });

  // Build 3D Fan Carousel Cards for Dashboard
  let dashboardCards = [];
  if (recentRooms.length > 0) {
    dashboardCards = recentRooms.map((room) => {
      const isLead = getUserProjectRole(room) === "Team Leader";
      return {
        title: `Room #${room.roomId}`,
        tag: isLead ? "PROJECT LEAD" : "DEVELOPER COLLAB",
        description: `Created by @${room.createdBy?.username || "Dev"} • ${room.users?.length || 1} Member(s) • Last active: ${formatDateTime(room.updatedAt)}`,
        gradient: isLead
          ? "from-amber-900/80 via-slate-950 to-indigo-950"
          : "from-cyan-900/80 via-slate-950 to-violet-950",
        actionText: "Enter Studio Room",
        onClick: () => navigate(`/room/${room.roomId}`),
      };
    });
  }

  // Ensure there are at least 7 cards for a full fanned carousel
  while (dashboardCards.length < 7) {
    dashboardCards.push(defaultFeatureCards[dashboardCards.length % defaultFeatureCards.length]);
  }

  return (
    <div className="flex h-screen max-h-screen app-shell font-display text-white selection:bg-blue-500/30 relative overflow-hidden p-1 sm:p-2 md:p-3 gap-2 md:gap-4">
      {/* Dynamic Animated Background Carousel with Ken Burns Motion & Particles */}
      <AnimatedBackground intervalDuration={6000} />

      {/* ================= LEFT SIDE PANEL (SIDEBAR) ================= */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        user={user}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        pendingInvitesCount={invitations.length}
      />

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          activeSection={activeSection}
          isConnected={isConnected}
          user={user}
          onOpenCreateRoom={() => setIsCreateModalOpen(true)}
          onOpenJoinRoom={() => setIsJoinModalOpen(true)}
          invitations={invitations}
          onRespondInvitation={handleRespondInvitation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 px-3 md:px-6 pb-8 min-w-0 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {/* SECTION 1: HOME OVERVIEW */}
            {activeSection === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-8"
              >
                {/* Apple HIG Enterprise Analytics Overview Panel */}
                <div className="glass-card-strong p-6 md:p-8 relative overflow-hidden space-y-6">
                  {/* Top Bar: Title & Quick Actions */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-[#30D158]" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                          Studio Workspace Analytics
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Developer Productivity & Projects Overview
                      </h2>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gradient-button text-xs flex items-center gap-1.5"
                      >
                        <PlusCircle size={15} /> Create Room
                      </button>
                      <button
                        onClick={() => setIsJoinModalOpen(true)}
                        className="subtle-button text-xs flex items-center gap-1.5"
                      >
                        <LogIn size={15} /> Join Workspace
                      </button>
                    </div>
                  </div>

                  {/* Executive KPI Cards & Progress Statistics */}
                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Progress Statistics Box (7 Cols) */}
                    <div className="lg:col-span-7 glass-card p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">Progress statistics</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-3xl font-extrabold text-white">{totalActivityPercent}%</span>
                            <span className="text-xs text-slate-400 font-medium">Total Activity</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#bef264] text-black shadow-sm">
                            {user?.role === "admin" ? "Admin Leader" : "Developer Pro"}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#22d3ee]/20 text-[#22d3ee] border border-[#22d3ee]/40">
                            {totalProjectsCount} Project{totalProjectsCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Multi-Color Segmented Slider Bar */}
                      <div className="space-y-1.5">
                        <div className="h-3 w-full rounded-full bg-slate-900/60 p-0.5 flex gap-1 overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-[#bef264] rounded-full transition-all duration-500"
                            style={{ width: `${totalProjectsCount > 0 ? ledSegmentPercent : 33}%` }}
                          />
                          <div
                            className="h-full bg-[#22d3ee] rounded-full transition-all duration-500"
                            style={{ width: `${totalProjectsCount > 0 ? devSegmentPercent : 33}%` }}
                          />
                          <div
                            className="h-full bg-[#fbbf24] rounded-full transition-all duration-500"
                            style={{ width: `${totalProjectsCount > 0 ? teamSegmentPercent : 34}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-400 px-0.5">
                          <span>{totalProjectsCount > 0 ? `${ledSegmentPercent}% Led` : "33% Led"}</span>
                          <span>{totalProjectsCount > 0 ? `${devSegmentPercent}% Dev` : "33% Dev"}</span>
                          <span>{totalProjectsCount > 0 ? `${teamSegmentPercent}% Teams` : "34% Teams"}</span>
                        </div>
                      </div>

                      {/* 3 Activity Metric Cards */}
                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center space-y-2 rounded-2xl">
                          <div className="h-10 w-10 rounded-full bg-[#bef264] text-black flex items-center justify-center font-bold shadow-md">
                            <Layers size={18} />
                          </div>
                          <span className="text-xl font-bold text-white">{roomsLedCount}</span>
                          <span className="text-xs text-slate-400 font-medium">Projects Led</span>
                        </div>

                        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center space-y-2 rounded-2xl">
                          <div className="h-10 w-10 rounded-full bg-[#22d3ee] text-black flex items-center justify-center font-bold shadow-md">
                            <CheckCircle2 size={18} />
                          </div>
                          <span className="text-xl font-bold text-white">{roomsDevCount}</span>
                          <span className="text-xs text-slate-400 font-medium">Collaborations</span>
                        </div>

                        <div className="glass-panel p-4 flex flex-col items-center justify-center text-center space-y-2 rounded-2xl">
                          <div className="h-10 w-10 rounded-full bg-[#fbbf24] text-black flex items-center justify-center font-bold shadow-md">
                            <FolderKanban size={18} />
                          </div>
                          <span className="text-xl font-bold text-white">{teams.length}</span>
                          <span className="text-xs text-slate-400 font-medium">Teams Roster</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Project/Course Card (5 Cols) */}
                    <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#bef264]/15 text-[#bef264] border border-[#bef264]/30">
                            Active Project Workspace
                          </span>
                          <span className="text-xs text-slate-400 font-mono">P2P Syncing</span>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-snug">
                          {activeProject ? `Room #${activeProject.roomId}` : "No Active Project Room"}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {activeProject
                            ? `Created by @${activeProject.createdBy?.username || "Dev"} • ${activeProject.users?.length || 1} Active Member(s) • Last active ${formatDateTime(activeProject.updatedAt)}`
                            : "Collaborative code workspace with real-time Monaco IDE, live WebRTC media call, and polyglot compiler feedback."}
                        </p>
                      </div>

                      {/* Pill Capsule Progress Indicator */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">
                            {activeProject ? `${activeProjectRole} Code Activity` : "Project Readiness"}
                          </span>
                          <span className="text-white font-bold">{activeProjectProgress}%</span>
                        </div>
                        <div className="h-4 w-full rounded-full bg-slate-900/60 p-0.5 border border-white/10 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${activeProjectProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Capsule Button */}
                      <button
                        onClick={() => {
                          if (activeProject) {
                            navigate(`/room/${activeProject.roomId}`);
                          } else {
                            setIsCreateModalOpen(true);
                          }
                        }}
                        className="w-full py-3 rounded-2xl bg-[#202434] hover:bg-[#282d42] border border-white/10 text-white font-semibold text-xs tracking-wide transition-all duration-150 shadow-md text-center"
                      >
                        {activeProject ? `Continue Studio (Room #${activeProject.roomId})` : "Create Workspace Room"}
                      </button>
                    </div>
                  </div>

                  {/* Main Grid: Schedule Cards & Activity Capsule Bar Chart */}
                  <div className="grid gap-6 lg:grid-cols-12 pt-2">
                    {/* Left Column: My Schedule Project Cards (7 Cols) */}
                    <div className="lg:col-span-7 glass-card p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">My schedule</h3>
                          <p className="text-xs text-slate-400">Active developer project sessions</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                          <button className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">&lt;</button>
                          <span>Today</span>
                          <button className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">&gt;</button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {dynamicScheduleSessions.map((session) => (
                          <div
                            key={session.id}
                            onClick={() => {
                              if (session.roomId && session.roomId !== "COMPILER") {
                                navigate(`/room/${session.roomId}`);
                              } else {
                                setActiveSection("compiler");
                              }
                            }}
                            className="glass-panel p-4 flex flex-col justify-between space-y-4 rounded-2xl cursor-pointer hover:border-violet-500/40 transition"
                          >
                            <span className="text-[11px] font-medium text-slate-400">{session.time}</span>
                            <h4 className="text-xs font-bold text-white leading-snug">{session.title}</h4>
                            <div>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                                  session.isLead ? "bg-[#bef264] text-black" : "bg-[#22d3ee] text-black"
                                }`}
                              >
                                {session.role}
                              </span>
                              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                                <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                                  {session.owner.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-[11px]">
                                  @{session.owner} ({session.members} Dev{session.members !== 1 ? "s" : ""})
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Activity Vertical Capsule Bar Chart (5 Cols) */}
                    <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">Activity</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-white">{weeklyHoursTotal}</span>
                            <span className="text-xs text-slate-400">Hours spend</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          last 7 days
                        </span>
                      </div>

                      {/* Smooth Vertical Capsule Pill Bar Chart */}
                      <div className="relative pt-6 pb-2">
                        {/* Floating Tooltip Pill */}
                        <div className="absolute top-0 right-10 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22d3ee] text-black shadow-lg">
                          {activityBars.find((b) => b.active)?.hours || "4.2 hours"}
                        </div>

                        <div className="flex items-end justify-between h-32 px-1 gap-2">
                          {activityBars.map((bar) => (
                            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full bg-[#181c28] rounded-full h-28 flex items-end p-0.5 overflow-hidden">
                                <div
                                  className={`w-full rounded-full transition-all duration-500 ${
                                    bar.active
                                      ? "bg-white shadow-[0_0_24px_rgba(255,255,255,0.7)]"
                                      : "bg-[#282d3e]"
                                  }`}
                                  style={{ height: bar.h }}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-slate-400">{bar.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Platform Activity Summary List */}
                      <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By Workspace Component</span>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="text-[#bef264]">✓</span> {totalProjectsCount} Realtime IDE Rooms
                          </span>
                          <span className="font-semibold text-white">{ideHours} h</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="text-[#22d3ee]">✓</span> {teams.length} Team Media Calls
                          </span>
                          <span className="font-semibold text-white">{mediaCallHours} h</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <span className="text-[#fbbf24]">✓</span> Polyglot Live Compiler
                          </span>
                          <span className="font-semibold text-white">{compilerHours} h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3D GSAP Social Cards Interactive Fan Carousel Section */}
                <div className="glass-card p-6 border border-white/10 overflow-hidden relative">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="panel-title flex items-center gap-1">
                        <Sparkles size={12} className="text-cyan-400" /> 3D Fan Carousel
                      </p>
                      <h3 className="text-lg font-extrabold text-white">Active Workspaces & Studio Capabilities</h3>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                      Hover to Expand • Click to Launch
                    </span>
                  </div>

                  <SocialCards cards={dashboardCards} />
                </div>

                {/* Quick Recent Activity Overview */}
                <div className="glass-card p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="panel-title">Active Workspaces</p>
                      <h3 className="text-lg font-bold text-white">Your Undertaken Projects</h3>
                    </div>
                    <button
                      onClick={() => setActiveSection("projects")}
                      className="text-xs text-violet-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      View All Projects <ArrowRight size={14} />
                    </button>
                  </div>

                  {searchedRooms.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-8 text-center border border-dashed border-white/10 rounded-2xl">
                      No active workspace history found. Create your first room to get started!
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {searchedRooms.slice(0, 3).map((room) => {
                        const userRole = getUserProjectRole(room);
                        const isTeamLead = userRole === "Team Leader";

                        return (
                          <div
                            key={room.id}
                            className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:border-violet-500/30 transition flex flex-col justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-bold text-white">#{room.roomId}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isTeamLead
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                }`}>
                                  {isTeamLead ? <Crown size={10} /> : <Laptop size={10} />}
                                  {userRole}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-2">Updated {formatDateTime(room.updatedAt)}</p>
                            </div>

                            <button
                              onClick={() => navigate(`/room/${room.roomId}`)}
                              className="subtle-button text-xs py-2 px-3 w-full flex items-center justify-center gap-1 font-semibold"
                            >
                              Enter Room <ArrowRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION 2: PROJECTS & ROOMS */}
            {activeSection === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card p-6 md:p-8 border border-white/10 flex flex-col gap-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="panel-title">Projects & Rooms Directory</p>
                    <h2 className="text-2xl font-bold text-white">Undertaken Projects & Assigned Roles</h2>
                  </div>

                  {/* Filter Tabs by Role */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                      <button
                        onClick={() => setProjectRoleFilter("all")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          projectRoleFilter === "all" ? "bg-violet-500/20 text-white border border-violet-500/30" : "text-slate-400"
                        }`}
                      >
                        All ({recentRooms.length})
                      </button>
                      <button
                        onClick={() => setProjectRoleFilter("lead")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                          projectRoleFilter === "lead" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400"
                        }`}
                      >
                        <Crown size={12} /> Led by Me ({roomsLedCount})
                      </button>
                      <button
                        onClick={() => setProjectRoleFilter("developer")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                          projectRoleFilter === "developer" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400"
                        }`}
                      >
                        <Laptop size={12} /> Developer ({roomsDevCount})
                      </button>
                    </div>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gradient-button px-4 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <PlusCircle size={15} /> New Room
                    </button>
                  </div>
                </div>

                {isLoadingRooms ? (
                  <div className="h-40 w-full skeleton-bar" />
                ) : filteredRooms.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-16 text-center border border-dashed border-white/10 rounded-2xl">
                    No projects found for the selected role filter.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredRooms.map((room) => {
                      const userRole = getUserProjectRole(room);
                      const isTeamLead = userRole === "Team Leader";

                      return (
                        <div
                          key={room.id}
                          className="p-5 rounded-2xl border border-white/10 bg-slate-950/60 hover:border-violet-500/40 transition flex flex-col justify-between gap-4 shadow-glass"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-base font-bold text-white tracking-wider">
                                #{room.roomId}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isTeamLead
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                                }`}
                              >
                                {isTeamLead ? <Crown size={11} /> : <Laptop size={11} />}
                                {userRole}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 mt-2">
                              <strong>Owner:</strong> @{room.createdBy?.username || "Developer"}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              <strong>Last active:</strong> {formatDateTime(room.updatedAt)}
                            </p>

                            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Active Team Members</span>
                              <span className="font-bold text-white">{room.users?.length || 1} Developer(s)</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/room/${room.roomId}`)}
                            className="gradient-button text-xs py-2.5 px-4 w-full flex items-center justify-center gap-2 font-bold shadow-glow"
                          >
                            Launch Studio <ArrowRight size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* SECTION 3: TEAM HUB */}
            {activeSection === "team" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card p-6 md:p-8 border border-white/10 flex flex-col gap-6"
              >
                <div>
                  <p className="panel-title">Team Hub & Undertaken Roles</p>
                  <h2 className="text-2xl font-bold text-white">Project Teams & Member Roles Overview</h2>
                </div>

                {/* Undertaken Projects & Roles Table Summary */}
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                    <Shield size={14} /> My Undertaken Project Roles Summary
                  </h4>

                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {recentRooms.map((room) => {
                      const role = getUserProjectRole(room);
                      const isLead = role === "Team Leader";
                      return (
                        <div
                          key={room.id}
                          onClick={() => navigate(`/room/${room.roomId}`)}
                          className="p-3 rounded-xl border border-white/5 bg-slate-900/60 hover:border-violet-500/30 cursor-pointer transition flex items-center justify-between"
                        >
                          <div>
                            <p className="font-mono text-xs font-bold text-white">#{room.roomId}</p>
                            <p className="text-[10px] text-slate-400">Owner: @{room.createdBy?.username || "Dev"}</p>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              isLead
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                            }`}
                          >
                            {isLead ? <Crown size={9} /> : <Laptop size={9} />}
                            {role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Left: My Teams */}
                  <div className="flex flex-col gap-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">My Teams Roster</h4>

                    <form onSubmit={handleCreateTeam} className="flex gap-2">
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Enter new team name..."
                        className="input-shell text-xs py-2.5 px-4 flex-1"
                      />
                      <button
                        type="submit"
                        className="gradient-button text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 shrink-0"
                      >
                        <PlusCircle size={14} /> Create Team
                      </button>
                    </form>

                    {isLoadingTeams ? (
                      <div className="h-20 w-full skeleton-bar" />
                    ) : teams.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-8 text-center border border-dashed border-white/10 rounded-2xl">
                        You are not in any teams yet. Create your first team above!
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
                        {teams.map((team) => {
                          const isOwner = team.owner?._id === user?.id;
                          return (
                            <div
                              key={team._id}
                              className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 hover:border-violet-500/30 transition"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-white text-sm">{team.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isOwner
                                    ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
                                    : "text-cyan-300 bg-cyan-500/10 border-cyan-500/20"
                                }`}>
                                  {isOwner ? "Team Leader / Owner" : "Developer"}
                                </span>
                              </div>

                              <div className="mt-2 text-xs text-slate-400">
                                <strong className="text-slate-300">Members:</strong>{" "}
                                {team.members.map((m) => `@${m.username}`).join(", ")}
                              </div>

                              <form
                                onSubmit={(e) => handleInviteMember(team._id, e)}
                                className="mt-3 flex gap-2"
                              >
                                <input
                                  type="text"
                                  value={inviteMemberInputs[team._id] || ""}
                                  onChange={(e) =>
                                    setInviteMemberInputs((prev) => ({
                                      ...prev,
                                      [team._id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Invite by ID, username, or email..."
                                  className="input-shell text-xs py-2 px-3 flex-1 bg-black/60"
                                />
                                <button
                                  type="submit"
                                  className="subtle-button text-[11px] py-2 px-3 flex items-center gap-1 font-bold shrink-0"
                                >
                                  <Send size={12} /> Invite
                                </button>
                              </form>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Pending Invitations */}
                  <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:border-white/10 lg:pt-0 lg:pl-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300">Pending Requests</h4>

                    {invitations.length === 0 ? (
                      <div className="text-xs text-slate-400 italic py-12 text-center border border-dashed border-white/10 rounded-2xl">
                        No pending team invitations.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
                        {invitations.map((inv) => (
                          <div
                            key={inv._id}
                            className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 flex flex-col gap-3"
                          >
                            <p className="text-xs text-white">
                              <strong className="text-violet-300">@{inv.senderId?.username}</strong> invited you to join team{" "}
                              <strong className="text-white">"{inv.teamId?.name}"</strong>
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespondInvitation(inv._id, "accept")}
                                className="gradient-button text-[11px] py-2 px-4 flex-1 font-bold text-center flex items-center justify-center gap-1"
                              >
                                <Check size={14} /> Accept
                              </button>
                              <button
                                onClick={() => handleRespondInvitation(inv._id, "reject")}
                                className="subtle-button text-[11px] py-2 px-4 flex-1 font-bold text-center border-rose-500/20 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-1"
                              >
                                <X size={14} /> Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 4: COMPILER PLAYGROUND */}
            {activeSection === "compiler" && (
              <motion.div
                key="compiler"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <CompilerPlayground />
              </motion.div>
            )}

            {/* SECTION 5: SETTINGS & PROFILE */}
            {activeSection === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <UserSettings user={user} onRequestUpgrade={handleRequestUpgrade} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        isCreating={isCreating}
        user={user}
        onRequestUpgrade={handleRequestUpgrade}
      />

      <JoinRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinRoom={handleJoinRoom}
        isJoining={isJoining}
      />
    </div>
  );
}

export default Home;
