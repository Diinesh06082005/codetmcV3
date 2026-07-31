import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AnimatedGradient } from "./ui/animated-gradient.jsx";

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
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden font-display selection:bg-pink-500/30">
      {/* Whole-page WebGL Animated Gradient Background for Auth Pages */}
      <AnimatedGradient
        config={{ preset: "Aurora" }}
        className="absolute inset-0 z-0"
      />

      {/* Subtle overlay vignette for text legibility */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none" />

      {/* Centered Single Auth Card */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/40 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl overflow-hidden"
      >
        {/* Top subtle gradient accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

        <div className="w-full">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 text-pink-300 border border-pink-500/30">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
            {accent || "Encrypted JWT Session"}
          </span>

          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-5">
            {eyebrow || "AUTHENTICATION CENTER"}
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{description}</p>
          )}

          {/* Form Content */}
          <div className="mt-6">{children}</div>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{footerText}</span>
            <Link
              className="font-bold text-pink-400 hover:text-pink-300 transition underline underline-offset-4"
              to={footerHref}
            >
              {footerLabel}
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default AuthShell;
