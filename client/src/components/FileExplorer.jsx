import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FilePlus,
  FolderPlus,
  Trash2,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

function getFileIcon(fileName) {
  if (fileName.endsWith(".jsx") || fileName.endsWith(".js") || fileName.endsWith(".ts")) {
    return <FileCode size={15} className="text-cyan-400" />;
  }
  if (fileName.endsWith(".css")) {
    return <FileCode size={15} className="text-violet-400" />;
  }
  if (fileName.endsWith(".html")) {
    return <FileCode size={15} className="text-amber-400" />;
  }
  if (fileName.endsWith(".json")) {
    return <FileCode size={15} className="text-emerald-400" />;
  }
  return <FileText size={15} className="text-slate-400" />;
}

function FileExplorer({
  files,
  activeFileId,
  isTeamLeader = false,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
}) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleCreateFileSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onCreateFile(nameInput.trim());
    setNameInput("");
    setIsCreatingFile(false);
  };

  const handleCreateFolderSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onCreateFolder(nameInput.trim());
    setNameInput("");
    setIsCreatingFolder(false);
  };

  const handleDeleteClick = (e, fileId) => {
    e.stopPropagation();
    if (!isTeamLeader) {
      toast.error("Only the Team Leader has permission to delete workspace files.");
      return;
    }
    onDeleteFile(fileId);
  };

  return (
    <div className="glass-card flex flex-col h-full border border-white/10 p-3 bg-slate-950/80">
      {/* Explorer Top Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
          <FolderOpen size={16} className="text-violet-400" />
          <span>Project Explorer</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsCreatingFile(true);
              setIsCreatingFolder(false);
              setNameInput("");
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
            title="New File"
          >
            <FilePlus size={15} />
          </button>
          <button
            onClick={() => {
              setIsCreatingFolder(true);
              setIsCreatingFile(false);
              setNameInput("");
            }}
            className="p-1 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
            title="New Folder"
          >
            <FolderPlus size={15} />
          </button>
        </div>
      </div>

      {/* Inline Create Input Forms */}
      {isCreatingFile && (
        <form onSubmit={handleCreateFileSubmit} className="mb-2 flex gap-1">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Filename.jsx..."
            className="input-shell text-xs py-1 px-2 font-mono"
            autoFocus
          />
          <button type="submit" className="gradient-button text-[10px] px-2 py-1 font-bold">
            Add
          </button>
        </form>
      )}

      {isCreatingFolder && (
        <form onSubmit={handleCreateFolderSubmit} className="mb-2 flex gap-1">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="FolderName..."
            className="input-shell text-xs py-1 px-2 font-mono"
            autoFocus
          />
          <button type="submit" className="gradient-button text-[10px] px-2 py-1 font-bold">
            Add
          </button>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin text-xs">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition ${
                isActive
                  ? "bg-violet-500/20 text-white border border-violet-500/30 font-semibold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {getFileIcon(file.name)}
                <span className="truncate font-mono text-xs">{file.name}</span>
              </div>

              {files.length > 1 && (
                isTeamLeader ? (
                  <button
                    onClick={(e) => handleDeleteClick(e, file.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Delete File (Team Leader Only)"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <span
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 cursor-not-allowed"
                    title="Only Team Leader can delete files"
                  >
                    <Lock size={12} />
                  </span>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FileExplorer;
