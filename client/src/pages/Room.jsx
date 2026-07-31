import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ChatBox from "../components/ChatBox.jsx";
import Editor from "../components/Editor.jsx";
import UserList from "../components/UserList.jsx";
import VideoChat from "../components/VideoChat.jsx";
import HistoryLog from "../components/HistoryLog.jsx";
import GitBranchManager from "../components/GitBranchManager.jsx";
import ProjectProgressBar from "../components/ProjectProgressBar.jsx";
import PullRequestModal from "../components/PullRequestModal.jsx";
import FileExplorer from "../components/FileExplorer.jsx";
import LiveWebPreview from "../components/LiveWebPreview.jsx";
import SideRays from "../components/ui/SideRays.jsx";
import AnimatedBackground from "../components/AnimatedBackground.jsx";
import { getLanguageFromFilename, getFileExtension } from "../constants/languages.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";
import {
  Code2,
  Users,
  History,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  GitBranch,
  WifiOff,
  GitPullRequest,
  Send,
  FolderOpen,
} from "lucide-react";

const MAX_MESSAGES = 100;

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  // Multi-File Project Workspace state
  const [projectFiles, setProjectFiles] = useState([
    {
      id: "f1",
      name: "App.jsx",
      language: "react",
      content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 max-w-md mx-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></span>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          CodeTMC React Studio
        </h1>
      </div>
      <p className="text-sm text-slate-400">
        Live multi-file workspace with instant styling & Babel JSX engine.
      </p>
      <button 
        onClick={() => setCount(count + 1)}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-bold text-sm shadow-lg hover:from-indigo-500 hover:to-violet-500 transition"
      >
        Interactive Counter: {count}
      </button>
    </div>
  );
}`,
    },
    {
      id: "f2",
      name: "styles.css",
      language: "css",
      content: `/* Custom CSS Workspace Styles */
.card-glow {
  box-shadow: 0 0 25px rgba(99, 102, 241, 0.3);
}`,
    },
    {
      id: "f3",
      name: "utils.js",
      language: "javascript",
      content: `// Utility Helper Functions
export const calculateScore = (items) => {
  return items.reduce((acc, curr) => acc + curr, 0);
};`,
    },
    {
      id: "f4",
      name: "server.js",
      language: "javascript",
      content: `// Server API Entrypoint
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: "CodeTMC Server API Ready" }));
});

