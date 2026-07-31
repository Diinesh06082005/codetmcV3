import { motion, AnimatePresence } from "framer-motion";
import { GitPullRequest, CheckCircle2, XCircle, X, User } from "lucide-react";
import toast from "react-hot-toast";

function PullRequestModal({ isOpen, onClose, pendingPRs = [], onApprovePR, onRejectPR }) {
  if (!isOpen) return null;

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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <GitPullRequest size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Offline Code Review & PR Approvals</h3>
                <p className="text-xs text-slate-400">Team Leader Code Merge Review Center</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Pending PR List */}
          <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {pendingPRs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 italic border border-dashed border-white/10 rounded-2xl text-xs">
                No pending offline code submissions right now.
              </div>
            ) : (
              pendingPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 font-bold text-xs text-white">
                        {pr.author ? pr.author.slice(0, 2).toUpperCase() : "U"}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs">@{pr.author}</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          submitted offline code PR
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(pr.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {pr.note && (
                    <p className="text-xs text-slate-300 bg-white/5 p-2 rounded-xl border border-white/5">
                      <strong className="text-violet-300">Commit Note:</strong> "{pr.note}"
                    </p>
                  )}

                  <div className="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-xs text-slate-200 scrollbar-thin">
                    <pre className="whitespace-pre-wrap">{pr.code}</pre>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => onRejectPR(pr.id)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold hover:bg-rose-500/20 transition flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => onApprovePR(pr)}
                      className="gradient-button text-xs font-bold px-5 py-2 flex items-center gap-1.5 shadow-glow"
                    >
                      <CheckCircle2 size={14} /> Accept & Push to Screen
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PullRequestModal;
