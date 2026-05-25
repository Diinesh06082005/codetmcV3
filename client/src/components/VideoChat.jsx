import React, { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { Camera, CameraOff, Mic, MicOff, Settings, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const VideoPlayer = ({ stream, isMuted, isLocal }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900 aspect-video flex items-center justify-center border border-white/10 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted || isLocal}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const VideoChat = ({ socket, roomId, user, isTeamLeader, activeUsers, isSpectator }) => {
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [mediaState, setMediaState] = useState({ audio: true, video: true });
  const [mediaPermissions, setMediaPermissions] = useState({ audio: true, video: true });

  useEffect(() => {
    if (isSpectator || !socket) return;

    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const url = new URL(BACKEND_URL);

    // Connect to PeerJS Server on port 5001
    const newPeer = new Peer(user.id, {
      path: "/myapp",
      host: url.hostname,
      port: 5001,
      secure: url.protocol === "https:",
    });

    setPeer(newPeer);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);

        newPeer.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            setPeers((prev) => ({ ...prev, [call.peer]: userVideoStream }));
          });
        });

        socket.on("user-joined", ({ peerId, user: joinedUser }) => {
          if (peerId && peerId !== user.id) {
            const call = newPeer.call(peerId, stream);
            call.on("stream", (userVideoStream) => {
              setPeers((prev) => ({ ...prev, [peerId]: userVideoStream }));
            });
          }
        });

        // Inform socket we have a peerId and joined
        socket.emit("join-room-video", { peerId: user.id });

      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        toast.error("Could not access camera/microphone.");
      });

    return () => {
      newPeer.destroy();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, isSpectator]);

  useEffect(() => {
    if (!socket) return;

    socket.on("media-permission-updated", ({ targetUserId, permissions }) => {
      if (targetUserId === user.id) {
        setMediaPermissions(permissions);
        toast(`Admin updated your media permissions. Audio: ${permissions.audio ? 'On' : 'Off'}, Video: ${permissions.video ? 'On' : 'Off'}`);
      }
    });

    socket.on("user-left", ({ user: leftUser }) => {
      if (peers[leftUser.id]) {
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[leftUser.id];
          return newPeers;
        });
      }
    });

    return () => {
      socket.off("media-permission-updated");
      socket.off("user-left");
    };
  }, [socket, user, peers]);

  // Enforce permissions
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
      toast.error("Team leader has restricted your audio.");
      return;
    }
    const newState = { ...mediaState, audio: !mediaState.audio };
    setMediaState(newState);
    socket.emit("toggle-media", { roomId, mediaState: newState });
  };

  const toggleVideo = () => {
    if (!mediaPermissions.video) {
      toast.error("Team leader has restricted your video.");
      return;
    }
    const newState = { ...mediaState, video: !mediaState.video };
    setMediaState(newState);
    socket.emit("toggle-media", { roomId, mediaState: newState });
  };

  const handleAdminTogglePermission = (targetUserId, type) => {
    const targetUser = activeUsers.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const currentPerms = targetUser.mediaPermissions || { audio: true, video: true };
    const newPerms = { ...currentPerms, [type]: !currentPerms[type] };

    socket.emit("media-permission-change", {
      roomId,
      targetUserId,
      permissions: newPerms
    });
    toast.success(`Updated permissions for ${targetUser.username}`);
  };

  if (isSpectator) {
    return (
      <div className="p-4 bg-apple-gray rounded-xl border border-white/5 text-sm text-center text-apple-textMuted">
        You are spectating. Video/Audio is disabled.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 glass-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Video Call</h3>
        <div className="flex gap-2">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition ${mediaState.audio && mediaPermissions.audio ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          >
            {mediaState.audio && mediaPermissions.audio ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-2 rounded-full transition ${mediaState.video && mediaPermissions.video ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
          >
            {mediaState.video && mediaPermissions.video ? <Camera size={18} /> : <CameraOff size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {localStream && (
          <div className="relative group">
            <VideoPlayer stream={localStream} isLocal={true} />
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">You</div>
          </div>
        )}
        {Object.keys(peers).map((peerId) => {
          const remoteUser = activeUsers.find(u => u.id === peerId);
          return (
            <div key={peerId} className="relative group">
              <VideoPlayer stream={peers[peerId]} isLocal={false} />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {remoteUser?.username || "Unknown"}
              </div>
            </div>
          );
        })}
      </div>

      {isTeamLeader && activeUsers.filter(u => u.id !== user.id).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-apple-textMuted mb-3 flex items-center gap-1">
            <Settings size={12} /> Team Leader Controls
          </h4>
          <div className="flex flex-col gap-2">
            {activeUsers.filter(u => u.id !== user.id).map(u => (
              <div key={u.id} className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-lg">
                <span className="text-white truncate max-w-[100px]">{u.username}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAdminTogglePermission(u.id, 'audio')}
                    className={`px-2 py-1 rounded ${u.mediaPermissions?.audio !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {u.mediaPermissions?.audio !== false ? 'Audio On' : 'Audio Off'}
                  </button>
                  <button 
                    onClick={() => handleAdminTogglePermission(u.id, 'video')}
                    className={`px-2 py-1 rounded ${u.mediaPermissions?.video !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {u.mediaPermissions?.video !== false ? 'Video On' : 'Video Off'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
