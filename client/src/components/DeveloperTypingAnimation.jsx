import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code, Terminal, Cpu, Zap, Lock, Radio } from "lucide-react";

const CODE_SNIPPETS = [
  `const collaborate = async (team) => {
  const room = await CodeTMC.connect({
    encryption: 'AES-256-GCM',
    webrtc: 'P2P Mesh + STUN',
  });
  
  room.on('code-sync', ({ user, delta }) => {
    MonacoEditor.applyDiff(delta);
    AudioStudio.broadcastVoice(user);
  });
  
  return room.shipToProduction();
};`,
  `// Real-time Collaborative Engine
import { SocketCluster } from '@codetmc/core';

export function initializeStudio() {
  const stream = await WebRTC.getMediaStream({
    video: { width: 1920, height: 1080 },
    audio: { echoCancellation: true }
  });
  
  SocketCluster.emit('broadcast-alert', {
    priority: 'URGENT',
    title: 'Deployment Live'
  });
}`,
];

export default function DeveloperTypingAnimation() {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [displayedCode, setDisplayedCode] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const currentSnippet = CODE_SNIPPETS[snippetIdx];
    if (charIdx < currentSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode((prev) => prev + currentSnippet[charIdx]);
        setCharIdx((prev) => prev + 1);
      }, 35);
      return () => clearTimeout(timeout);
    } else {
      const resetTimeout = setTimeout(() => {
        setDisplayedCode("");
        setCharIdx(0);
        setSnippetIdx((prev) => (prev + 1) % CODE_SNIPPETS.length);
      }, 4000);
      return () => clearTimeout(resetTimeout);
    }
  }, [charIdx, snippetIdx]);

  return (
    <div className="relative w-full h-full min-h-[520px] flex flex-col justify-between overflow-hidden rounded-3xl bg-[#060913] border border-cyan-500/20 p-6 md:p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] group">
      {/* Background Ambient Glowing Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6,182,212,0.3) 0%, transparent 60%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 30px 30px, 30px 30px",
        }}
      />

      {/* Floating Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -80, 0],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
            className="absolute rounded-full bg-cyan-400/30 blur-sm"
            style={{
              width: `${12 + i * 4}px`,
              height: `${12 + i * 4}px`,
              top: `${20 + i * 14}%`,
              left: `${15 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
            CodeTMC IDE Studio v2.4
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 text-[10px] font-bold border border-violet-500/30 flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> Live Sockets
          </span>
        </div>
      </div>

      {/* Center: "Man Typing Code" High-Tech Visual Workstation */}
      <div className="relative z-10 my-4 flex-1 flex flex-col items-center justify-center">
        {/* Futuristic Dual Monitor IDE Frame */}
        <div className="w-full max-w-lg rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden backdrop-blur-xl">
          {/* Editor Header Bar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 ml-2 flex items-center gap-1">
                <Terminal className="h-3 w-3 text-cyan-400" /> developer_workstation.js
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              COMPILING...
            </span>
          </div>

          {/* Editor Code Text area with active Typing Cursor */}
          <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-200 min-h-[160px] overflow-hidden bg-[#0a0e1a]">
            <pre className="text-cyan-300 whitespace-pre-wrap">
              {displayedCode}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 align-middle shadow-[0_0_8px_#22d3ee]"
              />
            </pre>
          </div>
        </div>

        {/* Animated Developer at Mechanical Workstation Illustration */}
        <div className="relative mt-4 flex flex-col items-center">
          {/* Hands & Mechanical Keyboard Glow */}
          <div className="relative w-48 h-3 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-500 shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse">
            {/* Keypress sparkles */}
            <motion.div
              animate={{ x: [-60, 60, -40, 40] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-white blur-[1px] shadow-[0_0_10px_#fff]"
            />
          </div>

          {/* Ergonomic Desk Surface */}
          <div className="w-64 h-1.5 bg-slate-700/80 rounded-full mt-1 border-t border-white/20" />
        </div>
      </div>

      {/* Bottom Feature Badges Grid */}
      <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
            <Cpu className="h-3.5 w-3.5" /> Compiler
          </div>
          <span className="text-[10px] text-slate-400">Multi-Lang Engine</span>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" /> WebRTC P2P
          </div>
          <span className="text-[10px] text-slate-400">Voice & Video Calls</span>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <Lock className="h-3.5 w-3.5" /> Security
          </div>
          <span className="text-[10px] text-slate-400">JWT Encrypted</span>
        </div>
      </div>
    </div>
  );
}
