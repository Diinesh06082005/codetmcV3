import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function AuthShell({
  eyebrow,
  title,
  description,
  accent,
  footerText,
  footerLabel,
  footerHref,
  children,
}) {
  const accentLabel = accent || "Secure Realtime Collaboration";

  return (
    <div className="app-shell px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="glass-card-strong relative overflow-hidden p-8 md:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-transparent pointer-events-none" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div>
              <p className="panel-title">CodeTMC</p>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white md:text-5xl tracking-tight">
                Build, review, and ship together in a protected live code room.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-apple-textMuted">
                JWT-secured sessions, authenticated sockets, live editor sync, and a
                clean collaboration workspace tuned for pair programming and fast
                team reviews.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Protected Rooms", value: "JWT + guarded sockets" },
                { label: "Team Awareness", value: "Presence, chat, typing" },
                { label: "Modern Workspace", value: "Glass UI + Monaco flow" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-white/5 bg-white/5 px-5 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-apple-textMuted">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-medium text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
          className="glass-card flex items-center justify-center p-6 md:p-8"
        >
          <div className="w-full max-w-md">
            <span className="status-pill bg-apple-blue/10 text-apple-blue">{accentLabel}</span>
            <p className="panel-title mt-6">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white tracking-tight">{title}</h2>
            <p className="mt-4 text-sm leading-6 text-apple-textMuted">{description}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-sm text-apple-textMuted">
              {footerText}{" "}
              <Link className="text-apple-blue transition duration-300 hover:text-apple-blueHover" to={footerHref}>
                {footerLabel}
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default AuthShell;
