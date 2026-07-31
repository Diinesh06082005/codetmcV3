import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trophy, Sparkles } from "lucide-react";

const PROJECT_STAGES = [
  { stage: 1, title: "Architecture & Setup", targetProgress: 25 },
  { stage: 2, title: "Core Features & API", targetProgress: 50 },
  { stage: 3, title: "Collaborative Sync & Tests", targetProgress: 75 },
  { stage: 4, title: "Production Deployment", targetProgress: 100 },
];

function ProjectProgressBar({ progress = 25, stage = 1, onUpdateProgress }) {
  const currentStageInfo = PROJECT_STAGES.find((s) => s.stage === stage) || PROJECT_STAGES[0];

  return (
    <div className="glass-card border border-white/10 p-3 bg-slate-950/80 rounded-2xl shadow-glass flex flex-col gap-2">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Trophy size={13} />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-tight">
              Stage {stage}: {currentStageInfo.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Completion Percentage Badge */}
          <span className="font-mono font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-lg">
            {progress}% Completed
          </span>

          {/* Quick Stage Switchers for Team Leader */}
          {onUpdateProgress && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-white/10">
              {PROJECT_STAGES.map((stg) => (
                <button
                  key={stg.stage}
                  onClick={() => onUpdateProgress(stg.targetProgress, stg.stage)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                    stage === stg.stage
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={`Set Stage ${stg.stage} (${stg.targetProgress}%)`}
                >
                  S{stg.stage}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]"
        />
      </div>
    </div>
  );
}

export default ProjectProgressBar;
