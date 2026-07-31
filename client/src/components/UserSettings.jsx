import { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, Layers, Palette, Key, CheckCircle, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext.jsx";
import { formatDate } from "../utils/formatters.js";

function UserSettings({ user, onRequestUpgrade }) {
  const { theme, setTheme, THEMES } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsRequesting(true);
      await onRequestUpgrade();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Profile Overview Card */}
      <div className="glass-card p-6 flex flex-col gap-5 border border-white/10">
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 font-extrabold text-xl text-white shadow-glow">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">@{user?.username}</h3>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Account ID:</span>
            <span className="font-mono text-slate-200">{user?.id || user?._id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Member Since:</span>
            <span className="font-semibold text-white">{formatDate(user?.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-slate-400">Total Coding Time:</span>
            <span className="font-semibold text-emerald-400">{Math.round((user?.totalTimeSpent || 0) / 60000)} minutes</span>
          </div>
        </div>
      </div>

      {/* Room Limit & Quota Card */}
      <div className="glass-card p-6 flex flex-col gap-5 border border-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Daily Room Quota</h3>
            <p className="text-xs text-slate-400">Manage daily workspace creation limits</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Rooms Created Today:</span>
            <span className="font-bold text-white text-sm">
              {user?.roomsCreatedToday?.count || 0} / {user?.roomLimit || 5}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-black/60 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  ((user?.roomsCreatedToday?.count || 0) / (user?.roomLimit || 5)) * 100
                )}%`,
              }}
            />
          </div>

          <div className="pt-2">
            {user?.role === "admin" ? (
              <p className="text-xs text-emerald-400 font-semibold">Admin Account: Unlimited workspace creation active.</p>
            ) : user?.upgradeStatus === "pending" ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Upgrade request pending admin approval.
              </div>
            ) : user?.upgradeStatus === "approved" ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                Limit upgrade approved! Your new room limit is {user?.roomLimit}.
              </div>
            ) : (
              <button
                onClick={handleUpgradeClick}
                disabled={isRequesting}
                className="gradient-button w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                Request Limit Upgrade <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettings;
