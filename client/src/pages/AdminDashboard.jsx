import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Users, Activity, Clock, ShieldAlert, MonitorPlay, Key, Search, Trash2, ArrowUpCircle } from "lucide-react";
import FullPageLoader from "../components/FullPageLoader.jsx";
import ModalShell from "../components/ModalShell.jsx";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";
import { formatDate, formatDateTime, formatDurationMs } from "../utils/formatters.js";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#8884d8"];

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [sessionsLogs, setSessionsLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "upgrades"
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Room Control
  const [joinRoomId, setJoinRoomId] = useState("");

  const loadDashboard = async (options = {}) => {
    const shouldUseBlockingLoader = Boolean(options.withLoader);

    if (shouldUseBlockingLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [statsRes, usersRes, analyticsRes, sessionsRes, upgradesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminAnalytics(),
        api.getAdminSessions(),
        api.getUpgradeRequests()
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setAnalytics(analyticsRes.analytics);
      setSessionsLogs(sessionsRes.sessions);
      setUpgradeRequests(upgradesRes.requests);
    } catch (error) {
      toast.error(error.message || "Unable to load admin dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard({ withLoader: true });
  }, []);

  const handleOpenDetails = async (member) => {
    setIsDetailsOpen(true);
    setSelectedUser(member);
    setIsDetailLoading(true);

    try {
      const response = await api.getAdminUserDetails(member.id);
      setSelectedUser(response.user);
    } catch (error) {
      toast.error(error.message || "Unable to load user details.");
      setIsDetailsOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;

    try {
      setIsDeleting(true);
      await api.deleteAdminUser(deleteCandidate.id);
      toast.success(`${deleteCandidate.username} deleted.`);
      setUsers((prev) => prev.filter((m) => m.id !== deleteCandidate.id));
      if (selectedUser?.id === deleteCandidate.id) {
        setSelectedUser(null);
        setIsDetailsOpen(false);
      }
      setDeleteCandidate(null);
      loadDashboard();
    } catch (error) {
      toast.error(error.message || "Unable to delete that user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpgradeRole = async (memberId) => {
    try {
      const res = await api.upgradeUserRole(memberId);
      toast.success(res.message);
      setUsers(prev => prev.map(u => u.id === memberId ? { ...u, role: res.role } : u));
    } catch (error) {
      toast.error(error.message || "Unable to upgrade role.");
    }
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
      if (selectedUser) {
        setSelectedUser((prev) => ({
          ...prev,
          recentRooms: prev.recentRooms.filter((r) => r.roomId !== roomId),
        }));
      }
    } catch (error) {
      toast.error(error.message || "Failed to terminate room.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const roleData = useMemo(() => {
    const adminCount = users.filter(u => u.role === "admin").length;
    const userCount = users.length - adminCount;
    return [
      { name: "Admin", value: adminCount },
      { name: "User", value: userCount }
    ];
  }, [users]);

  if (isLoading) {
    return (
      <div className="app-shell min-h-screen px-4 py-6 md:px-8 bg-apple-bg text-apple-text">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-8">
          <Navbar isConnected={isConnected} user={user} onLogout={logout} />
          <FullPageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen px-4 py-6 md:px-8 bg-apple-bg text-apple-text font-display">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-8">
        <Navbar isConnected={isConnected} user={user} onLogout={logout} />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-apple-card/60 px-8 py-10 backdrop-blur-xl shadow-glass"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-apple-blue/10 text-apple-blue text-sm font-medium mb-4">
                <ShieldAlert size={16} /> Admin Portal
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Command Center
              </h1>
              <p className="mt-3 max-w-xl text-apple-textMuted text-lg">
                Real-time monitoring, analytics, and control over the entire platform.
              </p>
            </div>
            <button
              onClick={() => loadDashboard()}
              disabled={isRefreshing}
              className="px-6 py-3 rounded-full bg-apple-blue/10 hover:bg-apple-blue/20 text-apple-blue transition-all font-semibold backdrop-blur-md border border-apple-blue/20 flex items-center gap-2"
            >
              <Activity size={18} /> {isRefreshing ? "Syncing..." : "Sync Data"}
            </button>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-400" },
            { title: "Active Rooms", value: stats?.activeRooms, icon: MonitorPlay, color: "text-emerald-400" },
            { title: "Total Sessions", value: analytics?.totalSessions, icon: Activity, color: "text-purple-400" },
            { title: "Avg Session (ms)", value: Math.round(analytics?.avgSessionDuration || 0), icon: Clock, color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 p-4 opacity-20 ${stat.color}`}>
                <stat.icon size={64} />
              </div>
              <p className="text-slate-400 font-medium mb-2">{stat.title}</p>
              <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
            </motion.div>
          ))}
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Daily Active Users Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-6 text-white">Daily Active Users</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={analytics?.dailyActiveUsers || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Roles Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">User Roles Distribution</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Action Panel: Room Join & Sessions */}
        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 p-6 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold mb-4 text-indigo-300 flex items-center gap-2">
              <Key size={20} /> God Mode Access
            </h3>
            <p className="text-sm text-slate-400 mb-6">Join any active room invisibly or to manage it.</p>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-4 py-3 transition-colors shadow-lg shadow-indigo-500/20"
              >
                Infiltrate Room
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 p-6 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-4 text-white">Recent Session Logs</h3>
            <div className="flex-1 overflow-auto max-h-[250px] pr-2 custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">User</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Duration (ms)</th>
                    <th className="px-4 py-3 rounded-tr-lg rounded-br-lg">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsLogs.slice(0, 15).map((log, i) => (
                    <tr key={log._id || i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-slate-200">{log.userId?.username || "Unknown"}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{log.roomId?.roomId || "N/A"}</td>
                      <td className="px-4 py-3 text-emerald-400">{log.duration || 0}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDateTime(log.joinTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>

        {/* Users Directory */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h3 className="text-xl font-semibold text-white">User Directory</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    activeTab === "users" ? "bg-apple-blue text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setActiveTab("upgrades")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                    activeTab === "upgrades" ? "bg-apple-blue text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Upgrades
                  {upgradeRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {upgradeRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {activeTab === "users" && (
              <div className="flex gap-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-950 border border-white/10 rounded-full text-sm focus:outline-none focus:border-indigo-500 w-full md:w-64"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-950 border border-white/10 rounded-full text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {activeTab === "users" ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Activity</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">@{member.username}</div>
                        <div className="text-slate-400">{member.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase border ${
                          member.role === 'admin' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
                          <span className="text-slate-300">{member.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <div>{member.totalSessions} sessions</div>
                        <div className="text-xs">Time: {Math.round((member.totalTimeSpent || 0)/60000)}m</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpgradeRole(member.id)}
                            className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                            title="Toggle Role"
                          >
                            <ArrowUpCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenDetails(member)}
                            className="px-3 py-1.5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(member)}
                            disabled={member.id === user?.id}
                            className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6">
                {upgradeRequests.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No pending upgrade requests.</p>
                ) : (
                  <div className="grid gap-4">
                    {upgradeRequests.map((req) => (
                      <div key={req._id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                        <div>
                          <p className="font-semibold text-white">@{req.username}</p>
                          <p className="text-sm text-slate-400">{req.email}</p>
                          <p className="text-xs text-apple-blue mt-1">Requested to lift daily room limit</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveUpgrade(req._id, "approve")}
                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleResolveUpgrade(req._id, "reject")}
                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>

      </div>

      {/* Details Modal */}
      <ModalShell isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="User Profile">
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <p className="text-slate-300"><strong className="text-white block mb-1">Email</strong> {selectedUser.email}</p>
              <p className="text-slate-300"><strong className="text-white block mb-1">Role</strong> {selectedUser.role}</p>
              <p className="text-slate-300"><strong className="text-white block mb-1">Joined</strong> {formatDateTime(selectedUser.createdAt)}</p>
              <p className="text-slate-300"><strong className="text-white block mb-1">Total Sessions</strong> {selectedUser.totalSessions || 0}</p>
              <p className="text-slate-300"><strong className="text-white block mb-1">Total Time</strong> {Math.round((selectedUser.totalTimeSpent||0)/60000)} mins</p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="font-semibold text-white mb-4">Active & Recent Rooms</h4>
              {isDetailLoading ? (
                <p className="text-sm text-slate-400">Loading rooms...</p>
              ) : selectedUser.recentRooms && selectedUser.recentRooms.length > 0 ? (
                <div className="space-y-3">
                  {selectedUser.recentRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-slate-900/50">
                      <div>
                        <p className="font-mono text-sm text-apple-blue font-semibold">{room.roomId}</p>
                        <p className="text-xs text-slate-400 mt-1">{room.collaboratorCount} collaborators</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/room/${room.roomId}`)}
                          className="px-3 py-1.5 text-xs bg-apple-blue/20 text-apple-blue rounded-lg hover:bg-apple-blue/30"
                        >
                          Join
                        </button>
                        <button
                          onClick={() => handleTerminateRoom(room.roomId)}
                          className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                          Terminate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No recent rooms found.</p>
              )}
            </div>
          </div>
        )}
      </ModalShell>

      {/* Delete Confirmation Modal */}
      <ModalShell isOpen={Boolean(deleteCandidate)} onClose={() => setDeleteCandidate(null)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-300">Are you sure you want to delete <strong className="text-white">@{deleteCandidate?.username}</strong>?</p>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setDeleteCandidate(null)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/10">Cancel</button>
            <button onClick={handleDeleteUser} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium">
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </ModalShell>

    </div>
  );
}

export default AdminDashboard;
