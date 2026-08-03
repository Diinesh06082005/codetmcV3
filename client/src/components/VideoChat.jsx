import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Settings,
  Monitor,
  Maximize2,
  Minimize2,
  Radio,
  Sliders,
  Palette,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Pin,
  PinOff,
} from "lucide-react";
import toast from "react-hot-toast";
import VideoCallSettingsModal from "./VideoCallSettingsModal.jsx";

// Production WebRTC ICE STUN & open TURN Configuration
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

if (import.meta.env.VITE_TURN_URL) {
  ICE_SERVERS.push({
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME || "",
    credential: import.meta.env.VITE_TURN_PASSWORD || "",
  });
}

// Color Theme Palettes for Video Call Icons & UI
const COLOR_THEMES = {
  cyan: {
    id: "cyan",
    name: "Cyber Cyan",
    primary: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    activeBtn: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-extrabold",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  violet: {
    id: "violet",
    name: "Neon Violet",
    primary: "text-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.3)]",
    activeBtn: "bg-violet-600 text-white hover:bg-violet-500 font-extrabold",
    badge: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Matrix",
    primary: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    activeBtn: "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  amber: {
    id: "amber",
    name: "Sunset Amber",
    primary: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    activeBtn: "bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  rose: {
    id: "rose",
    name: "Rose Crimson",
    primary: "text-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-500/10",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    activeBtn: "bg-rose-500 text-white hover:bg-rose-400 font-extrabold",
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
};

const VideoPlayer = ({
  stream,
  isMuted,
  isLocal,
  username,
  isPinned,
  onTogglePin,
  isScreenShare,
  themeConfig,
  isStage = false,
}) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const togglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      toast.error("Picture-in-Picture not supported on this browser.");
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-950 flex items-center justify-center border transition-all group ${
        isStage ? "w-full aspect-video md:aspect-[16/9] max-h-[460px]" : "aspect-video"
      } ${
        isPinned
          ? `${themeConfig.border} ${themeConfig.glow} ring-2 ring-cyan-400/50`
          : "border-white/10 hover:border-white/20"
      }`}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full ${isScreenShare ? "object-contain bg-slate-950" : "object-cover"}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-slate-500">
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-white/10">
            <User className="h-6 w-6 text-slate-400" />
          </div>
          <span className="text-xs font-semibold">{username}</span>
          <span className="text-[10px] text-slate-600">Camera Paused</span>
        </div>
      )}

      {/* User Badge & Status Overlay */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs text-white border border-white/10 z-10">
        <span
          className={`h-2 w-2 rounded-full ${
            stream ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
          }`}
        />
        <span className="font-semibold truncate max-w-[120px]">
          {username} {isLocal && "(You)"}
        </span>
        {isScreenShare && (
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold uppercase border border-cyan-500/30">
            Screen Share
          </span>
        )}
      </div>

      {/* Top Action Overlay (Pin / Expand / PiP) */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10">
        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-lg text-white transition ${
            isPinned
              ? "bg-cyan-500 text-slate-950 font-bold"
              : "hover:bg-white/20 text-slate-300"
          }`}
          title={isPinned ? "Unpin Stream from Stage" : "Expand Stream to Main Stage"}
        >
          {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </button>

        <button
          onClick={togglePip}
          className="p-1.5 rounded-lg hover:bg-white/20 text-slate-300 transition"
          title="Picture-in-Picture"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

const VideoChat = ({ socket, roomId, user, isTeamLeader, activeUsers, isSpectator }) => {
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [mediaState, setMediaState] = useState({ audio: true, video: true });
  const [mediaPermissions, setMediaPermissions] = useState({ audio: true, video: true });
  const [userMediaStates, setUserMediaStates] = useState({});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connected");
  const [qualityPreset, setQualityPreset] = useState("sd");
  const [selectedDevices, setSelectedDevices] = useState({ videoDeviceId: "", audioDeviceId: "" });
  const [audioEnhancements, setAudioEnhancements] = useState({
    echoCancellation: true,
    noiseSuppression: true,
  });

  const peerCallsRef = useRef({});
  const localStreamRef = useRef(null);
  const camStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Stage expansion & theme state
  const [pinnedStreamId, setPinnedStreamId] = useState("local");
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem("codetmc_video_theme") || "cyan";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  const themeConfig = COLOR_THEMES[activeTheme] || COLOR_THEMES.cyan;
  const isAdmin = user?.role === "admin";

  const handleThemeChange = (themeKey) => {
    setActiveTheme(themeKey);
    localStorage.setItem("codetmc_video_theme", themeKey);
    setShowThemePicker(false);
    toast.success(`Theme updated to ${COLOR_THEMES[themeKey].name}`);
  };

  // Re-initialize Peer connection with ICE STUN servers
  useEffect(() => {
    if (!socket || !user?.id) return;

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    let peerHost = "localhost";
    let peerPort = 5000;
    let peerSecure = false;

    try {
      const url = new URL(BACKEND_URL);
      peerHost = url.hostname;
      peerPort = url.port ? Number(url.port) : (url.protocol === "https:" ? 443 : 80);
      peerSecure = url.protocol === "https:";
    } catch (e) {
      peerHost = window.location.hostname;
    }

    if (import.meta.env.VITE_PEER_HOST) peerHost = import.meta.env.VITE_PEER_HOST;
    if (import.meta.env.VITE_PEER_PORT) peerPort = Number(import.meta.env.VITE_PEER_PORT);

    const peerConfig = {
      path: "/myapp",
      host: peerHost,
      port: peerPort,
      secure: peerSecure,
      config: {
        iceServers: ICE_SERVERS,
      },
    };

    let newPeer;
    try {
      newPeer = new Peer(user.id, peerConfig);
    } catch (e) {
      newPeer = new Peer(user.id, { config: { iceServers: ICE_SERVERS } });
    }

    setPeer(newPeer);

    newPeer.on("open", () => {
      setConnectionStatus("Connected (STUN Active)");
    });

    newPeer.on("error", (err) => {
      console.warn("PeerJS connection warning:", err.message);
      setConnectionStatus("Connected (P2P Fallback)");
    });

    const setupCallsWithStream = (stream) => {
      newPeer.on("call", (call) => {
        peerCallsRef.current[call.peer] = call;
        call.answer(localStreamRef.current || stream || undefined);
        call.on("stream", (userVideoStream) => {
          setPeers((prev) => ({ ...prev, [call.peer]: userVideoStream }));
        });
        call.on("close", () => {
          delete peerCallsRef.current[call.peer];
        });
        call.on("error", () => {
          delete peerCallsRef.current[call.peer];
        });
      });

      socket.on("user-joined", ({ peerId }) => {
        if (peerId && peerId !== user.id) {
          const streamToSend = localStreamRef.current || stream || new MediaStream();
          const call = newPeer.call(peerId, streamToSend);
          if (call) {
            peerCallsRef.current[peerId] = call;
            call.on("stream", (userVideoStream) => {
              setPeers((prev) => ({ ...prev, [peerId]: userVideoStream }));
            });
            call.on("close", () => {
              delete peerCallsRef.current[peerId];
            });
            call.on("error", () => {
              delete peerCallsRef.current[peerId];
            });
          }
        }
      });

      socket.emit("join-room-video", { peerId: user.id });
    };

    const getConstraints = () => {
      const videoConstraint =
        qualityPreset === "hd"
          ? { width: 1280, height: 720, frameRate: 30 }
          : qualityPreset === "sd"
          ? { width: 640, height: 480, frameRate: 24 }
          : { width: 320, height: 240, frameRate: 15 };

      if (selectedDevices.videoDeviceId)
        videoConstraint.deviceId = { exact: selectedDevices.videoDeviceId };

      const audioConstraint = {
        echoCancellation: audioEnhancements.echoCancellation,
        noiseSuppression: audioEnhancements.noiseSuppression,
      };

      if (selectedDevices.audioDeviceId)
        audioConstraint.deviceId = { exact: selectedDevices.audioDeviceId };

      return { video: videoConstraint, audio: audioConstraint };
    };

    navigator.mediaDevices
      .getUserMedia(getConstraints())
      .then((stream) => {
        setLocalStream(stream);
        localStreamRef.current = stream;
        camStreamRef.current = stream;
        setupCallsWithStream(stream);
      })
      .catch((err) => {
        console.warn("Could not capture local camera/mic stream, running in receiver mode.", err);
        setupCallsWithStream(null);
      });

    return () => {
      newPeer.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, socket, user?.id, qualityPreset, selectedDevices, audioEnhancements]);

  useEffect(() => {
    if (!socket) return;

    socket.on("media-permission-updated", ({ targetUserId, permissions }) => {
      if (targetUserId === user.id) {
        setMediaPermissions(permissions);
        toast(
          `Media permissions updated. Audio: ${permissions.audio ? "On" : "Off"}, Video: ${
            permissions.video ? "On" : "Off"
          }`
        );
      }
    });

    socket.on("user-media-toggled", ({ userId, mediaState: remoteMediaState }) => {
      setUserMediaStates((prev) => ({
        ...prev,
        [userId]: remoteMediaState,
      }));

      if (remoteMediaState?.isScreenShare) {
        setPinnedStreamId(userId);
        const remoteUser = activeUsers.find((u) => u.id === userId);
        const name = remoteUser?.username || "A collaborator";
        toast.success(`🖥️ @${name} started screen sharing!`);
      }
    });

    socket.on("user-left", ({ user: leftUser }) => {
      if (leftUser?.id) {
        delete peerCallsRef.current[leftUser.id];
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[leftUser.id];
          return newPeers;
        });
      }
    });

    return () => {
      socket.off("media-permission-updated");
      socket.off("user-media-toggled");
      socket.off("user-left");
    };
  }, [socket, user, activeUsers]);

  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      const videoTrack = localStream.getVideoTracks()[0];

      if (audioTrack) {
        audioTrack.enabled = mediaState.audio && mediaPermissions.audio;
      }
      if (videoTrack) {
        videoTrack.enabled = mediaState.video && mediaPermissions.video;
      }
    }
  }, [mediaState, mediaPermissions, localStream]);

  const toggleAudio = () => {
    if (!mediaPermissions.audio) {
      toast.error("Audio access restricted.");
      return;
    }
    const newState = { ...mediaState, audio: !mediaState.audio };
    setMediaState(newState);
    socket?.emit("toggle-media", { roomId, mediaState: newState });
  };

  const toggleVideo = () => {
    if (!mediaPermissions.video) {
      toast.error("Video access restricted.");
      return;
    }
    const newState = { ...mediaState, video: !mediaState.video };
    setMediaState(newState);
    socket?.emit("toggle-media", { roomId, mediaState: newState });
  };

  const replaceVideoTrackForPeers = (newVideoTrack) => {
    Object.values(peerCallsRef.current).forEach((call) => {
      if (call && call.peerConnection) {
        try {
          const senders = call.peerConnection.getSenders();
          const videoSender =
            senders.find((s) => s.track && s.track.kind === "video") ||
            senders.find((s) => s.kind === "video");

          if (videoSender) {
            videoSender.replaceTrack(newVideoTrack || null);
          } else if (newVideoTrack) {
            call.peerConnection.addTrack(newVideoTrack);
          }
        } catch (err) {
          console.warn("Error replacing video track for peer:", err);
        }
      }
    });
  };

  const stopScreenSharing = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    let camStream = camStreamRef.current;

    if (!camStream || !camStream.getVideoTracks().some((t) => t.readyState === "live")) {
      try {
        camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        camStreamRef.current = camStream;
      } catch (err) {
        console.warn("Could not re-acquire camera stream:", err);
      }
    }

    const camVideoTrack = camStream?.getVideoTracks()[0] || null;
    replaceVideoTrackForPeers(camVideoTrack);

    if (camStream) {
      setLocalStream(camStream);
      localStreamRef.current = camStream;
    }

    setIsScreenSharing(false);
    socket?.emit("toggle-media", {
      roomId,
      mediaState: { ...mediaState, isScreenShare: false },
    });
    toast.success("Stopped screen sharing.");
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenSharing();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (localStream && !isScreenSharing) {
          camStreamRef.current = localStream;
        }

        screenStreamRef.current = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        // Instantly transmit screen track to all connected P2P WebRTC peers!
        replaceVideoTrackForPeers(screenVideoTrack);

        setLocalStream(screenStream);
        localStreamRef.current = screenStream;
        setIsScreenSharing(true);
        setPinnedStreamId("local");

        socket?.emit("toggle-media", {
          roomId,
          mediaState: { ...mediaState, isScreenShare: true },
        });

        screenVideoTrack.onended = () => {
          stopScreenSharing();
        };

        toast.success("Sharing screen with room. Pinned to main stage!");
      } catch (err) {
        console.error("Screen share error:", err);
        toast.error("Could not share screen.");
      }
    }
  };

  const handleAdminTogglePermission = (targetUserId, type) => {
    const targetUser = activeUsers.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const currentPerms = targetUser.mediaPermissions || { audio: true, video: true };
    const newPerms = { ...currentPerms, [type]: !currentPerms[type] };

    socket?.emit("media-permission-change", {
      roomId,
      targetUserId,
      permissions: newPerms,
    });
    toast.success(`Updated media controls for @${targetUser.username}`);
  };

  const hasControlAccess = isTeamLeader || isAdmin;

  // Determine stage stream vs secondary streams
  const allStreamList = [];
  if (localStream) {
    allStreamList.push({
      id: "local",
      stream: localStream,
      isLocal: true,
      username: isAdmin ? "You (Admin)" : "You",
      isScreenShare: isScreenSharing,
    });
  }

  Object.keys(peers).forEach((peerId) => {
    const remoteUser = activeUsers.find((u) => u.id === peerId);
    const remoteMedia = userMediaStates[peerId] || {};
    allStreamList.push({
      id: peerId,
      stream: peers[peerId],
      isLocal: false,
      username: remoteUser?.username || "Developer",
      isScreenShare: Boolean(remoteMedia.isScreenShare),
    });
  });

  const stageStreamItem = allStreamList.find((s) => s.id === pinnedStreamId) || allStreamList[0];
  const gridStreamsList = allStreamList.filter((s) => s.id !== stageStreamItem?.id);

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg backdrop-blur-2xl"
    >
      {/* Header & Theme Control Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="panel-title text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#007AFF]" />
              {isAdmin ? "GOD MODE SURVEILLANCE" : "HD Video & Screen Stage"}
            </p>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium bg-white/5 text-slate-300 border-white/10">
              <Radio className="h-3 w-3 text-[#30D158]" /> WebRTC P2P
            </span>
          </div>
          <h3 className="text-xs font-medium text-slate-400 mt-0.5">
            {allStreamList.length} Active Video Stream{allStreamList.length !== 1 ? "s" : ""}
          </h3>
        </div>

        {/* Action Controls & Theme Selector */}
        <div className="flex gap-1.5 items-center relative">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-xl transition-colors duration-150 border ${
              mediaState.audio && mediaPermissions.audio
                ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/10 text-white"
                : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 hover:bg-[#FF453A]/25"
            }`}
            title="Toggle Mic"
          >
            {mediaState.audio && mediaPermissions.audio ? <Mic size={15} /> : <MicOff size={15} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-2 rounded-xl transition-colors duration-150 border ${
              mediaState.video && mediaPermissions.video
                ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/10 text-white"
                : "bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 hover:bg-[#FF453A]/25"
            }`}
            title="Toggle Camera"
          >
            {mediaState.video && mediaPermissions.video ? <Camera size={15} /> : <CameraOff size={15} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-2 rounded-xl transition-colors duration-150 border ${
              isScreenSharing
                ? "bg-[#007AFF] text-white border-none"
                : "bg-white/[0.08] hover:bg-white/[0.14] border-white/10 text-white"
            }`}
            title={isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}
          >
            <Monitor size={15} />
          </button>

          {/* Icon Theme Selector Dropdown Trigger */}
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-300 hover:text-white transition-colors duration-150"
            title="Change Video Theme Colors"
          >
            <Palette size={15} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-slate-300 hover:text-white transition-colors duration-150"
            title="Video & Call Settings"
          >
            <Sliders size={15} />
          </button>

          {/* Theme Color Picker Modal Popover */}
          {showThemePicker && (
            <div className="absolute top-12 right-0 z-30 w-48 rounded-2xl bg-slate-900/95 border border-white/10 p-2 backdrop-blur-2xl shadow-lg space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1">
                Select Color Accent
              </p>
              {Object.values(COLOR_THEMES).map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-150 ${
                    activeTheme === theme.id
                      ? "bg-white/15 text-white border border-white/20"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className={theme.primary}>{theme.name}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${theme.bg} border ${theme.border}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Expanded Stage View (Primary Pinned Stream) */}
      {stageStreamItem && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span className="flex items-center gap-1.5 text-cyan-300 font-mono uppercase text-[11px]">
              <Pin size={12} className={themeConfig.primary} /> Stage Spotlight: {stageStreamItem.username}
            </span>
            {stageStreamItem.isScreenShare && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 animate-pulse">
                🖥️ Active Screen Share
              </span>
            )}
          </div>
          <VideoPlayer
            stream={stageStreamItem.stream}
            isLocal={stageStreamItem.isLocal}
            username={stageStreamItem.username}
            isPinned={true}
            onTogglePin={() => setPinnedStreamId(stageStreamItem.id === "local" ? "" : "local")}
            isScreenShare={stageStreamItem.isScreenShare}
            themeConfig={themeConfig}
            isStage={true}
          />
        </div>
      )}

      {/* Grid Strip of Secondary Participant Streams */}
      {gridStreamsList.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Other Participants ({gridStreamsList.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {gridStreamsList.map((item) => (
              <VideoPlayer
                key={item.id}
                stream={item.stream}
                isLocal={item.isLocal}
                username={item.username}
                isPinned={false}
                onTogglePin={() => setPinnedStreamId(item.id)}
                isScreenShare={item.isScreenShare}
                themeConfig={themeConfig}
                isStage={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* God Mode / Leader Administrative Media Permissions Control Panel */}
      {hasControlAccess && activeUsers.filter((u) => u.id !== user.id).length > 0 && (
        <div className="mt-2 pt-3 border-t border-white/10">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1">
            <Settings size={12} /> {isAdmin ? "God Mode Media Overrides" : "Team Leader Media Controls"}
          </h4>
          <div className="flex flex-col gap-2 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
            {activeUsers
              .filter((u) => u.id !== user.id)
              .map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl border border-white/5"
                >
                  <span className="text-white font-medium truncate max-w-[100px]">@{u.username}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAdminTogglePermission(u.id, "audio")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.mediaPermissions?.audio !== false
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {u.mediaPermissions?.audio !== false ? "Mic On" : "Mic Off"}
                    </button>
                    <button
                      onClick={() => handleAdminTogglePermission(u.id, "video")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        u.mediaPermissions?.video !== false
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {u.mediaPermissions?.video !== false ? "Cam On" : "Cam Off"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Video Call Settings Modal */}
      <VideoCallSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentVideoDevice={selectedDevices.videoDeviceId}
        currentAudioDevice={selectedDevices.audioDeviceId}
        onSelectDevices={setSelectedDevices}
        quality={qualityPreset}
        onQualityChange={setQualityPreset}
        audioConstraints={audioEnhancements}
        onAudioConstraintsChange={setAudioEnhancements}
        connectionState={connectionStatus}
      />
    </div>
  );
};

export default VideoChat;
