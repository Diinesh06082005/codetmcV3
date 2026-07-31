import React, { useEffect, useRef, useState } from "react";
import { X, Mic, Camera, Volume2, ShieldCheck, Activity, Sliders, Check } from "lucide-react";

export default function VideoCallSettingsModal({
  isOpen,
  onClose,
  currentVideoDevice,
  currentAudioDevice,
  onSelectDevices,
  quality,
  onQualityChange,
  audioConstraints,
  onAudioConstraintsChange,
  connectionState = "Connected",
  ping = 28,
}) {
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(currentVideoDevice || "");
  const [selectedAudio, setSelectedAudio] = useState(currentAudioDevice || "");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Enumerate user devices
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        const audioOutputs = devices.filter((d) => d.kind === "audiooutput");

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);
        setOutputDevices(audioOutputs);

        if (!selectedVideo && videoInputs.length) setSelectedVideo(videoInputs[0].deviceId);
        if (!selectedAudio && audioInputs.length) setSelectedAudio(audioInputs[0].deviceId);
        if (!selectedOutput && audioOutputs.length) setSelectedOutput(audioOutputs[0].deviceId);
      })
      .catch((err) => console.warn("Failed to enumerate devices:", err));

    // Start local audio level monitoring for mic testing
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);

        analyser.fftSize = 64;
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      })
      .catch((e) => console.warn("Mic test error:", e));

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isOpen]);

  const handleApplyDevices = () => {
    onSelectDevices({ videoDeviceId: selectedVideo, audioDeviceId: selectedAudio });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-violet-500/30 p-6 shadow-2xl space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                WebRTC Call & Studio Settings
              </h3>
              <p className="text-xs text-slate-400">
                Optimize video quality, device routing, and network connectivity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Network & ICE Health Status */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              ICE Connection: {connectionState}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Ping: {ping} ms</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              STUN Active
            </span>
          </div>
        </div>

        {/* Mic Test & Level Meter */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-violet-400" />
              Microphone Input Meter
            </span>
            <span className="text-slate-400">{micLevel}% level</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
              style={{ width: `${micLevel}%` }}
            />
          </div>
        </div>

        {/* Device Selectors */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-cyan-400" /> Camera Source
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2.5 text-white outline-none focus:border-violet-500"
            >
              {videoDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5 text-violet-400" /> Microphone Device
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2.5 text-white outline-none focus:border-violet-500"
            >
              {audioDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          {outputDevices.length > 0 && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-amber-400" /> Speaker Output Device
              </label>
              <select
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2.5 text-white outline-none focus:border-violet-500"
              >
                {outputDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Speaker ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quality Mode */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">
              Video Stream Quality Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "hd", label: "1080p HD", desc: "High Quality" },
                { id: "sd", label: "720p SD", desc: "Balanced" },
                { id: "low", label: "360p Low", desc: "Data Saver" },
              ].map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onQualityChange(q.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    quality === q.id
                      ? "bg-violet-600/30 border-violet-500 text-white"
                      : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <p className="font-bold">{q.label}</p>
                  <p className="text-[10px] text-slate-400">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Audio Enhancements */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <p className="text-slate-400 font-semibold">Audio Processing Enhancements</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioConstraints.echoCancellation}
                  onChange={(e) =>
                    onAudioConstraintsChange({
                      ...audioConstraints,
                      echoCancellation: e.target.checked,
                    })
                  }
                  className="accent-violet-500"
                />
                Echo Cancellation
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioConstraints.noiseSuppression}
                  onChange={(e) =>
                    onAudioConstraintsChange({
                      ...audioConstraints,
                      noiseSuppression: e.target.checked,
                    })
                  }
                  className="accent-violet-500"
                />
                Noise Suppression
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyDevices}
            className="gradient-button px-5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
