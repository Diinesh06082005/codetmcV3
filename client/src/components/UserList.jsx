import { motion } from "framer-motion";

function UserList({ users = [], currentUserId }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card flex h-full min-h-[560px] flex-col p-5"
    >
      <div className="mb-5">
        <p className="panel-title">Presence</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Active Collaborators</h2>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {users.length ? (
          users.map((user) => {
            const initials = user.username
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 px-3 py-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-300/10 font-semibold text-teal-100">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.username}</p>
                  <p className="truncate text-xs text-slate-400">
                    {user.id === currentUserId ? "You" : user.email}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
            Waiting for teammates to join this room.
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default UserList;
