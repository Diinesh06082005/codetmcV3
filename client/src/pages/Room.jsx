import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ChatBox from "../components/ChatBox.jsx";
import Editor from "../components/Editor.jsx";
import Navbar from "../components/Navbar.jsx";
import UserList from "../components/UserList.jsx";
import VideoChat from "../components/VideoChat.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";

const MAX_MESSAGES = 100;
const DEFAULT_LANGUAGE = "javascript";

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  const [code, setCode] = useState("// Connecting to your room...");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
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
      if (typeof syncedCode === "string") {
        setCode(syncedCode);
      }

      if (syncedLanguage) {
        setLanguage(syncedLanguage);
      }

      setIsLoading(false);
      setIsSaving(false);
    };

    const handleCodeChange = ({ code: nextCode, language: nextLanguage, updatedBy }) => {
      if (typeof nextCode === "string") {
        setCode(nextCode);
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

    socket.on("room-users", handleRoomUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("sync-code", handleSyncCode);
    socket.on("code-change", handleCodeChange);
    socket.on("chat-message", handleChatMessage);
    socket.on("typing", handleTyping);
    socket.on("room-terminated", handleRoomTerminated);

    return () => {
      socket.off("room-users", handleRoomUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("sync-code", handleSyncCode);
      socket.off("code-change", handleCodeChange);
      socket.off("chat-message", handleChatMessage);
      socket.off("typing", handleTyping);
      socket.off("room-terminated", handleRoomTerminated);
    };
  }, [socket, user?.id, user?.username, navigate]);

  useEffect(() => {
    if (presenceTimerRef.current) {
      clearTimeout(presenceTimerRef.current);
    }

    if (!presenceEvent) {
      return undefined;
    }

    presenceTimerRef.current = setTimeout(() => {
      setPresenceEvent(null);
    }, 2200);

    return () => {
      if (presenceTimerRef.current) {
        clearTimeout(presenceTimerRef.current);
      }
    };
  }, [presenceEvent]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [copied]);

  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      return undefined;
    }

    let isMounted = true;

    const joinActiveRoom = async () => {
      try {
        setIsLoading(true);
        setMessages([]);
        setTypingUsers([]);
        setUsers([]);

        const roomResponse = await api.getRoom({ roomId });

        if (!isMounted) {
          return;
        }

        setRoomMeta(roomResponse.room);
        setCode(roomResponse.room.code);

        await api.joinRoom({ roomId });

        if (!isMounted) {
          return;
        }

        const spectatorStatus = user?.role === "admin" && roomResponse.room.createdBy !== user?.id;
        setIsSpectator(spectatorStatus);

        socket.emit(
          "join-room",
          {
            roomId,
            language: DEFAULT_LANGUAGE,
            isSpectator: spectatorStatus,
          },
          (response) => {
            if (!isMounted) {
              return;
            }

            if (!response?.success) {
              toast.error(response?.message || "Unable to join the room.");
              navigate("/dashboard");
              return;
            }

            setUsers(response.activeUsers || []);
            setCode(
              typeof response.code === "string" ? response.code : roomResponse.room.code
            );
            setLanguage(response.language || DEFAULT_LANGUAGE);
            setIsTeamLeader(response.isTeamLeader);
            setIsLoading(false);
          }
        );
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Unable to load the room.");
          navigate("/dashboard");
        }
      }
    };

    joinActiveRoom();

    return () => {
      isMounted = false;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      if (typingIndicatorTimerRef.current) {
        clearTimeout(typingIndicatorTimerRef.current);
      }

      socket.emit("leave-room", { roomId });
    };
  }, [socket, isConnected, roomId, navigate]);

  const handleEditorChange = (nextCode) => {
    setCode(nextCode);
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

  const handleSendMessage = (message) => {
    socket?.emit(
      "chat-message",
      {
        roomId,
        message,
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

  const handleLogout = async () => {
    socket?.emit("leave-room", { roomId });
    await logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  const collaboratorCountLabel =
    users.length === 1 ? "1 collaborator online" : `${users.length} collaborators online`;

  if (isLoading) {
    return (
      <div className="app-shell min-h-screen px-4 py-6 md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-8">
          <Navbar
            roomId={roomId}
            isConnected={isConnected}
            user={user}
            onLogout={handleLogout}
          />
          <div className="grid flex-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
            {[0, 1, 2].map((item) => (
              <div key={item} className="glass-card flex min-h-[560px] flex-col gap-4 p-5">
                <div className="skeleton-bar h-3 w-24" />
                <div className="skeleton-bar h-10 w-3/4" />
                <div className="skeleton-bar h-28 w-full" />
                <div className="skeleton-bar h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <Navbar
          roomId={roomId}
          isConnected={isConnected}
          user={user}
          onLeave={handleLeaveRoom}
          onLogout={handleLogout}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="panel-title">Session</p>
            <h2 className="mt-2 text-lg font-semibold text-white tracking-tight">{collaboratorCountLabel}</h2>
            <p className="mt-1 text-sm text-apple-textMuted">
              Created by @{roomMeta?.createdBy?.username || user?.username} |{" "}
              {roomMeta?.createdAt
                ? new Date(roomMeta.createdAt).toLocaleString()
                : "recently"}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCopyRoomId}
                className={`rounded-[16px] border px-4 py-2 text-sm transition duration-300 ${
                  copied
                    ? "border-green-400/40 bg-green-400/15 text-green-400"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {copied ? "Copied" : "Copy Room ID"}
              </motion.button>
              <button
                type="button"
                onClick={() => socket?.emit("sync-code", { roomId })}
                className="rounded-[16px] border border-apple-blue/30 bg-apple-blue/10 px-4 py-2 text-sm text-apple-blue transition duration-300 hover:bg-apple-blue/20"
              >
                Re-sync Code
              </button>
            </div>

            <AnimatePresence>
              {presenceEvent ? (
                <motion.div
                  key={presenceEvent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-[16px] px-4 py-2 text-xs font-medium ${
                    presenceEvent.tone === "join"
                      ? "bg-apple-blue/15 text-apple-blue"
                      : "bg-red-400/15 text-red-400"
                  }`}
                >
                  {presenceEvent.message}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        <main className="grid flex-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <UserList users={users} currentUserId={user?.id} />
            <VideoChat 
              socket={socket} 
              roomId={roomId} 
              user={user} 
              isTeamLeader={isTeamLeader} 
              activeUsers={users}
              isSpectator={isSpectator}
            />
          </div>
          <Editor
            code={code}
            language={language}
            isSaving={isSaving}
            activeCollaborator={activeCollaborator}
            onChange={handleEditorChange}
            onLanguageChange={handleLanguageChange}
          />
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            onTypingChange={handleTypingChange}
            typingUsers={typingUsers}
            currentUserId={user?.id}
          />
        </main>
      </div>
    </div>
  );
}

export default Room;
