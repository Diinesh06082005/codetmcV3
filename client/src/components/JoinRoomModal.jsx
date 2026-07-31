import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, ArrowRight, X } from "lucide-react";
import { sanitizeRoomIdInput } from "../utils/validators.js";

function JoinRoomModal({ isOpen, onClose, onJoinRoom, isJoining }) {
  const [roomId, setRoomId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    onJoinRoom(roomId.trim());
  };

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
                <LogIn size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Join Workspace</h3>
                <p className="text-xs text-slate-400">Enter a live room code to connect</p>
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
                Room ID Code
              </label>
              <input
                value={roomId}
                onChange={(e) => setRoomId(sanitizeRoomIdInput(e.target.value))}
                placeholder="e.g. AB12CD34"
                className="input-shell font-mono uppercase tracking-wider"
                autoFocus
              />
            </div>

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
                disabled={isJoining || !roomId.trim()}
                className="bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] text-xs py-2 px-5 font-medium text-white rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors duration-150 border-none shadow-none"
              >
                {isJoining ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Joining...
                  </>
                ) : (
                  <>
                    Connect Room
                    <ArrowRight size={14} />
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

export default JoinRoomModal;
