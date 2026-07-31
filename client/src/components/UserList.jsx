import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Bell, X, Shield, Code, CheckCircle, Clock, GitCommit, Zap, Crown, Sliders, Check, Settings } from "lucide-react";
import toast from "react-hot-toast";

// Default assigned team member roles for project workspace
const DEFAULT_TEAM_ROLES = {
  admin: "Team Leader",
  leader: "Team Leader",
  dev1: "Frontend Engineer",
  dev2: "Backend Architect",
  dev3: "Fullstack Developer",
};

function UserList({ users = [], roomMeta = null, history = [], currentUserId, onPingUser }) {
  const [selectedMember, setSelectedMember] = useState(null);

  // Local state for developer roles assigned by Team Leader
  const [assignedRoles, setAssignedRoles] = useState(DEFAULT_TEAM_ROLES);
  const [editingRoleText, setEditingRoleText] = useState("");
  const [isEditingRole, setIsEditingRole] = useState(false);

  // Check if current user is Team Leader / Room Creator
  const isTeamLead =
    roomMeta?.createdBy?._id === currentUserId ||
    roomMeta?.createdBy?.id === currentUserId ||
    roomMeta?.createdBy === currentUserId;

  // Derive project team list: merge online room users with room assigned users if available
  const activeUserIds = new Set(users.map((u) => u.id));

  // Build full project team roster
  const allTeamMembers = [...users];

  // Add room owner/creator if not in active users list
  if (roomMeta?.createdBy && !activeUserIds.has(roomMeta.createdBy.id || roomMeta.createdBy._id)) {
    allTeamMembers.push({
      id: roomMeta.createdBy.id || roomMeta.createdBy._id,
      username: roomMeta.createdBy.username || "Team Lead",
      email: roomMeta.createdBy.email || "lead@codetmc.dev",
      role: "admin",
      isOffline: true,
    });
  }

  const handlePingClick = (e, member) => {
    e.stopPropagation();
    if (onPingUser) {
      onPingUser(member);
    } else {
      toast.success(`🚨 Alert notification sent to @${member.username}!`);
    }
  };

  const handleSaveAssignedRole = (memberId) => {
    if (!editingRoleText.trim()) return;
    setAssignedRoles((prev) => ({
      ...prev,
      [memberId]: editingRoleText.trim(),
    }));
    toast.success(`Updated role title to "${editingRoleText.trim()}"`);
    setIsEditingRole(false);
  };

  const getMemberCommits = (username) => {
    return history.filter((h) => h.savedBy?.toLowerCase() === username?.toLowerCase());
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card flex flex-col p-4 border border-white/10 bg-slate-950/80 rounded-2xl shadow-glass"
    >
      {/* Header Bar */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-violet-400" />
          <h2 className="text-xs font-bold text-white tracking-tight">Project Team & Roster</h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          {isTeamLead && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Crown size={10} /> Team Leader
            </span>
          )}
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {users.length} In Room
          </span>
        </div>
      </div>

      {/* Member Roster List */}
      <div className="scrollbar-thin space-y-2 overflow-y-auto max-h-[260px] pr-1">
        {allTeamMembers.length ? (
          allTeamMembers.map((member) => {
            const isOnline = activeUserIds.has(member.id) && !member.isOffline;
            const isCurrent = member.id === currentUserId;
            const userCommits = getMemberCommits(member.username);

            const memberRole =
              member.role === "admin"
                ? "Team Leader"
                : assignedRoles[member.id] || "Fullstack Dev";

            const initials = member.username
              ? member.username
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "DEV";

            return (
              <div
                key={member.id}
                onClick={() => {
                  setSelectedMember({ ...member, roleTitle: memberRole, isOnline, userCommits });
                  setEditingRoleText(memberRole);
                }}
                className={`group flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition ${
                  isCurrent
                    ? "border-violet-500/40 bg-violet-500/10 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                    : "border-white/5 bg-slate-900/50 hover:bg-slate-900/80 hover:border-violet-500/30"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar & Online Dot Status */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-xs text-white shadow-sm border border-white/10">
                    {initials}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${
                        isOnline ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-500"
                      }`}
                      title={isOnline ? "Online & In Room" : "Offline"}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-xs font-bold text-white">
                        @{member.username} {isCurrent ? "(You)" : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-medium text-slate-400 truncate">
                        {memberRole}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/5 text-violet-300 border border-white/10">
                        {userCommits.length} commits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator & Alert Nudge Button */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      isOnline
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800/60 text-slate-400 border-white/5"
                    }`}
                  >
                    {isOnline ? "In Room" : "Offline"}
                  </span>

                  {!isCurrent && (
                    <button
                      onClick={(e) => handlePingClick(e, member)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition"
                      title={`Send Alert Request to @${member.username}`}
                    >
                      <Bell size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-6 text-center text-xs text-slate-400">
            No team members found.
          </div>
        )}
      </div>

      {/* ================= TEAMMATE CONTRIBUTION & LEADERSHIP MODAL ================= */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-5 shadow-2xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 font-bold text-sm text-white shadow-glow">
                    {selectedMember.username?.slice(0, 2).toUpperCase()}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${
                        selectedMember.isOnline ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-slate-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">@{selectedMember.username}</h3>
                    <p className="text-xs font-semibold text-violet-300">{assignedRoles[selectedMember.id] || selectedMember.roleTitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Team Lead Management Section */}
              {isTeamLead && (
                <div className="p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown size={14} /> Team Leader Role Control
                  </span>

                  {isEditingRole ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingRoleText}
                        onChange={(e) => setEditingRoleText(e.target.value)}
                        placeholder="e.g. Lead Frontend Engineer"
                        className="input-shell text-xs py-1.5 px-3 flex-1 bg-black/60"
                      />
                      <button
                        onClick={() => handleSaveAssignedRole(selectedMember.id)}
                        className="gradient-button px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                      >
                        <Check size={14} /> Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingRole(true)}
                      className="subtle-button text-xs py-1.5 px-3 w-full flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Settings size={13} strokeWidth={2.5} /> Assign Specific Role Title
                    </button>
                  )}
                </div>
              )}

              {/* Status & Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <GitCommit size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Saved Commits</p>
                    <p className="text-sm font-bold text-white">{selectedMember.userCommits?.length || 0}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Room Presence</p>
                    <p className="text-xs font-bold text-emerald-300">
                      {selectedMember.isOnline ? "🟢 Active in Room" : "⚪ Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contribution Activity Log */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock size={13} className="text-violet-400" />
                  Code Snapshots & Contribution History
                </p>

                <div className="max-h-40 overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
                  {selectedMember.userCommits && selectedMember.userCommits.length > 0 ? (
                    selectedMember.userCommits.map((entry, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-slate-950 p-2 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-violet-400 font-bold">#{idx + 1}</span>
                          <span className="text-slate-300">{entry.language} snapshot</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-500">
                      No code snapshots committed yet by @{selectedMember.username}.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={(e) => {
                    handlePingClick(e, selectedMember);
                    setSelectedMember(null);
                  }}
                  className="flex-1 gradient-button py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow"
                >
                  <Bell size={13} /> Request & Alert Teammate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

export default UserList;
