import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, Mic } from "lucide-react";

export default function VoiceNotePlayer({ audioUrl, duration }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.warn);
      setIsPlaying(true);
    }
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs w-full max-w-[260px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md transition shrink-0"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
      </button>

      {/* Waveform & Progress */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1 text-violet-300">
            <Mic className="h-3 w-3" /> Voice Note
          </span>
          <span>
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>
        </div>

        {/* Animated Simulated Waveform Bars */}
        <div className="flex items-center gap-0.5 h-4 cursor-pointer" onClick={togglePlay}>
          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 85, 60, 40, 75, 50].map((height, i) => {
            const isPassed = (i / 16) * 100 <= progressPercent;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed ? "bg-amber-400" : "bg-slate-700 hover:bg-slate-600"
                } ${isPlaying && isPassed ? "animate-pulse" : ""}`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Playback Speed Switcher */}
      <button
        onClick={toggleSpeed}
        className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-amber-300 border border-white/10 shrink-0"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
