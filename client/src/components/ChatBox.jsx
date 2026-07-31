import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Square, Trash2, Volume2 } from "lucide-react";
import toast from "react-hot-toast";
import VoiceNotePlayer from "./VoiceNotePlayer.jsx";

function ChatBox({ messages, onSendMessage, onTypingChange, typingUsers, currentUserId }) {
  const [draft, setDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const endRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
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
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      typingChangeRef.current(false);
    };
  }, []);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone permission denied or audio device missing.");
    }
  };

  const stopAndSendVoiceNote = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    const mediaRecorder = mediaRecorderRef.current;
    const duration = recordingSeconds;

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result;
        onSendMessage(`[Voice Note - ${duration}s]`, {
          isVoiceNote: true,
          audioUrl: base64Audio,
          duration,
        });
        toast.success("Voice note sent!");
      };

      // Stop all mic tracks
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.stop();
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
      toast("Recording discarded.");
    }
  };

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
    event?.preventDefault();
    const message = draft.trim();
    if (!message) return;

    onSendMessage(message);
    setDraft("");
    typingChangeRef.current(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card flex h-full min-h-[580px] flex-col p-5 border border-white/10"
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="panel-title">Team Chat & Audio</p>
          <h2 className="mt-0.5 text-base font-bold text-white tracking-tight">Live Discussion</h2>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-white/10">
          {messages.length} msgs
        </span>
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length ? (
          messages.map((message) => {
            const senderId = message.user?.id || message.user?._id || message.user || message.userId;
            const isCurrentUser = Boolean(senderId && String(senderId) === String(currentUserId));
            const isVoice = Boolean(message.isVoiceNote || message.audioUrl);

            return (
              <div
                key={message.id || Math.random()}
                className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 border text-xs leading-relaxed shadow-sm ${
                    isCurrentUser
                      ? "rounded-tr-xs border-[#007AFF]/30 bg-[#007AFF]/20 text-white"
                      : "rounded-tl-xs border-white/10 bg-slate-900/90 text-slate-100"
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px] text-slate-400">
                    <span className="font-medium text-slate-200">@{message.username}</span>
                    <span>
                      {new Date(message.sentAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {isVoice ? (
                    <VoiceNotePlayer audioUrl={message.audioUrl} duration={message.duration} />
                  ) : (
                    <p className="whitespace-pre-wrap text-xs text-slate-100">{message.message}</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center text-xs text-slate-400">
            <p className="text-2xl mb-1">🎙️</p>
            No messages sent yet. Type a note or send a voice message to get started!
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-2 min-h-5 text-[11px] font-medium text-[#30D158]">
        {typingUsers.length ? `${typingUsers.join(", ")} is typing...` : ""}
      </div>

      {/* Voice Recorder active state or standard text area */}
      {isRecording ? (
        <div className="mt-2 p-3 rounded-2xl bg-[#FF453A]/15 border border-[#FF453A]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#FF453A] font-medium text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A]" />
            Recording Voice Note: {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
            {String(recordingSeconds % 60).padStart(2, "0")}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelVoiceRecording}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors duration-150"
              title="Discard Recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={stopAndSendVoiceNote}
              className="px-3.5 py-1.5 rounded-xl bg-[#FF453A] hover:bg-[#FF453A]/80 font-medium text-white text-xs flex items-center gap-1.5 transition-colors duration-150"
            >
              <Square className="h-3.5 w-3.5 fill-white" /> Send Voice Note
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type message... (Press Enter to send)"
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#007AFF] transition-colors duration-150 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startVoiceRecording}
              className="p-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 border border-white/10 font-medium text-xs flex items-center gap-1.5 transition-colors duration-150"
              title="Record Voice Note"
            >
              <Mic className="h-4 w-4 text-slate-300" />
              Voice Note
            </button>

            <button
              type="submit"
              className="bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#004999] text-white flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors duration-150 border-none shadow-none"
            >
              <Send className="h-3.5 w-3.5" /> Send Message
            </button>
          </div>
        </form>
      )}
    </motion.section>
  );
}

export default ChatBox;