console.log("Server initialized.");`,
    },
  ]);

  const [activeFileId, setActiveFileId] = useState("f1");

  const activeFile = projectFiles.find((f) => f.id === activeFileId) || projectFiles[0];

  const [code, setCode] = useState(activeFile.content);
  const [language, setLanguage] = useState(getLanguageFromFilename(activeFile.name));

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomMeta, setRoomMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCollaborator, setActiveCollaborator] = useState("");
  const [presenceEvent, setPresenceEvent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [history, setHistory] = useState([]);

  // Live Web Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Git Branching state
  const [branches, setBranches] = useState({
    main: { code: activeFile.content, lastCommit: "Initial commit" },
  });
  const [activeBranch, setActiveBranch] = useState("main");
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);

  // Offline Working Mode & Pull Requests
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingPRs, setPendingPRs] = useState([]);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [prCommitNote, setPrCommitNote] = useState("");

  // Project Completion Stage & Progress state
  const [projectProgress, setProjectProgress] = useState(25);
  const [projectStage, setProjectStage] = useState(1);

  // Panel visibility & tab states
  const [leftTab, setLeftTab] = useState("explorer");
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const saveTimerRef = useRef(null);
  const typingIndicatorTimerRef = useRef(null);
  const presenceTimerRef = useRef(null);

  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleRoomUsers = (roomUsers) => {
      setUsers(roomUsers);
    };

    const handleUserJoined = ({ user: joinedUser, message }) => {
      if (joinedUser?.id && joinedUser.id !== user?.id) {
        setPresenceEvent({
          id: `${joinedUser.id}-join-${Date.now()}`,
          tone: "join",
          message,
        });
        toast.success(message);
      }
    };

    const handleUserLeft = ({ user: leftUser, message }) => {
      if (leftUser?.id && leftUser.id !== user?.id) {
        setTypingUsers((previous) =>
          previous.filter((username) => username !== leftUser.username)
        );
        setPresenceEvent({
          id: `${leftUser.id}-leave-${Date.now()}`,
          tone: "leave",
          message,
        });
        toast(message);
      }
    };

    const handleSyncCode = ({ code: syncedCode, language: syncedLanguage }) => {
      if (!isOfflineMode && typeof syncedCode === "string") {
        setCode(syncedCode);
        setProjectFiles((prev) =>
          prev.map((f) => (f.id === activeFileId ? { ...f, content: syncedCode } : f))
        );
      }

      if (syncedLanguage) {
        setLanguage(syncedLanguage);
      }

      setIsLoading(false);
      setIsSaving(false);
    };

    const handleCodeChange = ({ code: nextCode, language: nextLanguage, updatedBy }) => {
      if (!isOfflineMode && typeof nextCode === "string") {
        setCode(nextCode);
        setProjectFiles((prev) =>
          prev.map((f) => (f.id === activeFileId ? { ...f, content: nextCode } : f))
        );
      }

      if (nextLanguage) {
        setLanguage(nextLanguage);
      }

      setActiveCollaborator(updatedBy || "");

      if (typingIndicatorTimerRef.current) {
        clearTimeout(typingIndicatorTimerRef.current);
      }

      typingIndicatorTimerRef.current = setTimeout(() => {
        setActiveCollaborator("");
      }, 1200);
    };

    const handleChatMessage = (message) => {
      setMessages((previous) => [...previous, message].slice(-MAX_MESSAGES));
    };

    const handleTyping = ({ username, isTyping: nextTyping }) => {
      if (!username || username === user?.username) {
        return;
      }

      setTypingUsers((previous) => {
        const withoutUser = previous.filter((item) => item !== username);
        return nextTyping ? [...withoutUser, username] : withoutUser;
      });
    };

    const handleRoomTerminated = ({ message }) => {
      toast.error(message || "This room has been terminated.");
      navigate("/dashboard");
    };

    const handleSystemBroadcast = ({ message, sender }) => {
      toast.custom(
        (t) => (
          <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl font-bold shadow-2xl border-2 border-amber-300 flex items-center gap-3">
            <span className="text-lg">🚨</span>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-900">SYSTEM BROADCAST FROM @{sender}</p>
              <p className="text-xs font-bold">{message}</p>
            </div>
          </div>
        ),
        { duration: 9000 }
      );
    };

    const handleHistoryUpdated = ({ roomId: eventRoomId, history: nextHistory }) => {
      if (eventRoomId && eventRoomId !== roomId) {
        return;
      }
      if (nextHistory) {
        setHistory(nextHistory);
      }
    };

    const handleProjectProgressUpdated = ({ progress: nextProgress, stage: nextStage, updatedBy }) => {
      if (nextProgress !== undefined) setProjectProgress(nextProgress);
      if (nextStage !== undefined) setProjectStage(nextStage);
      if (updatedBy && updatedBy !== user?.username) {
        toast.success(`Project stage updated to Stage ${nextStage} (${nextProgress}%) by @${updatedBy}`);
      }
    };

    const handleNewPullRequest = (prData) => {
      setPendingPRs((prev) => [...prev, prData]);
      toast.success(`New Offline Code PR submitted by @${prData.author}!`);
    };

    const handlePRApproved = ({ approvedCode, approvedBy }) => {
      setCode(approvedCode);
      setProjectFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, content: approvedCode } : f))
      );
      toast.success(`PR approved & code merged live by Team Leader @${approvedBy}!`);
    };

    const handleUserPinged = ({ fromUser, targetUserId, message }) => {
      if (user?.id === targetUserId || targetUserId === "all" || fromUser.id !== user?.id) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1">
              <span className="font-bold text-amber-300">🚨 Alert Notification</span>
              <span className="text-xs">{message}</span>
            </div>
          ),
          { duration: 5000, icon: "🔔" }
        );
      }
    };

    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("sync-code", handleSyncCode);
    socket.on("code-change", handleCodeChange);
    socket.on("chat-message", handleChatMessage);
    socket.on("typing", handleTyping);
    socket.on("room-terminated", handleRoomTerminated);
    socket.on("system-broadcast", handleSystemBroadcast);
    socket.on("history-updated", handleHistoryUpdated);
    socket.on("project-progress-updated", handleProjectProgressUpdated);
    socket.on("new-pull-request", handleNewPullRequest);
    socket.on("pr-approved", handlePRApproved);
    socket.on("user-pinged", handleUserPinged);

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("sync-code", handleSyncCode);
      socket.off("code-change", handleCodeChange);
      socket.off("chat-message", handleChatMessage);
      socket.off("typing", handleTyping);
      socket.off("room-terminated", handleRoomTerminated);
      socket.off("system-broadcast", handleSystemBroadcast);
      socket.off("history-updated", handleHistoryUpdated);
      socket.off("project-progress-updated", handleProjectProgressUpdated);
      socket.off("new-pull-request", handleNewPullRequest);
      socket.off("pr-approved", handlePRApproved);
      socket.off("user-pinged", handleUserPinged);
    };
  }, [socket, user?.id, user?.username, isOfflineMode, activeFileId, navigate]);

  // 1. Fetch Room Data via HTTP REST endpoint upon mounting or roomId change
  useEffect(() => {
    if (!roomId) {
      return undefined;
    }

    let isMounted = true;
    let fallbackTimeout = null;

    const loadRoomData = async () => {
      try {
        setIsLoading(true);
        setMessages([]);
        setTypingUsers([]);
        setUsers([]);
        setHistory([]);

        // Fallback timer to prevent skeleton UI from hanging indefinitely
        fallbackTimeout = setTimeout(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        }, 3000);

        // Ensure user is joined & fetch latest room details
        const joinResponse = await api.joinRoom({ roomId });

        if (!isMounted) {
          return;
        }

        const room = joinResponse.room;
        setRoomMeta(room);

        // Populate initial room code into editor state if present
        if (typeof room?.code === "string" && room.code.trim()) {
          setCode(room.code);
          setProjectFiles((prev) =>
            prev.map((f) => (f.id === activeFileId ? { ...f, content: room.code } : f))
          );
        }

        const creatorId = room?.createdBy?.id || room?.createdBy?._id || room?.createdBy;
        const spectatorStatus =
          user?.role === "admin" && creatorId && String(creatorId) !== String(user?.id);

        setIsSpectator(Boolean(spectatorStatus));
        setIsLoading(false);
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Unable to load the room.");
          setIsLoading(false);
          navigate("/dashboard");
        }
      }
    };

    loadRoomData();

    return () => {
      isMounted = false;

      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (typingIndicatorTimerRef.current) {
        clearTimeout(typingIndicatorTimerRef.current);
      }
    };
  }, [roomId, user?.id, navigate]);

  // 2. Real-Time Socket Connection & Room Event Sync
  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      return undefined;
    }

    let isMounted = true;

    socket.emit(
      "join-room",
      {
        roomId,
        language: getLanguageFromFilename(activeFile.name),
        isSpectator,
      },
      (response) => {
        if (!isMounted) {
          return;
        }

        if (!response?.success) {
          toast.error(response?.message || "Unable to sync with active room.");
          return;
        }

        setUsers(response.activeUsers || []);
        setIsTeamLeader(Boolean(response.isTeamLeader));
        setHistory(response.history || []);

        // Sync real-time room code broadcast from server
        if (typeof response.code === "string" && response.code.trim()) {
          setCode(response.code);
          setProjectFiles((prev) =>
            prev.map((f) => (f.id === activeFileId ? { ...f, content: response.code } : f))
          );
        }
      }
    );

    return () => {
      isMounted = false;
      if (socket && socket.connected) {
        socket.emit("leave-room", { roomId });
      }
    };
  }, [socket, isConnected, roomId, isSpectator]);

  // File Tree Switcher Handler
  const handleSelectFile = (fileId) => {
    const targetFile = projectFiles.find((f) => f.id === fileId);
    if (!targetFile) return;

    const fileLang = getLanguageFromFilename(targetFile.name);

    setActiveFileId(fileId);
    setCode(targetFile.content);
    setLanguage(fileLang);

    setProjectFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, language: fileLang } : f))
    );

    toast.success(`Opened ${targetFile.name} (${fileLang})`);
  };

  const handleCreateFile = (filename) => {
    const fileLang = getLanguageFromFilename(filename);

    const newFile = {
      id: `f-${Date.now()}`,
      name: filename,
      language: fileLang,
      content: `// New file: ${filename}\n`,
    };

    setProjectFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setCode(newFile.content);
    setLanguage(fileLang);
    toast.success(`Created file ${filename}`);
  };

  const handleCreateFolder = (foldername) => {
    toast.success(`Created folder /${foldername}`);
  };

  const handleDeleteFile = (fileId) => {
    if (!isTeamLeader) {
      toast.error("Only the Team Leader has permission to delete workspace files.");
      return;
    }
    if (projectFiles.length <= 1) return;
    const remaining = projectFiles.filter((f) => f.id !== fileId);
    const nextFile = remaining[0];
    const nextLang = getLanguageFromFilename(nextFile.name);

    setProjectFiles(remaining);
    setActiveFileId(nextFile.id);
    setCode(nextFile.content);
    setLanguage(nextLang);
    toast.success("File deleted");
  };

  const handleEditorChange = (nextCode) => {
    setCode(nextCode);

    setProjectFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: nextCode } : f))
    );

    if (isOfflineMode) {
      return;
    }

    setIsSaving(true);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      socket?.emit(
        "code-change",
        {
          roomId,
          code: nextCode,
          language,
        },
        (response) => {
          if (!response?.success) {
            toast.error(response?.message || "Failed to sync code.");
          }

          setIsSaving(false);
        }
      );
    }, 260);
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);

    const newExt = getFileExtension(nextLanguage);
    const baseName = activeFile.name.split(".")[0];
    const newFileName = `${baseName}.${newExt}`;

    setProjectFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? { ...f, name: newFileName, language: nextLanguage }
          : f
      )
    );

    setIsSaving(true);

    socket?.emit(
      "code-change",
      {
        roomId,
        code,
        language: nextLanguage,
      },
      (response) => {
        if (!response?.success) {
          toast.error(response?.message || "Failed to update language.");
        }

        setIsSaving(false);
      }
    );
  };

  const handleSendMessage = (message, extraData = {}) => {
    socket?.emit(
      "chat-message",
      {
        roomId,
        message,
        ...extraData,
      },
      (response) => {
        if (!response?.success) {
          toast.error(response?.message || "Failed to send message.");
        }
      }
    );
  };

  const handleTypingChange = (isTyping) => {
    socket?.emit("typing", { roomId, isTyping });
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      toast.success("Room ID copied to clipboard.");
    } catch (error) {
      toast.error("Clipboard copy failed.");
    }
  };

  const handleLeaveRoom = () => {
    socket?.emit("leave-room", { roomId });
    navigate("/dashboard");
  };

  const handleSaveHistory = () => {
    if (!socket || !isConnected) {
      toast.error("Not connected to server.");
      return;
    }
    socket.emit(
      "save-history",
      {
        roomId,
        code,
        language,
      },
      (response) => {
        if (response?.success) {
          toast.success("Code snapshot saved!");
        } else {
          toast.error(response?.message || "Failed to save snapshot.");
        }
      }
    );
  };

  const handleRollback = (entry) => {
    if (!entry) return;
    toast.success(`Restoring snapshot by @${entry.savedBy}`);

    setCode(entry.code);
    setLanguage(entry.language);

    socket?.emit(
      "code-change",
      {
        roomId,
        code: entry.code,
        language: entry.language,
      },
      (response) => {
        if (!response?.success) {
          toast.error(response?.message || "Failed to sync rollback.");
        }
      }
    );
  };

  const handlePingUser = (targetMember) => {
    socket?.emit("ping-user", {
      roomId,
      targetUserId: targetMember.id,
      targetUsername: targetMember.username,
    });
    toast.success(`🚨 Alert sent to @${targetMember.username}!`);
  };

  // Git Branch Manager actions
  const handleCreateBranch = (newBranchName) => {
    setBranches((prev) => ({
      ...prev,
      [newBranchName]: { code, lastCommit: `Created branch ${newBranchName}` },
    }));
    setActiveBranch(newBranchName);
    toast.success(`Switched to new branch '${newBranchName}'`);
  };

  const handleSwitchBranch = (branchName) => {
    if (!branches[branchName]) return;
    setActiveBranch(branchName);
    const branchCode = branches[branchName].code || code;
    setCode(branchCode);
    toast.success(`Switched to branch '${branchName}'`);
  };

  const handleCommitChanges = (commitMsg) => {
    setBranches((prev) => ({
      ...prev,
      [activeBranch]: { code, lastCommit: commitMsg },
    }));
    toast.success(`Committed changes: "${commitMsg}"`);
  };

  const handleMergeBranch = (sourceB, targetB) => {
    const sourceCode = branches[sourceB]?.code || "";
    setBranches((prev) => ({
      ...prev,
      [targetB]: { code: sourceCode, lastCommit: `Merged '${sourceB}' into '${targetB}'` },
    }));
    if (activeBranch === targetB) {
      setCode(sourceCode);
    }
    toast.success(`Successfully merged '${sourceB}' into '${targetB}'`);
  };

  // Offline Working Mode & Submit Pull Request Action
  const toggleOfflineMode = () => {
    if (!isOfflineMode) {
      setIsOfflineMode(true);
      toast("Entered Offline Working Mode. Your edits won't broadcast live until pushed!", { icon: "🔌" });
    } else {
      setIsOfflineMode(false);
      toast.success("Exited Offline Mode. Live sync re-enabled.");
    }
  };

  const handleSubmitPullRequest = () => {
    const prData = {
      id: `pr-${Date.now()}`,
      author: user?.username || "Developer",
      code: code,
      note: prCommitNote.trim() || "Offline code changes",
      timestamp: Date.now(),
    };

    socket?.emit("submit-pull-request", { roomId, prData });
    toast.success("Submitted Pull Request to Team Leader!");
    setPrCommitNote("");
  };

  const handleApprovePR = (prItem) => {
    socket?.emit("approve-pull-request", {
      roomId,
      approvedCode: prItem.code,
      approvedBy: user?.username,
    });
    setPendingPRs((prev) => prev.filter((p) => p.id !== prItem.id));
    setCode(prItem.code);
    toast.success(`Approved PR from @${prItem.author}! Code pushed live.`);
  };

  const handleRejectPR = (prId) => {
    setPendingPRs((prev) => prev.filter((p) => p.id !== prId));
    toast("PR rejected.", { icon: "🚫" });
  };

  // Project Progress Bar update action
  const handleUpdateProjectProgress = (newProgress, newStage) => {
    setProjectProgress(newProgress);
    setProjectStage(newStage);
    toast.success(`Updated project completion to Stage ${newStage} (${newProgress}%)`);

    socket?.emit("project-progress-update", {
      roomId,
      progress: newProgress,
      stage: newStage,
      updatedBy: user?.username,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] p-6 flex flex-col gap-6">
        <div className="skeleton-bar h-16 w-full" />
        <div className="grid flex-1 gap-6 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
          <div className="skeleton-bar h-[600px] w-full" />
          <div className="skeleton-bar h-[600px] w-full" />
          <div className="skeleton-bar h-[600px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen app-shell font-display text-white selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
      {/* Dynamic Animated Background Carousel with Ken Burns Motion & Particles */}
      <AnimatedBackground intervalDuration={7000} />

      {/* ================= DEDICATED STUDIO HEADER ================= */}
      <header className="app-header sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Brand & Room Tag */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF] text-white font-medium shadow-sm">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">CodeTMC Studio</span>
              <span className="font-mono text-xs font-medium text-slate-300 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10">
                #{roomId}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Created by @{roomMeta?.createdBy?.username || user?.username}
            </p>
          </div>
        </div>

        {/* Center: Offline Mode & PR Review Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Offline Mode Toggle Button */}
          <button
            onClick={toggleOfflineMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              isOfflineMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
          >
            <WifiOff size={15} />
            <span>{isOfflineMode ? "Offline Working Active" : "Go Offline Mode"}</span>
          </button>

          {/* Submit PR Button (If in offline mode) */}
          {isOfflineMode && (
            <button
              onClick={handleSubmitPullRequest}
              className="gradient-button text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 shadow-glow"
            >
              <Send size={13} /> Submit PR to Team Leader
            </button>
          )}

          {/* Team Leader PR Review Center Trigger */}
          {pendingPRs.length > 0 && (
            <button
              onClick={() => setIsPRModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-bounce"
            >
              <GitPullRequest size={15} />
              <span>Review PRs ({pendingPRs.length})</span>
            </button>
          )}

          {/* Git Branch Selector */}
          <button
            onClick={() => setIsGitModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-bold hover:bg-violet-500/20 transition"
          >
            <GitBranch size={15} />
            <span className="font-mono">{activeBranch}</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRoomId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy ID"}</span>
          </button>

          <button
            onClick={() => socket?.emit("sync-code", { roomId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleLeaveRoom}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 transition"
          >
            <LogOut size={14} />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* ================= WORK PROGRESS COMPLETION STATUS BAR ================= */}
      <div className="px-6 pt-3">
        <ProjectProgressBar
          progress={projectProgress}
          stage={projectStage}
          onUpdateProgress={handleUpdateProjectProgress}
        />
      </div>

      {/* ================= MAIN STUDIO WORKSPACE (3 PANELS) ================= */}
      <div className="flex-1 p-4 md:p-6 grid gap-4 grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)_auto] items-stretch min-h-[calc(100vh-8rem)]">
        {/* ================= LEFT PANEL: FILE EXPLORER & COLLABORATORS TABBED HUB ================= */}
        {isLeftPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full xl:w-[320px] flex flex-col gap-3 shrink-0"
          >
            {/* Left Panel Tab Switcher */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setLeftTab("explorer")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    leftTab === "explorer"
                      ? "bg-violet-500/20 text-white border border-violet-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FolderOpen size={13} /> Files
                </button>

                <button
                  onClick={() => setLeftTab("collaborators")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    leftTab === "collaborators"
                      ? "bg-violet-500/20 text-white border border-violet-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users size={13} /> Team ({users.length})
                </button>

                <button
                  onClick={() => setLeftTab("history")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    leftTab === "history"
                      ? "bg-violet-500/20 text-white border border-violet-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <History size={13} /> History
                </button>
              </div>

              <button
                onClick={() => setIsLeftPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Collapse Left Panel"
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Left Panel Active Tab Content */}
            <div className={leftTab === "explorer" ? "flex-1 block" : "hidden"}>
              <FileExplorer
                files={projectFiles}
                activeFileId={activeFileId}
                isTeamLeader={isTeamLeader}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onDeleteFile={handleDeleteFile}
              />
            </div>

            <div className={leftTab === "collaborators" ? "flex flex-col gap-4 flex-1 block" : "hidden"}>
              <UserList
                users={users}
                roomMeta={roomMeta}
                history={history}
                currentUserId={user?.id}
                onPingUser={handlePingUser}
              />
            </div>

            <div className={leftTab === "history" ? "flex-1 block" : "hidden"}>
              <HistoryLog history={history} onRollback={handleRollback} />
            </div>

            {/* Persistent VideoChat component: stays connected in background */}
            <div className={leftTab === "collaborators" ? "block mt-4" : "hidden"}>
              <VideoChat
                socket={socket}
                roomId={roomId}
                user={user}
                isTeamLeader={isTeamLeader}
                activeUsers={users}
                isSpectator={isSpectator}
              />
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsLeftPanelOpen(true)}
            className="hidden xl:flex items-center justify-center p-2 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white transition self-start"
            title="Expand Left Panel"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* ================= CENTER PANEL: MONACO IDE EDITOR ================= */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor
            roomId={roomId}
            code={code}
            language={language}
            activeFileName={activeFile.name}
            isSaving={isSaving}
            activeCollaborator={activeCollaborator}
            onChange={handleEditorChange}
            onLanguageChange={handleLanguageChange}
            onSave={handleSaveHistory}
            files={projectFiles}
            onOpenPreview={() => setIsPreviewOpen(true)}
          />
        </div>

        {/* ================= RIGHT PANEL: LIVE TEAM CHAT ================= */}
        {isRightPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full xl:w-[340px] flex flex-col shrink-0"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-violet-400" /> Chat Panel
              </span>
              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Collapse Chat Panel"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              onTypingChange={handleTypingChange}
              typingUsers={typingUsers}
              currentUserId={user?.id}
            />
          </motion.div>
        ) : (
          <button
            onClick={() => setIsRightPanelOpen(true)}
            className="hidden xl:flex items-center justify-center p-2 rounded-xl border border-white/10 bg-slate-900 text-slate-300 hover:text-white transition self-start"
            title="Expand Chat Panel"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Root Level Web Preview Sandbox Overlay */}
      <LiveWebPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        code={code}
        language={language}
        files={projectFiles}
      />

      {/* Git Branch Manager Modal */}
      <GitBranchManager
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
        branches={branches}
        activeBranch={activeBranch}
        onCreateBranch={handleCreateBranch}
        onSwitchBranch={handleSwitchBranch}
        onCommitChanges={handleCommitChanges}
        onMergeBranch={handleMergeBranch}
        currentCode={code}
      />

      {/* Pull Request Review Modal */}
      <PullRequestModal
        isOpen={isPRModalOpen}
        onClose={() => setIsPRModalOpen(false)}
        pendingPRs={pendingPRs}
        onApprovePR={handleApprovePR}
        onRejectPR={handleRejectPR}
      />
    </div>
  );
}

export default Room;
