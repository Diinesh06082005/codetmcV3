import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Sparkles, X } from "lucide-react";
import { sanitizeRoomIdInput } from "../utils/validators.js";

function CreateRoomModal({ isOpen, onClose, onCreateRoom, isCreating, user, onRequestUpgrade }) {
  const [customRoomId, setCustomRoomId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateRoom(customRoomId);
  };

  const isLimitReached = user?.role !== "admin" && user?.roomsCreatedToday?.count >= user?.roomLimit;

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
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-slate-900/50 p-6 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)]"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF] text-white font-medium shadow-sm">
                <PlusCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Create Workspace</h3>
                <p className="text-xs text-slate-400">Launch a live collaborative room</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-150"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Custom Room ID (Optional)
              </label>
              <input
                value={customRoomId}
                onChange={(e) => setCustomRoomId(sanitizeRoomIdInput(e.target.value))}
                placeholder="e.g. REACT2026"
                className="input-shell font-mono uppercase tracking-wider"
                disabled={isLimitReached}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Leave empty for an auto-generated room ID.
              </p>
            </div>

            {user?.role !== "admin" && (
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Daily Created Rooms:</span>
                  <span className="font-medium text-white">
                    {user?.roomsCreatedToday?.count || 0} / {user?.roomLimit || 5}
                  </span>
                </div>
                {isLimitReached && (
                  <p className="text-xs text-[#FF453A] font-medium">Daily room limit reached.</p>
                )}
                {user?.upgradeStatus === "pending" ? (
                  <p className="text-xs text-amber-400 font-medium">Limit upgrade pending admin review.</p>
                ) : user?.upgradeStatus === "approved" ? (
                  <p className="text-xs text-[#30D158] font-medium">Upgraded limit active.</p>
                ) : (
                  <button
                    type="button"
                    onClick={onRequestUpgrade}
                    className="w-full text-xs py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-medium transition-colors duration-150"
                  >
                    Request Limit Upgrade
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="subtle-button text-xs py-2 px-4 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || isLimitReached}
                className="bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] text-xs py-2 px-5 font-medium text-white rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors duration-150 border-none shadow-none"
              >
                {isCreating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Launching...
                  </>
                ) : isLimitReached ? (
                  "Limit Reached"
                ) : (
                  <>
                    <Sparkles size={14} />
                    Launch Room
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreateRoomModal;
