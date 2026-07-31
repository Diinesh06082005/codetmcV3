import { AnimatePresence, motion } from "framer-motion";
import { KEYBOARD_SHORTCUTS } from "../../constants/shortcuts.js";

function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-2xl shadow-glass"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-400">Boost your collaborative coding speed</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {KEYBOARD_SHORTCUTS.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition"
              >
                <span className="text-sm text-slate-300 font-medium">{item.description}</span>
                <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg shadow-sm">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="subtle-button text-xs py-2 px-5"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ShortcutsModal;
