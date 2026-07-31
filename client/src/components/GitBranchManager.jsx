import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, GitCommit, GitMerge, AlertTriangle, Plus, Check, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function GitBranchManager({
  isOpen,
  onClose,
  branches,
  activeBranch,
  onCreateBranch,
  onSwitchBranch,
  onCommitChanges,
  onMergeBranch,
  currentCode,
}) {
  const [newBranchName, setNewBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [sourceBranch, setSourceBranch] = useState("main");
  const [targetBranch, setTargetBranch] = useState(activeBranch);
  const [activeTab, setActiveTab] = useState("branches"); // "branches" | "commit" | "merge"

  if (!isOpen) return null;

  const handleCreateBranchSubmit = (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) {
      toast.error("Enter a valid branch name.");
      return;
    }
    const sanitized = newBranchName.trim().toLowerCase().replace(/\s+/g, "-");
    onCreateBranch(sanitized);
    setNewBranchName("");
  };

  const handleCommitSubmit = (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) {
      toast.error("Enter a commit message.");
      return;
    }
    onCommitChanges(commitMessage.trim());
    setCommitMessage("");
  };

  const handleMergeSubmit = (e) => {
    e.preventDefault();
    if (sourceBranch === targetBranch) {
      toast.error("Source and target branches must be different.");
      return;
    }
    onMergeBranch(sourceBranch, targetBranch);
  };

  // Simple diff conflict simulation
  const sourceCode = branches[sourceBranch]?.code || "";
  const targetCode = branches[targetBranch]?.code || "";
  const sourceLines = sourceCode.split("\n");
  const targetLines = targetCode.split("\n");

  const hasConflict = sourceCode !== targetCode && sourceCode.length > 0 && targetCode.length > 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-6 backdrop-blur-2xl shadow-glass"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30">
                <GitBranch size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">Git Version Control</h3>
                  <span className="font-mono text-xs font-bold text-violet-300 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                    {activeBranch}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Branching, commit history, and code conflict resolution</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 my-4 pb-2 text-xs">
            <button
              onClick={() => setActiveTab("branches")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === "branches"
                  ? "bg-violet-500/20 text-white border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitBranch size={14} /> Branches ({Object.keys(branches).length})
            </button>

            <button
              onClick={() => setActiveTab("commit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === "commit"
                  ? "bg-violet-500/20 text-white border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitCommit size={14} /> Commit Changes
            </button>

            <button
              onClick={() => setActiveTab("merge")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                activeTab === "merge"
                  ? "bg-violet-500/20 text-white border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitMerge size={14} /> Merge & Conflict Checker
            </button>
          </div>

          {/* TAB 1: BRANCHES */}
          {activeTab === "branches" && (
            <div className="space-y-4">
              <form onSubmit={handleCreateBranchSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. feature/live-video"
                  className="input-shell text-xs py-2.5 px-4 font-mono lowercase flex-1"
                />
                <button
                  type="submit"
                  className="gradient-button text-xs font-bold px-4 py-2.5 flex items-center gap-1 shrink-0"
                >
                  <Plus size={14} /> Create Branch
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {Object.keys(branches).map((bName) => {
                  const b = branches[bName];
                  const isCurrent = bName === activeBranch;
                  return (
                    <div
                      key={bName}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition ${
                        isCurrent
                          ? "border-violet-500/40 bg-violet-500/10 text-white"
                          : "border-white/5 bg-slate-950/40 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GitBranch size={16} className={isCurrent ? "text-violet-400" : "text-slate-400"} />
                        <div>
                          <span className="font-mono font-bold">{bName}</span>
                          <p className="text-[10px] text-slate-400">
                            Last commit: "{b?.lastCommit || "Initial code"}"
                          </p>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => onSwitchBranch(bName)}
                          className="subtle-button text-[11px] py-1 px-3 font-semibold"
                        >
                          Checkout
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: COMMIT */}
          {activeTab === "commit" && (
            <form onSubmit={handleCommitSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl border border-white/10 bg-black/50 font-mono text-xs text-slate-300">
                <span className="text-slate-500">Committing on branch:</span>{" "}
                <strong className="text-violet-300">{activeBranch}</strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Commit Message
                </label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="e.g. feat: add WebRTC permission controls"
                  className="input-shell text-xs py-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="subtle-button text-xs py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gradient-button text-xs py-2.5 px-6 font-bold flex items-center gap-1.5"
                >
                  <GitCommit size={14} /> Commit Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MERGE & CONFLICT CHECKER */}
          {activeTab === "merge" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Source Branch (From)</label>
                  <select
                    value={sourceBranch}
                    onChange={(e) => setSourceBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  >
                    {Object.keys(branches).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Branch (Into)</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  >
                    {Object.keys(branches).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conflict Status Alert */}
              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                hasConflict
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}>
                {hasConflict ? <AlertTriangle size={18} /> : <Check size={18} />}
                <div>
                  <strong className="block">
                    {hasConflict ? "Branch Conflict Detected" : "Clean Merge Available"}
                  </strong>
                  <span>
                    {hasConflict
                      ? `Differences exist between '${sourceBranch}' and '${targetBranch}'. Merging will update code.`
                      : `Both branches are synchronized with zero code conflicts.`}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="subtle-button text-xs py-2.5 px-5"
                >
                  Close
                </button>
                <button
                  onClick={handleMergeSubmit}
                  disabled={sourceBranch === targetBranch}
                  className="gradient-button text-xs py-2.5 px-6 font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  <GitMerge size={14} /> Merge '{sourceBranch}' into '{targetBranch}'
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GitBranchManager;
