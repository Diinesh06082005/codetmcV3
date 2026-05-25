import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function ChatBox({ messages, onSendMessage, onTypingChange, typingUsers, currentUserId }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingChangeRef = useRef(onTypingChange);

  useEffect(() => {
    typingChangeRef.current = onTypingChange;
  }, [onTypingChange]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingChangeRef.current(false);
    };
  }, []);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setDraft(nextValue);
    typingChangeRef.current(Boolean(nextValue.trim()));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      typingChangeRef.current(false);
    }, 900);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const message = draft.trim();

    if (!message) {
      return;
    }

    onSendMessage(message);
    setDraft("");
    typingChangeRef.current(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card flex h-full min-h-[560px] flex-col p-5"
    >
      <div className="mb-5">
        <p className="panel-title">Team Chat</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Room Conversation</h2>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length ? (
          messages.map((message) => {
            const isCurrentUser = message.user?.id === currentUserId;

            return (
              <div
                key={message.id}
                className={`rounded-2xl border px-3 py-3 ${
                  isCurrentUser
                    ? "ml-8 border-teal-300/20 bg-teal-300/10"
                    : "mr-8 border-white/10 bg-slate-900/50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{message.username}</span>
                  <span>
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-100">{message.message}</p>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
            Messages sent in this room will appear here.
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-4 min-h-6 text-xs text-teal-100/80">
        {typingUsers.length ? `${typingUsers.join(", ")} typing...` : ""}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 space-y-3">
        <textarea
          value={draft}
          onChange={handleChange}
          rows={3}
          placeholder="Drop a note for the room..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="gradient-button w-full"
        >
          Send Message
        </button>
      </form>
    </motion.section>
  );
}

export default ChatBox;
