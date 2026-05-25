import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

function Navbar({ roomId, isConnected, user, onLeave, onLogout }) {
  const location = useLocation();
  const isAdminView = location.pathname.startsWith("/admin");
  const adminToggleLabel = isAdminView ? "Control Center" : "Admin Panel";
  const adminToggleHref = isAdminView ? "/dashboard" : "/admin";

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="glass-card flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-apple-blue text-lg font-semibold text-white shadow-glow">
          C
        </div>
        <p className="panel-title">CodeTMC</p>
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Realtime Collaboration Studio</h1>
          <p className="text-sm text-apple-textMuted">
            Protected rooms, polished UI, and shared code flow.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-apple-textMuted">
        {roomId ? (
          <Link
            to="/dashboard"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
          >
            Dashboard
          </Link>
        ) : null}
        {user?.role === "admin" ? (
          <Link
            to={adminToggleHref}
            className="rounded-full border border-apple-blue/30 bg-apple-blue/10 px-4 py-2 text-apple-blue transition duration-300 hover:bg-apple-blue/20"
          >
            {adminToggleLabel}
          </Link>
        ) : null}
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono">
          {roomId ? `Room ${roomId}` : isAdminView ? "Developer Dashboard" : "Dashboard"}
        </div>
        {user ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            @{user.username}
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]" : "bg-red-400"
            }`}
          />
          {isConnected ? "Connected" : "Offline"}
        </div>
        {onLeave ? (
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-rose-100 transition hover:bg-rose-500/20"
          >
            Leave Room
          </button>
        ) : null}
        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
          >
            Logout
          </button>
        ) : null}
      </div>
    </motion.header>
  );
}

export default Navbar;
