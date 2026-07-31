import { motion } from "framer-motion";

function HistoryLog({ history, onRollback }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card flex flex-col gap-3 p-5 border border-white/10 max-h-[320px] overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="panel-title">Audit Trail</p>
          <h4 className="text-xs font-bold text-white tracking-tight mt-0.5">Code Snapshots & Rollback</h4>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-violet-300 bg-violet-500/10 border-violet-500/20">
          {history.length} Snapshots
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-xs text-apple-textMuted italic text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            No save points yet. Click 'Save Snapshot' or press Ctrl+S to save state.
          </div>
        ) : (
          [...history].reverse().map((entry, idx) => {
            const timeStr = new Date(entry.timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <motion.button
                key={entry._id || idx}
                whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRollback(entry)}
                className="flex items-center justify-between text-left p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:border-violet-500/30 transition duration-200 w-full"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-semibold text-white truncate">
                    Saved by @{entry.savedBy}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {dateStr} at {timeStr}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">
                    {entry.language}
                  </span>
                  <div className="p-1 rounded-lg bg-white/5 text-violet-400 hover:text-white hover:bg-violet-600 transition">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </motion.section>
  );
}

export default HistoryLog;
