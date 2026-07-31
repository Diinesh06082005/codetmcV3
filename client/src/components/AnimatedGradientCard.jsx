import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Code2, Video, ShieldAlert, Terminal, Cpu, GitBranch } from "lucide-react";

export default function AnimatedGradientCard({ activeFeature, onSelectFeature, features = [] }) {
  return (
    <div className="relative w-full h-full min-h-[480px] rounded-3xl overflow-hidden bg-[#0a0512] border border-pink-500/30 p-8 shadow-[0_0_80px_rgba(236,72,153,0.25)] flex flex-col justify-between z-10 selection:bg-pink-500/40">
      {/* ================= ANIMATED FLUID LIQUID GRADIENT BLOBS ================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1: Top Right Hot Pink Swell */}
        <motion.div
          animate={{
            scale: [1, 1.35, 1.1, 1.4, 1],
            rotate: [0, 90, 180, 270, 360],
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 40, -20, 0],
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 50% 60% 40% 60%",
              "30% 70% 60% 40% / 60% 40% 70% 30%",
              "50% 50% 40% 60% / 30% 70% 50% 50%",
              "40% 60% 70% 30% / 40% 50% 60% 50%",
            ],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-12 -right-12 w-[340px] h-[340px] bg-gradient-to-br from-[#ff007f] via-[#ec4899] to-[#d946ef] opacity-90 blur-[50px]"
        />

        {/* Blob 2: Bottom Left Liquid Magenta Wave */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.4, 1.1, 1.2],
            rotate: [360, 270, 180, 90, 0],
            x: [0, -50, 30, -20, 0],
            y: [0, 40, -40, 30, 0],
            borderRadius: [
              "50% 50% 30% 70% / 60% 40% 60% 40%",
              "30% 70% 70% 30% / 40% 60% 50% 50%",
              "60% 40% 40% 60% / 50% 50% 70% 30%",
              "40% 60% 50% 50% / 30% 70% 40% 60%",
              "50% 50% 30% 70% / 60% 40% 60% 40%",
            ],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-16 -left-16 w-[380px] h-[380px] bg-gradient-to-tr from-[#e11d48] via-[#ff007f] to-[#a855f7] opacity-85 blur-[60px]"
        />

        {/* Blob 3: Center Pulsing Electric Violet Core */}
        <motion.div
          animate={{
            scale: [0.8, 1.3, 0.9, 1.25, 0.8],
            x: [-20, 30, -40, 20, -20],
            y: [30, -20, 20, -30, 30],
            opacity: [0.6, 0.95, 0.7, 0.9, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-r from-[#ff007f] via-[#c026d3] to-[#7c3aed] blur-[45px]"
        />

        {/* Dark Fluid Organic Contour Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#090412]/40 to-[#07030d]/80 pointer-events-none" />
      </div>

      {/* ================= CONTENT OVERLAY ================= */}
      <div className="relative z-10 space-y-6">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_25px_rgba(255,0,127,0.5)]">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight font-display">
                CodeTMC Studio
              </h2>
              <p className="text-xs text-pink-200/80 font-medium">
                Next-Gen Collaborative IDE
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-pink-300 animate-pulse" /> Animated Fluid
          </span>
        </div>

        {/* Center Animated Gradient Title */}
        <div className="py-8 text-center sm:text-left space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] font-display"
          >
            Animated <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-pink-400">
              Gradient Studio
            </span>
          </motion.h1>
          <p className="text-sm font-medium text-pink-100/90 max-w-md leading-relaxed drop-shadow">
            Realtime Monaco IDE • P2P HD Video Mesh • Polyglot Sandboxes • DevOps Telemetry
          </p>
        </div>
      </div>

      {/* Feature Selector Tabs Footer */}
      <div className="relative z-10 pt-6 border-t border-white/15 backdrop-blur-md">
        <p className="text-[10px] font-mono font-bold tracking-widest text-pink-300 uppercase mb-3">
          Explore Platform Capabilities
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {features.map((item, idx) => {
            const isSelected = activeFeature === idx;
            const Icon = item.icon || Sparkles;
            return (
              <button
                key={item.id || idx}
                onClick={() => onSelectFeature && onSelectFeature(idx)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all text-left ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-[1.03]"
                    : "bg-black/30 hover:bg-black/50 text-white border border-white/10 hover:border-pink-500/40"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-pink-600" : "text-pink-400"}`} />
                <span className="truncate">{item.shortTitle || item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
