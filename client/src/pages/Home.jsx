import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import { api } from "../utils/api.js";
import { formatDate, formatDateTime } from "../utils/formatters.js";
import { sanitizeRoomIdInput, validateRoomId } from "../utils/validators.js";

function Home() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { isConnected } = useSocket();
  const [roomId, setRoomId] = useState("");
  const [customRoomId, setCustomRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const createRoomRef = useRef(null);
  const joinRoomRef = useRef(null);
  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    if (hasRefreshedRef.current) {
      return;
    }

    hasRefreshedRef.current = true;
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const controlCenterItems = [
    { label: "Username", value: user?.username ? `@${user.username}` : "Unavailable" },
    { label: "Email", value: user?.email || "Unavailable" },
    { label: "Member Since", value: formatDate(user?.createdAt) },
    { label: "Active Sessions", value: String(user?.activeSessionsCount || 0) },
    { label: "Last Login", value: formatDateTime(user?.lastLoginAt, "First session") },
  ];

  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    try {
      setIsCreating(true);
      const response = await api.createRoom({
        roomId: customRoomId || undefined,
      });
      toast.success(`Room ${response.room.roomId} is ready.`);
      navigate(`/room/${response.room.roomId}`);
    } catch (error) {
      toast.error(error.message || "Unable to create a room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRequestUpgrade = async () => {
    try {
      const response = await api.requestUpgrade();
      toast.success(response.message);
      await refreshUser();
    } catch (error) {
      toast.error(error.message || "Unable to request upgrade.");
    }
  };

  const handleJoinRoom = async (event) => {
    event.preventDefault();

    const { roomId: nextRoomId, isValid } = validateRoomId(roomId);

    if (!isValid) {
      toast.error("Enter a valid room ID before joining.");
      return;
    }

    try {
      setIsJoining(true);
      await api.joinRoom({ roomId: nextRoomId });
      toast.success("Joining room...");
      navigate(`/room/${nextRoomId}`);
    } catch (error) {
      toast.error(error.message || "Unable to join that room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-8">
        <Navbar isConnected={isConnected} user={user} onLogout={handleLogout} />

        <main className="grid flex-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-card-strong relative overflow-hidden p-8 md:p-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-apple-blue/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="panel-title">Control Center</p>
                  <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white md:text-5xl tracking-tight">
                    Clean control for your next live coding session.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-apple-textMuted">
                    Keep your profile details visible, check session activity, and move
                    straight into the room you need.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => scrollToSection(createRoomRef)}
                    className="gradient-button px-5 py-3"
                  >
                    Create Room
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => scrollToSection(joinRoomRef)}
                    className="subtle-button px-5 py-3"
                  >
                    Join Room
                  </motion.button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {controlCenterItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.05 * index }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[20px] border border-white/5 bg-white/5 px-5 py-5 transition duration-300 hover:bg-white/10"
                  >
                    <p className="text-xs font-medium text-apple-textMuted">{item.label}</p>
                    <p className="mt-3 truncate text-lg font-semibold text-white tracking-tight">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6">
            <motion.section
              ref={createRoomRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
              className="glass-card p-8"
            >
              <p className="panel-title">Create Room</p>
              <h2 className="mt-3 text-2xl font-semibold text-white tracking-tight">Open a new session</h2>
              <p className="mt-3 text-sm leading-6 text-apple-textMuted">
                Launch instantly or reserve a custom room code.
              </p>

              <form onSubmit={handleCreateRoom} className="mt-8 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-apple-textMuted">Custom Room ID (Optional)</span>
                  <input
                    value={customRoomId}
                    onChange={(event) => setCustomRoomId(sanitizeRoomIdInput(event.target.value))}
                    placeholder="SPRINT24"
                    className="input-shell font-mono"
                    disabled={user?.roomsCreatedToday?.count >= user?.roomLimit && user?.role !== "admin"}
                  />
                </label>

                {user?.role !== "admin" && (
                  <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-apple-textMuted">
                        Daily Rooms: <span className="text-white font-medium">{user?.roomsCreatedToday?.count || 0} / {user?.roomLimit}</span>
                      </p>
                      {user?.roomsCreatedToday?.count >= user?.roomLimit && (
                        <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded-md">Limit Reached</span>
                      )}
                    </div>

                    {user?.upgradeStatus === "pending" ? (
                      <p className="text-xs text-amber-400 font-medium">Upgrade request pending admin approval.</p>
                    ) : user?.upgradeStatus === "approved" ? (
                      <p className="text-xs text-green-400 font-medium">Room limit upgraded.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestUpgrade}
                        className="w-full rounded-[12px] border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition duration-300 hover:bg-white/10"
                      >
                        Request Limit Upgrade
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating || (user?.role !== "admin" && user?.roomsCreatedToday?.count >= user?.roomLimit)}
                  className="gradient-button flex w-full items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Room...
                    </>
                  ) : user?.role !== "admin" && user?.roomsCreatedToday?.count >= user?.roomLimit ? (
                    "Limit Reached"
                  ) : (
                    "Create Room"
                  )}
                </button>
              </form>
            </motion.section>

            <motion.section
              ref={joinRoomRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.15 }}
              className="glass-card p-8"
            >
              <p className="panel-title">Join Room</p>
              <h2 className="mt-3 text-2xl font-semibold text-white tracking-tight">Return to an existing room</h2>
              <p className="mt-3 text-sm leading-6 text-apple-textMuted">
                Enter a room code and reconnect to the live workspace.
              </p>

              <form onSubmit={handleJoinRoom} className="mt-8 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-apple-textMuted">Room ID</span>
                  <input
                    value={roomId}
                    onChange={(event) => setRoomId(sanitizeRoomIdInput(event.target.value))}
                    placeholder="AB12CD34"
                    className="input-shell font-mono"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isJoining}
                  className="subtle-button flex w-full items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isJoining ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Joining Room...
                    </>
                  ) : (
                    "Join Room"
                  )}
                </button>
              </form>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
