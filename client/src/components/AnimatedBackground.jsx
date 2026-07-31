import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext.jsx";

const BACKGROUND_IMAGES = [
  { id: 1, src: "/images/backgrounds/4921254.jpg", alt: "Wallpaper 1" },
  { id: 2, src: "/images/backgrounds/5992037.jpg", alt: "Wallpaper 2" },
  { id: 3, src: "/images/backgrounds/8001439.jpg", alt: "Wallpaper 3" },
  { id: 4, src: "/images/backgrounds/8904415.jpg", alt: "Wallpaper 4" },
];

export default function AnimatedBackground({ intervalDuration = 6000 }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isStaticTheme = theme === "df2";

  useEffect(() => {
    if (isStaticTheme) return; // Do not auto-cycle on static theme (df2)

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [intervalDuration, isStaticTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Image Carousel with Ken Burns Motion */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={BACKGROUND_IMAGES[currentIndex].id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${BACKGROUND_IMAGES[currentIndex].src}')`,
          }}
        />
      </AnimatePresence>

      {/* Dark Vignette & Glass Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 backdrop-blur-[2px]" />

      {/* Mini Ambient Animated Glow Orbs & Light Particles */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-lime-400/20 blur-[100px] pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -50, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/20 blur-[120px] pointer-events-none"
      />

      <motion.div
        animate={{
          x: [0, 35, -25, 0],
          y: [0, 25, -35, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-400/15 blur-[130px] pointer-events-none"
      />

      {/* Floating Sparkle Dust Dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 8 + i * 3,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear",
          }}
          style={{
            left: `${15 + i * 14}%`,
          }}
          className="absolute top-0 w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)] pointer-events-none"
        />
      ))}

      {/* Interactive Quick Indicator Pills (Bottom Right) */}
      <div className="absolute bottom-4 right-4 pointer-events-auto z-10 flex items-center gap-1.5 p-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
        {BACKGROUND_IMAGES.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "w-2 bg-white/30 hover:bg-white/60"
            }`}
            title={`Switch to Wallpaper ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
