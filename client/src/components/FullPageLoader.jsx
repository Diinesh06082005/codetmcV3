import { motion } from "framer-motion";

function FullPageLoader({
  title = "Restoring your workspace",
  subtitle = "Syncing authentication, room state, and collaboration services.",
}) {
  return (
    <div className="app-shell px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-strong w-full max-w-3xl p-8 md:p-10"
        >
          <p className="panel-title">Loading</p>
          <h2 className="mt-4 text-3xl font-semibold text-white">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5"
              >
                <div className="skeleton-bar h-3 w-24" />
                <div className="skeleton-bar mt-4 h-10 w-full" />
                <div className="skeleton-bar mt-3 h-3 w-3/4" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FullPageLoader;
